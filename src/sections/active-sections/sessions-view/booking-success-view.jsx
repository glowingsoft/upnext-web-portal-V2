import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { useGetBookingByIdQuery } from 'src/store/Reducer/bookings-api';
import { varAlpha } from 'src/theme/styles';

import { normalizeBooking } from './utils/booking-normalizer';

// ----------------------------------------------------------------------

const ROW_ICON_COLORS = {
  service: { icon: 'solar:bill-list-bold', bg: 'primary' },
  provider: { icon: 'solar:shop-bold', bg: 'info' },
  address: { icon: 'solar:map-point-bold', bg: 'error' },
  date: { icon: 'solar:calendar-bold', bg: 'warning' },
  slot: { icon: 'solar:clock-circle-bold', bg: 'secondary' },
};

function SummaryRow({ variant, label, value, onCopy, caption }) {
  const { t } = useTranslate();
  if (!value) return null;

  const { icon, bg } = ROW_ICON_COLORS[variant];

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: (theme) => varAlpha(theme.vars.palette[bg].mainChannel, 0.12),
            }}
          >
            <Iconify icon={icon} width={17} sx={{ color: `${bg}.main` }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
            {label}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', textAlign: 'right' }} noWrap={!onCopy}>
            {value}
          </Typography>
          {onCopy && (
            <Tooltip title={t('copyFieldLabel', { field: label })}>
              <IconButton size="small" onClick={onCopy} sx={{ flexShrink: 0 }}>
                <Iconify icon="solar:copy-bold" width={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      {caption && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pl: '46px' }}>
          <Iconify icon="solar:lock-keyhole-unlocked-bold" width={12} sx={{ color: 'success.main', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
            {caption}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

function TicketNotches() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: -12,
          top: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'background.default',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: -12,
          top: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'background.default',
        }}
      />
    </>
  );
}

function BookingSuccessSkeleton() {
  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Container maxWidth="sm" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={180} />
          <Stack spacing={1.5} sx={{ p: 2.5 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={140} height={20} />
              </Stack>
            ))}
          </Stack>
        </Card>
        <Skeleton variant="rounded" height={52} sx={{ mt: 2.5, borderRadius: 10 }} />
      </Container>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function BookingSuccessView() {
  const { t, i18n } = useTranslate();
  const { id } = useParams();
  const router = useRouter();

  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const storageKey = id ? `bookingSuccessSeen:${id}` : null;
  const [alreadySeen] = useState(() => Boolean(storageKey && sessionStorage.getItem(storageKey)));

  useEffect(() => {
    if (storageKey && !alreadySeen) {
      sessionStorage.setItem(storageKey, '1');
    }
  }, [storageKey]);

  const shouldRedirect = !isCustomer || alreadySeen;

  useEffect(() => {
    if (shouldRedirect && id) {
      router.replace(paths.dashboard.bookingDetails(id));
    }
  }, [shouldRedirect, id, router]);

  const { data: bookingResponse, isLoading, isFetching } = useGetBookingByIdQuery(id, { skip: !id || shouldRedirect });

  // normalizeBooking formats day/date labels via the current dayjs locale — re-run it when
  // the language changes too, not just when the underlying data changes.
  const booking = useMemo(() => {
    const apiBooking = Array.isArray(bookingResponse?.data) ? bookingResponse.data[0] : bookingResponse?.data;
    return apiBooking ? normalizeBooking(apiBooking) : null;
  }, [bookingResponse?.data, i18n.resolvedLanguage]);

  if (shouldRedirect) {
    return null;
  }

  if (isLoading || isFetching) {
    return <BookingSuccessSkeleton />;
  }

  const handleContinue = () => {
    router.replace(paths.dashboard.bookingDetails(id));
  };

  const handleCopy = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('copiedToClipboard', { label }));
    } catch (_) {}
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
      }}
    >
      <Container maxWidth="sm" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Card
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: (theme) => `0 24px 48px -12px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.18)}`,
            '@keyframes successPop': {
              '0%': { transform: 'scale(0.6)', opacity: 0 },
              '60%': { transform: 'scale(1.08)', opacity: 1 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {/* Header band */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              px: 3,
              pt: 3.5,
              pb: 4,
              textAlign: 'center',
              background: (theme) => `linear-gradient(135deg, ${theme.vars.palette.success.dark} 0%, ${theme.vars.palette.success.main} 100%)`,
            }}
          >
            {/* decorative blobs */}
            <Box sx={{ position: 'absolute', top: -40, left: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: -20, width: 160, height: 160, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

            <Box
              sx={{
                position: 'relative',
                width: 68,
                height: 68,
                mx: 'auto',
                mb: 1.75,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'common.white',
                boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
                animation: 'successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={42} sx={{ color: 'success.main' }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: 'common.white', position: 'relative' }}>
              {t('paymentSuccessfulHeading')}
            </Typography>
            <Typography variant="body2" sx={{ color: varAlpha('255 255 255', 0.85), mt: 0.5, position: 'relative' }}>
              {t('yourBookingPlacedSuccessfully')}
            </Typography>

            <Chip
              label={t('bookingConfirmed')}
              size="small"
              icon={<Iconify icon="solar:shield-check-bold" width={14} />}
              sx={{
                position: 'relative',
                mt: 1.5,
                fontWeight: 700,
                color: 'success.dark',
                bgcolor: 'common.white',
                pointerEvents: 'none',
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          </Box>

          {/* Ticket perforation */}
          <Box sx={{ position: 'relative', height: 0 }}>
            <TicketNotches />
            <Box
              sx={{
                position: 'absolute',
                left: 16,
                right: 16,
                top: -1,
                borderTop: '1.5px dashed',
                borderColor: 'divider',
              }}
            />
          </Box>

          {/* Summary */}
          <Stack spacing={1.5} sx={{ p: 2.5 }}>
            <SummaryRow variant="service" label={t('service')} value={booking?.serviceName} />
            <SummaryRow variant="provider" label={t('provider')} value={booking?.providerName} />
            <SummaryRow
              variant="address"
              label={t('address')}
              value={booking?.venueLocation}
              onCopy={() => handleCopy(booking?.venueLocation, t('address'))}
              caption={t('revealedAfterBookingConfirmed')}
            />
            <SummaryRow variant="date" label={t('date')} value={booking?.date ? fDate(booking.date) : null} />
            <SummaryRow variant="slot" label={t('timeSlot')} value={booking?.slot} />

            <Box
              sx={{
                mt: 0.5,
                p: 1.75,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:wallet-money-bold" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {t('amountPaid')}
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {booking?.price != null ? fCurrency(booking.price) : '-'}
              </Typography>
            </Box>

            {booking?.bookingId && (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('bookingId')}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                    {booking.bookingId}
                  </Typography>
                  <Tooltip title={t('copyBookingId')}>
                    <IconButton size="small" onClick={() => handleCopy(booking.bookingId, t('bookingId'))}>
                      <Iconify icon="solar:copy-bold" width={15} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Card>

        <Button
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          onClick={handleContinue}
          endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
          sx={{ mt: 2.5, borderRadius: 10, fontWeight: 700, py: 1.5 }}
        >
          {t('continue')}
        </Button>
      </Container>
    </DashboardContent>
  );
}
