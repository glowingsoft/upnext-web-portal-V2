import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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

import { BusinessInfoCard } from '../../services-view/components/business-info-card';
import ServiceCard from '../../services-view/components/service-card-main';
import { BookingScheduleDialogs } from '../../sessions-view/components/booking-schedule-dialogs';
import { getCancellationPolicy } from 'src/utils/cancellation-policy';

const DETAIL_ACCENT = '#b79a73';

const DAY_LABELS = {
  monday: 'mondayShort',
  tuesday: 'tuesdayShort',
  wednesday: 'wednesdayShort',
  thursday: 'thursdayShort',
  friday: 'fridayShort',
  saturday: 'saturdayShort',
  sunday: 'sundayShort',
};

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
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
}

function PriceInfoCard({ actualPrice, packagePrice, packageLabel }) {
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
      {/* Icon */}
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
        <Iconify icon="solar:tag-price-bold" width={17} sx={{ color: DETAIL_ACCENT }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: DETAIL_ACCENT, fontWeight: 900, letterSpacing: 1.2, lineHeight: 1, display: 'block' }}>
        {packageLabel}
      </Typography>

      {/* Package price — large */}
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.25 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 700,
            textDecoration: 'line-through',
            lineHeight: 1.1,
          }}
        >
          {actualPrice}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 900, lineHeight: 1.3 }}>
          {packagePrice}
        </Typography>
      </Stack>
      </Box>
    </Box>
  );
}

function PolicyTimeRow({ label, hours, mins, hoursLabel, minsLabel }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        transition: 'background-color 0.2s ease, transform 0.15s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(3px)',
        },
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 1, display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={3}>
        <Stack spacing={0.25}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {hoursLabel}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {hours ?? '—'}
          </Typography>
        </Stack>
        <Stack spacing={0.25}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {minsLabel}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {mins ?? '0'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function PolicyValueRow({ label, value }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        transition: 'background-color 0.2s ease, transform 0.15s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(3px)',
        },
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function StarRating({ rating }) {
  return <Rating value={Number(rating) || 0} precision={0.5} readOnly size="small" />;
}

function buildDaysAvailable(slots, t) {
  if (!slots?.operatingHours) return null;

  return Object.entries(slots.operatingHours)
    .filter(([, value]) => value.enabled)
    .map(([day]) => (DAY_LABELS[day] ? t(DAY_LABELS[day]) : day))
    .join(' - ');
}

function buildSlotsRange(slots) {
  if (!slots?.operatingHours) return null;

  const allIntervals = Object.values(slots.operatingHours)
    .filter((value) => value.enabled)
    .flatMap((value) => value.intervals || []);

  if (!allIntervals.length) return null;

  const starts = allIntervals.map((interval) => interval.start).sort();
  const ends = allIntervals.map((interval) => interval.end).sort();

  return `${starts[0]} - ${ends[ends.length - 1]}`;
}

export const PackageGeneralTab = memo(({ packageItem, promotion }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const userType = user?.user?.accountState?.userType ?? user?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const isAdmin = userType === 'admin';
  const isProvider = userType === 'provider' || userType === 'business';
  const [bookingItem, setBookingItem] = useState(null);
  const [booked, setBooked] = useState(false);

  const autoAccept = packageItem?.autoAccept === true || packageItem?.autoAccept === 'true';
  const bookBtnLabel = booked
    ? autoAccept
      ? t('confirmBooking')
      : t('requestedBooking')
    : promotion
      ? t('claimOffer', { defaultValue: 'Claim Offer' })
      : t('requestPackage');
  const includedServices = packageItem.services || [];
  const actualPrice = packageItem.actualPrice || 0;
  const packagePrice = packageItem.packagePrice || 0;
  const savings = actualPrice - packagePrice;
  const reviews = packageItem.reviews || [];
  const totalReviews = packageItem.totalReviews ?? reviews.length;
  const avgFromReviews = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : null;
  const averageRating = avgFromReviews ?? Number(packageItem.averageRating || 0);
  const averageRatingText = Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0';
  const apiRatingBreakdown = packageItem.ratingBreakdown || {};
  const hasApiRatingBreakdown = Object.values(apiRatingBreakdown).some((count) => Number(count) > 0);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: hasApiRatingBreakdown
      ? Number(apiRatingBreakdown[star] ?? apiRatingBreakdown[String(star)] ?? 0)
      : reviews.filter((item) => Number(item.rating) === star).length,
  }));

  const daysAvailable = buildDaysAvailable(packageItem.slots, t);
  const slotsRange = buildSlotsRange(packageItem.slots);
  const suggestedPackages = (packageItem.suggestedPackages || packageItem.suggestedServices || []).map((item) => ({
    ...item,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  }));
  const cancellationPolicy = getCancellationPolicy(packageItem.cancellationPolicy);
  const policyItems = [
    {
      icon: cancellationPolicy.value === 'non_refundable' ? 'solar:close-circle-bold' : 'solar:wallet-money-bold',
      palette: cancellationPolicy.value === 'non_refundable' ? 'warning' : 'success',
      label: t('cancellationPolicy', { defaultValue: 'Cancellation policy' }),
      value: t(cancellationPolicy.labelKey, { defaultValue: cancellationPolicy.label }),
    },
    ...(daysAvailable
      ? [
          {
            icon: 'solar:calendar-bold',
            palette: 'primary',
            label: t('daysAvailable'),
            value: daysAvailable,
          },
        ]
      : []),
    ...(slotsRange
      ? [
          {
            icon: 'solar:clock-circle-bold',
            palette: 'secondary',
            label: t('timeRange'),
            value: slotsRange,
          },
        ]
      : []),
  ];

  const createBookingPayload = (item) => ({
    ...item,
    name: item?.name || packageItem?.name || packageItem?.title || t('package'),
    image: item?.image || item?.photo || item?.photos?.[0] || item?.coverImage,
    price: item?.price ?? packageItem?.packagePrice ?? packageItem?.price,
    duration:
      item?.duration ||
      (item?.durationMins ? `${item.durationMins} ${t('mins')}` : packageItem?.duration || (packageItem?.durationMins ? `${packageItem.durationMins} ${t('mins')}` : undefined)),
  });

  const handleOpenPackageBooking = () => {
    setBookingItem(createBookingPayload(packageItem));
  };

  const handleViewService = (service) => {
    const serviceId = service?.id || service?._id;
    if (!serviceId) return;
    router.push(isAdmin ? paths.adminDashboard.serviceDetails(serviceId) : paths.dashboard.serviceDetails(serviceId));
  };

  const handleViewPackage = (pkg) => {
    const packageId = pkg?.id || pkg?._id;
    if (!packageId) return;
    router.push(isAdmin ? paths.adminDashboard.packageDetails(packageId) : paths.dashboard.packageDetails(packageId));
  };

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
              <InfoCard icon="solar:layers-bold" label={t('includedServices')} value={`${includedServices.length}`} />
              <PriceInfoCard packageLabel={t('price')} actualPrice={fCurrency(actualPrice)} packagePrice={fCurrency(packagePrice)} />
              <InfoCard icon="solar:dollar-minimalistic-bold" label={t('savings')} value={fCurrency(savings)} />
              {promotion ? (
                <InfoCard icon="solar:tag-price-bold" label={t('discountType')} value={promotion.discountType ? t(promotion.discountType) : null} />
              ) : (
                <InfoCard icon="solar:shield-user-bold" label={t('packageType')} value={packageItem.type || '-'} />
              )}
              <InfoCard
                icon="solar:users-group-rounded-bold"
                label={t('maxConcurrentClients')}
                value={packageItem.concurrentClients ? `${packageItem.concurrentClients}` : null}
              />
            </Box>

            {/* Description */}
            {packageItem.description && (
              <Card sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  {t('description')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {packageItem.description}
                </Typography>
              </Card>
            )}

            {/* Photos */}
            <PhotosGallery photos={packageItem.packageMedia} altPrefix="Package photo" />

            {/* Business */}
            <BusinessInfoCard
              business={packageItem.business}
              onView={
                packageItem.business?._id
                  ? () => {
                      if (isProvider) {
                        router.push(paths.dashboard.businessProfile);
                      } else if (isAdmin) {
                        router.push(paths.adminDashboard.providerDetails(packageItem.business._id));
                      } else {
                        router.push(paths.dashboard.providerDetails(packageItem.business._id));
                      }
                    }
                  : null
              }
            />

            {/* Included Services */}
            <Card sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="solar:layers-bold" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">{t('includedServices')}</Typography>
              </Stack>

              {includedServices?.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('noServicesIncluded')}
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {includedServices.map((service) => {
                    const serviceRatingValue = service.rating ?? service.averageRating ?? averageRating ?? 0;
                    const serviceRating = Number(serviceRatingValue).toFixed(1);
                    const serviceReviewCount = service.reviewCount ?? service.reviewsCount ?? 0;
                    const serviceDescription = service.description || t('professionalServiceTailoredPackage');
                    const serviceDuration = service.durationMins ? `${service.durationMins} ${t('mins')}` : t('mins');
                    const serviceCardItem = {
                      ...service,
                      image: service.image || service.coverImage,
                      description: serviceDescription,
                      duration: service.duration || serviceDuration,
                      rating: serviceRating,
                      reviewCount: serviceReviewCount,
                      distance: service.distanceKm,
                    };
                    return (
                      <Grid key={service._id} item xs={12} sm={6}>
                        <ServiceCard svc={serviceCardItem} hideBook hideDistance onView={() => handleViewService(service)} />
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Card>

            {!isCustomer && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    }}
                  >
                    <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {t('policies')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t('bookingCancellationRules')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1.5}>
                  {policyItems.map((item) => (
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
            )}
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Rating + Book Now + Quick info (sticky) */}
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
              {t('basedOnReviews', { count: totalReviews })}
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
                onClick={() => !booked && handleOpenPackageBooking()}
                sx={{ mt: 3, mb: 1.5, fontWeight: 700, borderRadius: 10, ...(booked && { pointerEvents: 'none' }) }}
              >
                {bookBtnLabel}
              </Button>
            )}

            <Divider sx={{ my: 3 }} />
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {[
                {
                  icon: 'solar:tag-price-bold',
                  value: packagePrice ? fCurrency(packagePrice) : null,
                },
                {
                  icon: 'solar:dollar-minimalistic-bold',
                  value: savings > 0 ? t('saveAmount', { amount: fCurrency(savings) }) : null,
                },
                {
                  icon: 'solar:layers-bold',
                  value: includedServices.length ? t('servicesIncludedCount', { count: includedServices.length }) : null,
                },
                { icon: 'solar:calendar-bold', value: daysAvailable },
                { icon: 'solar:clock-circle-bold', value: slotsRange },
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
        {isCustomer && suggestedPackages?.length > 0 && (
          <Grid item xs={12} md={12}>
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {t('suggestedPackages')}
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {suggestedPackages?.map((pkg) => (
                  <ServiceCard key={pkg._id || pkg.id} svc={pkg} onView={() => handleViewPackage(pkg)} />
                ))}
              </Box>
            </>
          </Grid>
        )}
      </Grid>

      <BookingScheduleDialogs
        bookingItem={bookingItem}
        title={promotion ? t('claimOffer', { defaultValue: 'Claim Offer' }) : autoAccept ? t('confirmPackage') : t('requestPackage')}
        onCloseBooking={() => setBookingItem(null)}
        onBooked={() => setBooked(true)}
        type="package"
        autoAccept={autoAccept}
        initialPromoCode={promotion?.promoCode}
      />
    </Box>
  );
});
