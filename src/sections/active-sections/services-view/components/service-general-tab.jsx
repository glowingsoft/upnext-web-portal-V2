import { Button, Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { PhotosGallery } from 'src/components/photos-gallery';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';
import { BookingScheduleDialogs } from '../../sessions-view/components/booking-schedule-dialogs';
import { BusinessInfoCard } from './business-info-card';
import ServiceCard from './service-card-main';

const DETAIL_ACCENT = '#b79a73';

function normalizeSuggestedService(item) {
  const durationMins = item.durationMins ?? item.sessionSlotMins;
  return {
    ...item,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    reviewCount: item.reviewCount ?? item.totalReviews ?? 0,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  };
}

function InfoCard({ icon, label, value }) {
  const { t } = useTranslate();

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
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.28),
          bgcolor: '#fff3d8',
          boxShadow: (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
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
          {value || t('noData')}
        </Typography>
      </Box>
    </Box>
  );
}

function StarRating({ rating }) {
  return <Rating value={Number(rating) || 0} precision={0.5} readOnly size="small" />;
}

export const ServiceGeneralTab = memo(({ service, promotion }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const userType = user?.user?.accountState?.userType ?? user?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const isAdmin = userType === 'admin';
  const isProvider = userType === 'provider' || userType === 'business';
  const [bookingItem, setBookingItem] = useState(null);
  const [booked, setBooked] = useState(false);

  const autoAccept = true;
  const bookBtnLabel = booked
    ? t('confirmedBooking')
    : promotion
      ? t('claimOffer', { defaultValue: 'Claim Offer' })
      : t('requestService');
  const displayPrice = service.price;
  const duration = service.durationMins ? `${service.durationMins} ${t('mins')}` : '-';
  const availability = service.availability || '-';
  const serviceType = service.type || '-';
  const category = service.category || '-';
  const priceRange = service.priceRange || (displayPrice ? fCurrency(displayPrice) : '-');
  const gapLabel = service.gapBetweenSlotMins ? `${service.gapBetweenSlotMins} ${t('mins')}` : null;
  const concurrentLabel = service.concurrentClients ? `${service.concurrentClients}` : null;
  const totalReviews = service.totalReviews ?? (service.reviews?.length ?? 0);

  const reviews = service.reviews || [];
  const avgFromReviews = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : null;
  const averageRating = avgFromReviews ?? Number(service.averageRating || 0);
  const averageRatingText = Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0';
  const apiRatingBreakdown = service.ratingBreakdown || {};
  const hasApiRatingBreakdown = Object.values(apiRatingBreakdown).some((count) => Number(count) > 0);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: hasApiRatingBreakdown
      ? Number(apiRatingBreakdown[star] ?? apiRatingBreakdown[String(star)] ?? 0)
      : reviews.filter((item) => Number(item.rating) === star).length,
  }));

  const handleViewService = (selectedService) => {
    const serviceId = selectedService?._id || selectedService?.id;
    if (!serviceId) return;
    router.push(isAdmin ? paths.adminDashboard.serviceDetails(serviceId) : paths.dashboard.serviceDetails(serviceId));
  };

  const suggestedServices = (service.suggestedServices || []).map(normalizeSuggestedService);

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
        {/* LEFT COLUMN: About + Stats + Policies + Suggested */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
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
              {promotion ? (
                <InfoCard icon="solar:tag-price-bold" label={t('discountType')} value={promotion.discountType ? t(promotion.discountType) : null} color="primary.main" />
              ) : (
                <InfoCard icon="solar:shield-user-bold" label={t('serviceType')} value={serviceType} color="primary.main" />
              )}
              <InfoCard icon="solar:clock-circle-bold" label={t('duration')} value={duration} color="info.main" />
              <InfoCard icon="solar:wallet-money-bold" label={t('price')} value={priceRange} color="success.main" />
              <InfoCard icon="solar:calendar-bold" label={t('availability')} value={availability} color="warning.main" />
              <InfoCard icon="solar:hourglass-bold" label={t('gapBetweenSlots')} value={gapLabel} color="error.light" />
              <InfoCard icon="solar:users-group-rounded-bold" label={t('maxConcurrentClients')} value={concurrentLabel} color="secondary.main" />
            </Box>

            {/* Description */}
            {service.description && (
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  {t('description')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {service.description}
                </Typography>
              </Card>
            )}

            {/* Photos */}
            <PhotosGallery photos={service.photos} altPrefix="Service photo" />

            {service.business?.businessName && (
              <BusinessInfoCard
                business={service.business}
                onView={
                  service.business._id
                    ? () => {
                        if (isProvider) {
                          router.push(paths.dashboard.businessProfile);
                        } else if (isAdmin) {
                          router.push(paths.adminDashboard.providerDetails(service.business._id));
                        } else {
                          router.push(paths.dashboard.providerDetails(service.business._id));
                        }
                      }
                    : null
                }
              />
            )}

            {/* Policies */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                  }}
                >
                  <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{t('policies')}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('bookingCancellationRules')}</Typography>
                </Box>
              </Stack>

              <Stack spacing={1.5}>
                {[
                  {
                    icon: 'solar:calendar-add-bold',
                    palette: 'info',
                    label: t('howLateCanSomeoneBook'),
                    value: `${service.latestBookHours ?? '—'}h ${service.latestBookMins ?? '0'}m`,
                  },
                  {
                    icon: 'solar:close-circle-bold',
                    palette: 'warning',
                    label: t('howLateCanSomeoneCancel'),
                    value: `${service.latestCancelHours ?? '—'}h ${service.latestCancelMins ?? '0'}m`,
                  },
                  ...(service.refundPercentage != null
                    ? [{ icon: 'solar:wallet-money-bold', palette: 'success', label: t('refundPercentagePercent'), value: `${service.refundPercentage}%` }]
                    : []),
                  ...(service.refundRules
                    ? [{ icon: 'solar:document-text-bold', palette: 'error', label: t('rulesForRefund'), value: service.refundRules }]
                    : []),
                ].map((item) => (
                  <Card
                    key={item.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2.5,
                      py: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      borderRadius: 2,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => `0 12px 32px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.1)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => varAlpha(theme.vars.palette[item.palette].mainChannel, 0.1),
                      }}
                    >
                      <Iconify icon={item.icon} width={20} sx={{ color: `${item.palette}.main` }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.1, lineHeight: 1, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.25, wordBreak: 'break-word' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Rating + Book Appointment + Quick info (sticky) */}
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
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Iconify icon="solar:star-bold" width={18} sx={{ color: 'warning.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                {t('rating')}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
                {averageRatingText}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                / 5
              </Typography>
            </Stack>

            <StarRating rating={averageRating} />

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
              {t('basedOnReviews', { count: totalReviews ?? 0 })}
            </Typography>

            <Stack spacing={0.75} sx={{ mt: 2 }}>
              {ratingBreakdown.map((item, index) => {
                const percent = totalReviews ? (item.count / totalReviews) * 100 : 0;
                return (
                  <Stack key={item.star} direction="row" alignItems="center" spacing={1}>
                    <Typography variant="caption" sx={{ width: 8, color: 'text.secondary' }}>
                      {item.star}
                    </Typography>
                    <Iconify icon="solar:star-bold" width={12} sx={{ color: 'warning.main' }} />
                    <Box
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 6,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.22),
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          '--bar-width': `${percent}%`,
                          width: 'var(--bar-width)',
                          height: '100%',
                          bgcolor: 'warning.main',
                          animation: `ratingBarGrow ${260 + index * 120}ms ease-out`,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ width: 28, textAlign: 'right', color: 'text.secondary' }}>
                      {item.count}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            {isCustomer && (
              <Button
                fullWidth
                size="large"
                variant={booked ? 'outlined' : 'contained'}
                color="primary"
                onClick={() => !booked && setBookingItem(service)}
                sx={{ mt: 3, mb: 1.5, fontWeight: 700, borderRadius: 10, ...(booked && { pointerEvents: 'none' }) }}
              >
                {bookBtnLabel}
              </Button>
            )}

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {[
                { icon: 'solar:dollar-minimalistic-bold', value: priceRange },
                { icon: 'solar:clock-circle-bold', value: duration },
                { icon: 'solar:calendar-bold', value: availability },
                { icon: 'solar:tag-price-bold', value: category },
              ]
                .filter((item) => item.value && item.value !== '-')
                .map((item) => (
                  <Stack key={item.icon} direction="row" alignItems="center" spacing={1.25}>
                    <Iconify icon={item.icon} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
            </Stack>

            <BookingScheduleDialogs
              bookingItem={bookingItem}
              title={promotion ? t('claimOffer', { defaultValue: 'Claim Offer' }) : t('confirmService', { defaultValue: 'Confirm Service' })}
              onCloseBooking={() => setBookingItem(null)}
              onBooked={() => setBooked(true)}
              type="service"
              autoAccept={autoAccept}
              initialPromoCode={promotion?.promoCode}
            />
          </Card>
        </Grid>

        {isCustomer && suggestedServices.length > 0 && (
          <Grid item xs={12} md={12}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                {t('suggestedServices')}
              </Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {suggestedServices.map((suggestedService) => (
                <ServiceCard key={suggestedService._id || suggestedService.id} svc={suggestedService} onView={() => handleViewService(suggestedService)} />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
});
