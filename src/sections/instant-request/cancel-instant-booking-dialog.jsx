import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { useCancelInstantBookingMutation, useGetInstantCancelQuoteQuery, useProviderCancelInstantBookingMutation } from 'src/store/Reducer/instant-bookings-api';

const QUICK_REASONS = {
  customer: ['Change of plans', 'Booked by mistake', 'Found another time', 'Provider is too far'],
  provider: ['Not available at this time', 'Emergency', 'Customer asked to cancel', 'Location is too far'],
};

const formatCents = (cents, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency || 'USD').toUpperCase() }).format((Number(cents) || 0) / 100);

function Row({ label, value, strong, color }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography variant={strong ? 'subtitle2' : 'body2'} sx={{ color: color || (strong ? 'text.primary' : 'text.secondary') }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: color || 'text.primary', flexShrink: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function CustomerSummary({ quote, currency }) {
  const charge = Number(quote.chargeCents ?? quote.penaltyCents ?? 0);
  const deposit = Number(quote.depositCents ?? 0);
  const refund = Number(quote.refundableDepositCents ?? quote.refundCents ?? 0);
  const free = charge <= 0;

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          textAlign: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette[free ? 'success' : 'error'].mainChannel, 0.08),
          border: '1px solid',
          borderColor: (theme) => varAlpha(theme.vars.palette[free ? 'success' : 'error'].mainChannel, 0.24),
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>
          {free ? 'Free cancellation' : 'You will be charged'}
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.25, color: free ? 'success.dark' : 'error.main', fontWeight: 800, lineHeight: 1.2 }}>
          {formatCents(charge, currency)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {free ? 'Nothing will be charged to your card.' : 'Your deposit is non-refundable because the provider already accepted.'}
        </Typography>
      </Box>

      {(deposit > 0 || refund > 0) && (
        <Stack spacing={1} sx={{ px: 0.5 }}>
          <Row label="Deposit" value={formatCents(deposit, currency)} />
          <Row label="Refunded to you" value={formatCents(refund, currency)} color={refund > 0 ? 'success.dark' : undefined} />
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Row strong label="Cancellation charge" value={formatCents(charge, currency)} />
        </Stack>
      )}

      {quote.authorizationRelease && (
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:card-recive-linear" width={18} sx={{ mt: 0.25, flexShrink: 0 }} />
          <Typography variant="caption">Any other hold on your card for this booking will be released.</Typography>
        </Stack>
      )}
    </Stack>
  );
}

function ProviderSummary({ quote, currency }) {
  const charge = Number(quote.chargeCents ?? quote.penaltyCents ?? 0);
  const count = quote.providerCancellationNumber;
  const suspension = Number(quote.suspensionHours || 0);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Row label="Charge to you" value={formatCents(charge, currency)} strong color={charge > 0 ? 'error.main' : 'success.dark'} />
          <Row label="Customer" value="Not charged" />
          {count != null && <Row label="Your cancellations" value={`#${count}`} />}
        </Stack>
      </Box>

      {quote.warningIssued && (
        <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" width={22} />}>
          This will be recorded as a provider cancellation. Cancelling often can lower your ranking or pause instant bookings for your account.
        </Alert>
      )}
      {quote.rankingReductionApplied && <Alert severity="error">Your ranking will be lowered because of this cancellation.</Alert>}
      {suspension > 0 && (
        <Alert severity="error">
          Instant bookings will be paused for {suspension} {suspension === 1 ? 'hour' : 'hours'} after this cancellation.
        </Alert>
      )}
    </Stack>
  );
}

export function CancelInstantBookingDialog({ open, bookingId, title = 'Cancel booking', viewer = 'customer', onClose, onCancelled }) {
  const isProviderViewer = viewer === 'provider';
  const [reason, setReason] = useState('');
  const { data, isFetching, error } = useGetInstantCancelQuoteQuery(bookingId, { skip: !open || !bookingId, refetchOnMountOrArgChange: true });
  const [customerCancel, { isLoading: isCustomerCancelling }] = useCancelInstantBookingMutation();
  const [providerCancel, { isLoading: isProviderCancelling }] = useProviderCancelInstantBookingMutation();
  const isLoading = isCustomerCancelling || isProviderCancelling;

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const quote = data?.data ?? null;
  const currency = quote?.currency || 'USD';
  const canCancel = Boolean(quote) && !error;
  const reasons = QUICK_REASONS[isProviderViewer ? 'provider' : 'customer'];

  const handleConfirm = async () => {
    try {
      const cancel = isProviderViewer ? providerCancel : customerCancel;
      await cancel({ id: bookingId, reason: reason.trim() }).unwrap();
      toast.success('Booking cancelled');
      onCancelled?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not cancel the booking');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflowX: 'hidden' } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'error.main', bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12), flexShrink: 0 }}>
          <Iconify icon="solar:calendar-minimalistic-bold" width={22} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Review what happens before you confirm
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} disabled={isLoading}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ pt: 0.5, overflowX: 'hidden' }}>
        {isFetching ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={118} />
            <Skeleton variant="rounded" height={84} />
          </Stack>
        ) : error || !quote ? (
          <Alert severity="warning">{error?.data?.message || 'This booking cannot be cancelled right now.'}</Alert>
        ) : (
          <Stack spacing={3}>
            {isProviderViewer || quote.canceledBy === 'business' ? (
              <ProviderSummary quote={quote} currency={currency} />
            ) : (
              <CustomerSummary quote={quote} currency={currency} />
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
                Why are you cancelling?
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {reasons.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    variant={reason === item ? 'filled' : 'outlined'}
                    color={reason === item ? 'primary' : 'default'}
                    onClick={() => setReason(reason === item ? '' : item)}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={isProviderViewer ? 'Let the customer know why you are cancelling' : 'Or write your own reason'}
                inputProps={{ maxLength: 300 }}
                helperText={`${reason.length}/300`}
                FormHelperTextProps={{ sx: { textAlign: 'right', mx: 0 } }}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
        <Button fullWidth variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
          Keep booking
        </Button>
        <LoadingButton fullWidth variant="contained" color="error" loading={isLoading} disabled={!canCancel || !reason.trim() || isFetching} onClick={handleConfirm}>
          {quote && !isProviderViewer && Number(quote.chargeCents) > 0 ? `Cancel and pay ${formatCents(quote.chargeCents, currency)}` : 'Cancel booking'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
