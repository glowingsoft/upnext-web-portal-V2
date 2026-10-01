import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { PayNowDialog } from '../../active-sections/sessions-view/components/pay-now-dialog';

// ----------------------------------------------------------------------

export function OutstandingDebtBanner({ debt, onPaymentSuccess }) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  if (!debt?.hasDebt) return null;

  const bookings = debt.bookings || [];
  const count = debt.count ?? bookings.length;
  const hasMultiple = bookings.length > 1;

  // variant="outstandingDebt" on PayNowDialog routes this through payOutstandingBookingMutation
  // (POST /app/payments/booking/:id) instead of the requires_payment_fix flow — a booking with
  // no bookingScope/bookingTargetId/bookingSlot just needs _id + price to drive that dialog.
  const openPayDialog = (booking) => setPayTarget({ _id: booking._id, price: booking.amount });

  const handleBannerClick = () => {
    if (hasMultiple) {
      setExpanded((prev) => !prev);
    } else {
      openPayDialog(bookings[0]);
    }
  };

  const handlePaySuccess = () => {
    setPayTarget(null);
    toast.success(t('paymentSuccessful'));
    onPaymentSuccess?.();
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleBannerClick();
          }
        }}
        sx={{
          mb: 3,
          px: { xs: 2.5, md: 3 },
          py: { xs: 2, md: 2.25 },
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.24),
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12) },
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
              }}
            >
              <Iconify icon="solar:danger-triangle-bold" width={22} sx={{ color: 'error.main' }} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.dark' }}>
                {t('outstandingDebtTitle')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.dark' }}>
                {t('outstandingDebtMessage', { count, amount: fCurrency(debt.totalAmount ?? 0) })}
              </Typography>
            </Box>
          </Stack>

          {hasMultiple ? (
            <Tooltip title={t('viewDetails')}>
              <IconButton sx={{ flexShrink: 0, color: 'error.main', pointerEvents: 'none' }} tabIndex={-1}>
                <Iconify icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<Iconify icon="solar:wallet-bold-duotone" width={16} />}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap', pointerEvents: 'none' }}
              tabIndex={-1}
            >
              {t('viewAndPay')}
            </Button>
          )}
        </Stack>

        {hasMultiple && (
          <Collapse in={expanded} onClick={(event) => event.stopPropagation()}>
            <Stack spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.24) }}>
              {bookings.map((booking) => (
                <Stack
                  key={booking._id}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                      {booking.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {booking.bookingId} · {fDate(booking.date)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.dark' }}>
                      {fCurrency(booking.amount ?? 0)}
                    </Typography>
                    <Button variant="outlined" color="error" size="small" onClick={() => openPayDialog(booking)}>
                      {t('payNow')}
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Collapse>
        )}
      </Box>

      <PayNowDialog
        open={Boolean(payTarget)}
        booking={payTarget}
        variant="outstandingDebt"
        onClose={() => setPayTarget(null)}
        onPay={handlePaySuccess}
      />
    </>
  );
}
