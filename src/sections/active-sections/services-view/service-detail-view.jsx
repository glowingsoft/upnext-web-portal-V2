import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { useTabs } from 'src/hooks/use-tabs';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { ServiceGeneralTab } from './components/service-general-tab';
import { ServiceReviewsTab } from './components/service-reviews-tab';
import { useGetServiceByIdQuery } from 'src/store/Reducer/services-api';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';

// ----------------------------------------------------------------------

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_KEY = { Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday', Fri: 'friday', Sat: 'saturday', Sun: 'sunday' };

const DENSE_INTERVALS_THRESHOLD = 6;

function ServiceSlotsTab({ service }) {
  const { t } = useTranslate();
  const slots = [...(service.slots || [])].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
  const todayShort = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [expandedDays, setExpandedDays] = useState({});
  const toggleDay = (day) => setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          {/* Session info chips */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
            {service.durationMins && (
              <Chip
                icon={<Iconify icon="solar:clock-circle-bold" width={16} />}
                label={t('sessionMins', { mins: service.durationMins })}
                variant="soft"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}
            {service.gapBetweenSlotMins != null && (
              <Chip
                icon={<Iconify icon="solar:hourglass-bold" width={16} />}
                label={t('gapMins', { mins: service.gapBetweenSlotMins })}
                variant="soft"
                color="info"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>

          <Stack spacing={1.5}>
            {slots.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('noSlotInfoAvailable')}</Typography>
            )}
            {slots.map((slot) => {
              const isToday = slot.dayOfWeek === todayShort;
              return (
                <Card
                  key={slot.dayOfWeek}
                  sx={{
                    px: 2.5,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    border: '1px solid',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    boxShadow: 'none',
                    borderRadius: 2,
                    bgcolor: isToday ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04) : 'background.paper',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => `0 8px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
                    },
                  }}
                >
                  {/* Day label */}
                  <Box sx={{ width: 110, flexShrink: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Iconify icon="solar:calendar-minimalistic-bold" width={15} sx={{ color: isToday ? 'primary.main' : 'text.disabled' }} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ color: isToday ? 'primary.main' : 'text.primary', textTransform: 'capitalize' }}
                      >
                        {DAY_FULL_KEY[slot.dayOfWeek] ? t(DAY_FULL_KEY[slot.dayOfWeek]) : slot.dayOfWeek}
                      </Typography>
                    </Stack>
                    {isToday && (
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, ml: '22px' }}>
                        {t('today')}
                      </Typography>
                    )}
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Status + intervals */}
                  {slot.isOpen ? (
                    (() => {
                      const intervals = slot.intervals || [];
                      const isDense = intervals.length > DENSE_INTERVALS_THRESHOLD;
                      const isExpanded = expandedDays[slot.dayOfWeek];

                      const summaryChip = (
                        <Box
                          sx={{
                            px: 1.5, py: 0.5,
                            borderRadius: 1,
                            bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
                            border: '1px solid',
                            borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.2),
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} sx={{ color: 'success.dark' }}>
                            {intervals[0].open} – {intervals[intervals.length - 1].close} · {t('slotsCount', { count: intervals.length })}
                          </Typography>
                        </Box>
                      );

                      const toggleButton = (
                        <Button
                          size="small"
                          onClick={() => toggleDay(slot.dayOfWeek)}
                          endIcon={<Iconify icon={isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} width={14} />}
                          sx={{ typography: 'caption', fontWeight: 700, minWidth: 'auto', py: 0.25, px: 1 }}
                        >
                          {isExpanded ? t('showLessSlots') : t('showAllSlots')}
                        </Button>
                      );

                      if (!isDense) {
                        return (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {intervals.map((iv, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  px: 1.5, py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
                                  border: '1px solid',
                                  borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.2),
                                }}
                              >
                                <Typography variant="caption" fontWeight={700} sx={{ color: 'success.dark' }}>
                                  {iv.open} – {iv.close}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        );
                      }

                      return (
                        <Stack spacing={1} sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                            {summaryChip}
                            {toggleButton}
                          </Stack>

                          {isExpanded && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {intervals.map((iv, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    px: 1.5, py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
                                    border: '1px solid',
                                    borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.2),
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={700} sx={{ color: 'success.dark' }}>
                                    {iv.open} – {iv.close}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      );
                    })()
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                      {t('closed')}
                    </Typography>
                  )}

                  {/* Open/Closed badge on right */}
                  <Box sx={{ ml: 'auto', flexShrink: 0 }}>
                    <Box
                      sx={{
                        px: 1.1, py: 0.3,
                        borderRadius: 0.75,
                        bgcolor: slot.isOpen ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
                        color: slot.isOpen ? '#15803d' : '#dc2626',
                        fontSize: 11, fontWeight: 700, lineHeight: 1.6,
                      }}
                    >
                      {slot.isOpen ? t('open') : t('closed')}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Grid>

        {/* Right: quick summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2.5, overflow: 'hidden' }}>
            {/* Header */}
            <Box
              sx={{
                px: 2.5, py: 2,
                background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}
            >
              <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'rgba(255,255,255,0.75)' }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'common.white' }}>
                {t('scheduleSummary')}
              </Typography>
              <Box
                sx={{
                  ml: 'auto', px: 1.1, py: 0.3,
                  borderRadius: 0.75,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 700 }}>
                  {t('daysOpenCount', { open: slots.filter((s) => s.isOpen).length, total: DAY_ORDER.length })}
                </Typography>
              </Box>
            </Box>

            {/* Day rows */}
            <Stack sx={{ p: 1.5 }} spacing={0.5}>
              {DAY_ORDER.map((day) => {
                const slot = slots.find((s) => s.dayOfWeek === day);
                const isToday = day === todayShort;
                const isOpen = slot?.isOpen;
                const timeLabel = isOpen
                  ? slot.intervals?.[0] ? `${slot.intervals[0].open} – ${slot.intervals[0].close}` : t('open')
                  : t('closed');

                return (
                  <Box
                    key={day}
                    sx={{
                      px: 1.5, py: 0.9,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid',
                      borderColor: isToday ? 'primary.main' : 'transparent',
                      bgcolor: isToday
                        ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06)
                        : isOpen ? 'rgba(34,197,94,0.04)' : 'transparent',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          bgcolor: isOpen ? '#22c55e' : 'text.disabled',
                          boxShadow: isOpen ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={isToday ? 700 : 500}
                        sx={{ color: isToday ? 'primary.main' : isOpen ? 'text.primary' : 'text.disabled' }}
                      >
                        {t(DAY_FULL_KEY[day])}
                      </Typography>
                      {isToday && (
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1 }}>
                          {t('today')}
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: isOpen ? 'text.primary' : 'text.disabled' }}
                    >
                      {timeLabel}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ----------------------------------------------------------------------

function getPromotionPrice(price, discountType, discountValue) {
  const basePrice = Number(String(price ?? '').replace(/[^0-9.]/g, ''));
  const discount = Number(discountValue);

  if (!Number.isFinite(basePrice) || !Number.isFinite(discount)) return null;
  if (discountType === 'percentage') return Math.max(0, basePrice - (basePrice * discount) / 100);
  if (discountType === 'flat' || discountType === 'fixed') return Math.max(0, basePrice - discount);

  return basePrice;
}

const PROMO_ACCENT = '#a68e6b';
const PROMO_CREAM = '#fffaf0';

function formatCountdown(msRemaining) {
  if (msRemaining == null) return null;
  if (msRemaining <= 0) return null;

  const days = Math.floor(msRemaining / 86400000);
  const hours = Math.floor((msRemaining % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;

  const mins = Math.floor((msRemaining % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;

  return `${mins}m left`;
}

function usePromotionCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  return new Date(expiresAt).getTime() - now;
}

function PromotionBanner({ promotion, price }) {
  const { t } = useTranslate();
  const msRemaining = usePromotionCountdown(promotion?.expiresAt);

  if (!promotion) return null;

  const discountDisplay = promotion.discountType === 'percentage' ? `${promotion.discount}%` : fCurrency(promotion.discount);
  const finalPrice = getPromotionPrice(price, promotion.discountType, promotion.discount);
  const countdownLabel = formatCountdown(msRemaining);

  return (
    <Box
      sx={{
        mt: 2,
        px: { xs: 2.5, md: 3 },
        py: { xs: 2, md: 2.25 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.24),
        bgcolor: PROMO_CREAM,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Iconify icon="solar:tag-price-bold" width={24} sx={{ color: PROMO_ACCENT, flexShrink: 0 }} />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ color: PROMO_ACCENT }}>
          {t('discountOff', { discount: discountDisplay })} — {promotion.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {t('promoCode')}: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{promotion.promoCode}</Box>
        </Typography>
        {promotion.expiresAt && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {t('validUntil')} {fDate(promotion.expiresAt)}
          </Typography>
        )}
      </Box>

      {Number.isFinite(finalPrice) && (
        <Stack alignItems="flex-end" spacing={0.5}>
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography variant="h6" fontWeight={800} sx={{ color: PROMO_ACCENT }}>
              {fCurrency(finalPrice)}
            </Typography>
            {Number(price) > finalPrice && (
              <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                {fCurrency(price)}
              </Typography>
            )}
          </Stack>
          {countdownLabel && (
            <Box
              component="span"
              sx={{
                px: 0.9,
                py: 0.15,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                color: PROMO_ACCENT,
                bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
              }}
            >
              {countdownLabel}
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

export const ServiceDetailView = memo(({ service, promotion }) => {
  const { t } = useTranslate();
  const tabs = useTabs('general');
  const router = useRouter();
  const pathname = usePathname();
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isProvider = userType === 'provider' || userType === 'business';
  const isCustomer = userType === 'customer' || userType === 'user';
  const primaryImage = (Array.isArray(service.photos) ? service.photos[0] : service.photos) || null;
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const businessName = service.business?.businessName || '';
  const [businessImageFailed, setBusinessImageFailed] = useState(false);
  const showProviderEdit = isProvider && pathname.startsWith(paths.dashboard.services) && Boolean(service?._id);
  const isServiceAvailable = service.isAvailable !== false;

  const handleEditClick = () => {
    router.push(paths.dashboard.serviceEdit(service._id));
  };

  const TAB_SX = {
    minHeight: 56,
    textTransform: 'none',
    fontWeight: 700,
    px: 0,
    mx: 2.5,
    minWidth: 'auto',
    color: 'text.secondary',
    '&:hover': { color: 'text.primary' },
    '&.Mui-selected': { color: 'primary.main' },
  };

  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<Iconify width={16} height={16} icon="solar:alt-arrow-left-linear" />}
          onClick={() => router.back()}
          sx={{ color: 'text.primary', fontWeight: 800 }}
        >
          {t('back')}
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {/* Cover — static warm gradient, matches InfoCard palette */}
        <Box
          sx={{
            height: { xs: 160, md: 200 },
            position: 'relative',
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        >
          {showProviderEdit && (
            <Box
              component="button"
              onClick={handleEditClick}
              aria-label={t('editService')}
              sx={{
                position: 'absolute', top: 14, right: 14, zIndex: 4,
                width: 40, height: 40, borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'primary.main', color: 'primary.contrastText',
                boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Iconify icon="solar:pen-bold" width={19} />
            </Box>
          )}
        </Box>

        {/* Info Bar */}
        <Box
          sx={{
            position: 'relative',
            minHeight: 80,
            px: { xs: 2.5, md: 3 },
            py: 2,
            pl: { xs: 18, md: 22 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Rounded rectangle avatar overlapping cover */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 20, md: 40 },
              top: { xs: -24, md: -30 },
              zIndex: 5,
              width: { xs: 88, md: 104 },
              height: { xs: 88, md: 104 },
              borderRadius: 2.5,
              overflow: 'hidden',
              border: '4px solid #fff',
              bgcolor: '#eadfc8',
              boxShadow: (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.28)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {primaryImage && !imageLoadFailed ? (
              <Box
                component="img"
                src={primaryImage}
                alt={service.name}
                onError={() => setImageLoadFailed(true)}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Iconify icon="solar:shield-user-bold" width={36} sx={{ color: '#b79a73' }} />
            )}
          </Box>

          {/* Name + Category */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
              {service.name}
            </Typography>
            {service.category && (
              <Chip
                size="small"
                label={service.category}
                icon={<Iconify icon="solar:tag-bold" width={14} />}
                sx={{
                  mt: 0.75,
                  height: 24,
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
                  '& .MuiChip-icon': { color: 'primary.contrastText', ml: 0.75 },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => `0 6px 14px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}`,
                  },
                }}
              />
            )}
            {businessName && (
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75 }}>
                <Avatar
                  src={!businessImageFailed ? service.business?.image : undefined}
                  onError={() => setBusinessImageFailed(true)}
                  sx={{ width: 20, height: 20, fontSize: 11, bgcolor: 'primary.lighter', color: 'primary.dark' }}
                >
                  {businessName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {businessName}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Availability chip on right */}
          <Chip
            size="small"
            variant="soft"
            color={isServiceAvailable ? 'success' : 'error'}
            icon={<Iconify icon={isServiceAvailable ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} />}
            label={isServiceAvailable ? t('available') : t('unavailable')}
            sx={{ ml: 'auto', flexShrink: 0, fontWeight: 700 }}
          />
        </Box>

        {/* Tabs Bar */}
        <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{
              minHeight: 56,
              '& .MuiTabs-indicator': { height: 2, borderRadius: 2, bgcolor: 'primary.main' },
            }}
          >
            <Tab value="general" label={t('overview')} icon={<Iconify icon="solar:home-angle-bold-duotone" width={18} />} iconPosition="start" sx={TAB_SX} />
            {!isCustomer && (
              <Tab value="slots" label={t('slots')} icon={<Iconify icon="solar:clock-circle-bold-duotone" width={18} />} iconPosition="start" sx={TAB_SX} />
            )}
            <Tab value="reviews" label={t('reviewsLabel')} icon={<Iconify icon="solar:star-bold" width={18} />} iconPosition="start" sx={TAB_SX} />
          </Tabs>
        </Box>
      </Card>

      <PromotionBanner promotion={promotion} price={service.price} />

      {/* Tab Content */}
      <Box key={tabs.value} sx={{ animation: 'fadeSlideIn 220ms ease-out' }}>
        {tabs.value === 'general' && <ServiceGeneralTab service={service} promotion={promotion} />}
        {!isCustomer && tabs.value === 'slots' && <ServiceSlotsTab service={service} />}
        {tabs.value === 'reviews' && <ServiceReviewsTab service={service} />}
      </Box>
    </Container>
  );
});

// ----------------------------------------------------------------------

function mapServiceApiData(raw) {
  const validPhotos = (raw.photos || []).filter((p) => p && !p.includes('noimg'));

  const openDays = (raw.slots || [])
    .filter((s) => s.isOpen)
    .map((s) => s.dayOfWeek)
    .join(', ');

  const bookHours = raw.howLateCanBook?.hours;
  const bookMins = raw.howLateCanBook?.mins;
  const cancelHours = raw.howLateCanCancel?.hours;
  const cancelMins = raw.howLateCanCancel?.mins;

  const categoryName =
    raw.category && typeof raw.category === 'object'
      ? raw.category.name || raw.category.translations?.en || null
      : null;

  return {
    _id: raw._id,
    name: raw.name,
    category: categoryName,
    type: raw.preferredServiceType?.optionName || raw.serviceType,
    durationMins: raw.sessionSlotMins,
    price: raw.price,
    isAvailable: raw.isAvailable,
    status: raw.status,
    photos: validPhotos,
    availability: openDays || null,
    slots: raw.slots || [],
    concurrentClients: raw.concurrentClients,
    gapBetweenSlotMins: raw.gapBetweenSlotMins,
    latestBookHours: bookHours != null ? bookHours : null,
    latestBookMins: bookMins != null ? bookMins : null,
    latestCancelHours: cancelHours != null ? cancelHours : null,
    latestCancelMins: cancelMins != null ? cancelMins : null,
    refundPercentage: raw.refundPercentage != null ? raw.refundPercentage : null,
    refundRules: raw.refundRules || null,
    description: raw.description || '',
    averageRating: raw.rating?.avgRating ?? raw.avgRating ?? 0,
    totalReviews: raw.rating?.totalReviews ?? raw.totalReviews ?? 0,
    ratingBreakdown: raw.rating?.ratingCount || {},
    reviews: [],
    business: raw.business,
    suggestedServices: raw.suggestedServices || [],
  };
}

// ----------------------------------------------------------------------

function ServiceDetailSkeleton() {
  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={90} height={34} />
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
        <Box sx={{ position: 'relative', minHeight: 80, px: 3, py: 2, pl: { xs: 18, md: 22 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton
            variant="rounded"
            width={104} height={104}
            sx={{ position: 'absolute', left: { xs: 20, md: 40 }, top: { xs: -24, md: -30 }, borderRadius: 2.5, border: 'solid 4px #fff', flexShrink: 0 }}
          />
          <Box>
            <Skeleton variant="text" width={200} height={34} />
            <Skeleton variant="text" width={100} height={20} sx={{ mt: 0.3 }} />
          </Box>
          <Skeleton variant="rounded" width={90} height={28} sx={{ ml: 'auto', borderRadius: 999 }} />
        </Box>
        <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider', py: 1.5 }}>
          <Stack direction="row" spacing={0}>
            {[120, 80, 100].map((w, i) => (
              <Skeleton key={i} variant="text" width={w} height={36} sx={{ mx: 2.5 }} />
            ))}
          </Stack>
        </Box>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" sx={{ borderRadius: 1.5, aspectRatio: '1 / 1' }} />
                ))}
              </Box>
              <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2 }} />
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={68} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2.5 }} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

export function ServiceDetailPageView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const location = useLocation();

  // "Claim Offer" on the marketplace list lands here with the promotion it was applied to passed
  // via state, so the discount can be shown as a banner on the service's own real page instead of
  // a separate promotion-shaped page.
  const promotion = location.state?.promotion;

  // Session location (set at login) — lets the backend compute real distance on this
  // service's suggestedServices, same as the marketplace list.
  const myLocation = getMyLocation();
  const hasRealMyLocation = isRealCoords(myLocation?.lat, myLocation?.lng);

  const { data, isLoading, isError } = useGetServiceByIdQuery(
    hasRealMyLocation ? { id, lat: myLocation.lat, lng: myLocation.lng } : id,
    { skip: !id }
  );

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="warning">{t('serviceNotFound')}</Alert>
      </Container>
    );
  }

  return <ServiceDetailView service={mapServiceApiData(data.data)} promotion={promotion} />;
}
