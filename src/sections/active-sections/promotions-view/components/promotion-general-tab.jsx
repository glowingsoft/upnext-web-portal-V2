import { Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { varAlpha } from 'src/theme/styles';

import { BookingScheduleDialogs } from '../../sessions-view/components/booking-schedule-dialogs';
import { BusinessInfoCard } from '../../services-view/components/business-info-card';
import PackageCard from '../../services-view/components/package-card';
import ServiceCard from '../../services-view/components/service-card-main';
import { PromotionUsageSection, RedemptionProgressCard } from './promotion-usage-tab';
import PromotionCard from './promotion-card';

const DETAIL_ACCENT = '#b79a73';

function InfoCard({ icon, label, value }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: '#eadfc8',
        borderRadius: 2,
        px: 2,
        py: 1.75,
        bgcolor: '#fff7e6',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          bgcolor: '#fff3d8',
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
          boxShadow: (theme) => `0 12px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: '#efe5d1',
          boxShadow: (theme) => `0 4px 12px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.06)}`,
        }}
      >
        <Iconify icon={icon} width={17} sx={{ color: DETAIL_ACCENT }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="overline"
          sx={{ color: DETAIL_ACCENT, fontWeight: 900, letterSpacing: 1.2, lineHeight: 1, display: 'block' }}
        >
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 900, lineHeight: 1.3, mt: 0.25 }}>
          {value ?? '-'}
        </Typography>
      </Box>
    </Box>
  );
}

function getPromotionPrice(price, discountType, discountValue) {
  const basePrice = Number(String(price ?? '').replace(/[^0-9.]/g, ''));
  const discount = Number(discountValue);

  if (!Number.isFinite(basePrice) || !Number.isFinite(discount)) return price;
  if (discountType === 'percentage') return Math.max(0, basePrice - (basePrice * discount) / 100);
  if (discountType === 'flat' || discountType === 'fixed') return Math.max(0, basePrice - discount);

  return basePrice;
}

export const PromotionGeneralTab = memo(({ promotion }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const promotionUserType = user?.user?.accountState?.userType;
  const isCustomer = promotionUserType === 'customer' || promotionUserType === 'user';
  const isAdmin = promotionUserType === 'admin';
  const isProvider = promotionUserType === 'provider' || promotionUserType === 'business';
  // Customer "Claim Offer" path: the hero already shows the service/package itself, so the
  // "Applied to" card here would just repeat it — it's only useful for the provider/admin view of
  // a promotion record, where the promotion (not a single item) is the page's subject.
  const isItemLinked = Boolean(promotion.isItemLinked);
  const [bookingItem, setBookingItem] = useState(null);
  const [booked, setBooked] = useState(false);

  const autoAccept = promotion?.autoAccept === true || promotion?.autoAccept === 'true';
  // Customer "Claim Offer" path: this button is the same action the marketplace card already
  // calls "Claim Offer" — keep that wording consistent instead of the provider/admin-facing
  // "Request/Confirm Promotion" copy, which stays as-is for that flow.
  const bookBtnLabel = booked
    ? autoAccept
      ? t('confirmBooking')
      : t('requestedBooking')
    : isItemLinked
      ? t('claimOffer')
      : autoAccept
        ? t('confirmPromotion')
        : t('requestPromotion');

  const appliedToItems = useMemo(() => {
    const list = promotion.appliedToList?.length ? promotion.appliedToList : promotion.appliedTo ? [promotion.appliedTo] : [];

    return list.map((appliedTo) => {
      const ratingValue = appliedTo.rating?.avgRating ?? appliedTo.rating ?? appliedTo.averageRating;
      const rating = ratingValue != null ? Number(ratingValue).toFixed(1) : '–';
      const kind = appliedTo.scope === 'packages' ? 'package' : appliedTo.scope === 'services' ? 'service' : appliedTo.type ? 'service' : 'package';

      return {
        ...appliedTo,
        kind,
        image: appliedTo.image || appliedTo.coverImage,
        description: appliedTo.description || t('professionalServiceTailoredPackage'),
        duration: appliedTo.duration || (appliedTo.durationMins ? `${appliedTo.durationMins} ${t('mins')}` : t('duration60Mins')),
        rating,
        reviewCount: appliedTo.rating?.totalReviews ?? appliedTo.reviewCount ?? appliedTo.reviewsCount ?? 0,
        distance: appliedTo.distance ?? appliedTo.distanceKm,
      };
    });
  }, [promotion.appliedToList, promotion.appliedTo, t]);

  const handleViewAppliedItem = (item) => {
    const itemId = item?.id || item?._id;
    if (!itemId) return;
    if (item.kind === 'package') {
      router.push(isAdmin ? paths.adminDashboard.packageDetails(itemId) : paths.dashboard.packageDetails(itemId));
    } else {
      router.push(isAdmin ? paths.adminDashboard.serviceDetails(itemId) : paths.dashboard.serviceDetails(itemId));
    }
  };

  const createBookingPayload = () => {
    const appliedTo = promotion.appliedTo || {};
    const appliedToPrice = appliedTo.price ?? promotion.price;

    return {
      ...appliedTo,
      ...promotion,
      name: promotion.name || appliedTo.name || t('promotion'),
      image: appliedTo.image || appliedTo.coverImage || promotion.image,
      originalPrice: appliedToPrice,
      price: getPromotionPrice(appliedToPrice, promotion.discountType, promotion.discountValue),
      duration: appliedTo.duration || (appliedTo.durationMins ? `${appliedTo.durationMins} ${t('mins')}` : promotion.duration),
      slots: appliedTo.slots || promotion.slots,
    };
  };

  const handleOpenPromotionBooking = () => {
    setBookingItem(createBookingPayload());
  };

  const handleViewPromotion = (suggestedPromotion) => {
    const promotionId = suggestedPromotion?._id || suggestedPromotion?.id;
    if (!promotionId) return;
    router.push(isAdmin ? paths.adminDashboard.promotionDetails(promotionId) : paths.dashboard.promotionDetails(promotionId));
  };

  const discountDisplay = promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : fCurrency(promotion.discountValue);
  const suggestedPromotions = promotion.suggestedPromotions || [];

  return (
    <Box
      sx={{
        p: 3,
        '@keyframes ratingBarGrow': {
          from: { width: 0 },
          to: { width: 'var(--bar-width)' },
        },
      }}
    >
      <Grid container spacing={2.5} alignItems="flex-start">
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            {isItemLinked && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:tag-price-bold" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">{t('promotion')}</Typography>
              </Stack>
            )}

            {/* Info / Stat Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                },
                gap: 2,
              }}
            >
              <InfoCard icon="solar:ticket-bold" label={t('promoCode')} value={promotion.promoCode} color="info.main" />
              <InfoCard icon="solar:tag-price-bold" label={t('discountType')} value={promotion.discountType ? t(promotion.discountType) : null} color="warning.main" />
              <InfoCard icon="solar:wallet-money-bold" label={t('discountValue')} value={discountDisplay} color="primary.main" />
              <InfoCard icon="solar:tag-bold" label={t('promoType')} value={promotion.promoType ? t(promotion.promoType) : null} color="success.main" />
              <InfoCard icon="solar:calendar-mark-bold" label={t('expiresAt')} value={promotion.expiresAt ? fDate(promotion.expiresAt) : null} color="error.main" />
            </Box>

            {/* Description */}
            {promotion.description && (
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  {t('description')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {promotion.description}
                </Typography>
              </Card>
            )}

            {/* Business */}
            <BusinessInfoCard
              business={promotion.business}
              onView={
                promotion.business?._id
                  ? () => {
                    if (isProvider) {
                      router.push(paths.dashboard.businessProfile);
                    } else if (isAdmin) {
                      router.push(paths.adminDashboard.providerDetails(promotion.business._id));
                    } else {
                      router.push(paths.dashboard.providerDetails(promotion.business._id));
                    }
                  }
                  : null
              }
            />

            {/* Promotion Usage — providers/admins only */}
            {!isCustomer && (
              <Card sx={{ p: 2.5 }}>
                <PromotionUsageSection promotion={promotion} />
              </Card>
            )}

            {/* Applied To — hidden on the customer "Claim Offer" path since the hero already
                shows this same item; only relevant for the provider/admin promotion-record view. */}
            {!isItemLinked && (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  transition: 'box-shadow 0.25s ease, background-color 0.25s ease, border-color 0.25s ease',
                }}
              >
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    minHeight: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:link-bold" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">{t('appliedTo')}</Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    {appliedToItems.map((item) =>
                      item.kind === 'package' ? (
                        <PackageCard key={item._id || item.id} pkg={item} onView={() => handleViewAppliedItem(item)} />
                      ) : (
                        <ServiceCard
                          key={item._id || item.id}
                          svc={item}
                          hideBook
                          onView={() => handleViewAppliedItem(item)}
                        />
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Redemption progress + Copy Code + Quick info (sticky) */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              p: { xs: 2.5, md: 3 },
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: { md: 'sticky' },
              top: { md: 24 },
              boxShadow: 'none',
            }}
          >
            {!isCustomer && (
              <Box sx={{ mb: 3 }}>
                <RedemptionProgressCard promotion={promotion} />
              </Box>
            )}

            {isCustomer && (
              <Button
                fullWidth
                size="large"
                variant={booked ? 'outlined' : 'contained'}
                color="primary"
                onClick={() => !booked && handleOpenPromotionBooking()}
                sx={{ mt: 3, mb: 1.5, fontWeight: 700, borderRadius: 10, ...(booked && { pointerEvents: 'none' }) }}
              >
                {bookBtnLabel}
              </Button>
            )}

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {[
                {
                  icon: 'solar:wallet-money-bold',
                  value: discountDisplay ? t('discountOff', { discount: discountDisplay }) : null,
                },
                { icon: 'solar:ticket-bold', value: promotion.promoCode },
                { icon: 'solar:tag-bold', value: promotion.promoType ? t(promotion.promoType) : null },
              ]
                .filter((item) => Boolean(item.value))
                .map((item) => (
                  <Stack key={item.icon} direction="row" alignItems="center" spacing={1.25}>
                    <Iconify icon={item.icon} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          </Card>
        </Grid>
        {/* Suggested Promotions — customer-only */}
        {isCustomer && suggestedPromotions?.length > 0 && (
          <Grid item xs={12} md={12}>
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {t('suggestedPromotions')}
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {suggestedPromotions?.map((suggestedPromotion) => (
                  <PromotionCard key={suggestedPromotion._id || suggestedPromotion.id} svc={suggestedPromotion} onView={() => handleViewPromotion(suggestedPromotion)} />
                ))}
              </Box>
            </>
          </Grid>
        )}
      </Grid>

      <BookingScheduleDialogs
        bookingItem={bookingItem}
        title={autoAccept ? t('confirmPromotion') : t('requestPromotion')}
        onCloseBooking={() => setBookingItem(null)}
        onBooked={() => setBooked(true)}
        type="promotion"
        autoAccept={autoAccept}
      />
    </Box>
  );
});
