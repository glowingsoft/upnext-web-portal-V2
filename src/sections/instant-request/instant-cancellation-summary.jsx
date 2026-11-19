import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

const formatCents = (cents, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency || 'USD').toUpperCase() }).format((Number(cents) || 0) / 100);

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function Row({ label, value, color, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant={strong ? 'subtitle2' : 'body2'} sx={{ color: strong ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: color || 'text.primary', flexShrink: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function InstantCancellationSummary({ booking, viewer = 'customer', providerName = 'the provider' }) {
  const cancellation = booking?.cancellation;
  if (!cancellation) return null;

  const isProviderViewer = viewer === 'provider';
  const byBusiness = cancellation.actor === 'business';
  const byYou = isProviderViewer ? byBusiness : !byBusiness && cancellation.actor !== 'system';
  const cancelledBy = cancellation.actor === 'system' ? 'automatically' : byYou ? 'by you' : byBusiness ? `by ${providerName}` : 'by the customer';
  const charge = Number(cancellation.chargeCents || 0);
  const deposit = Number(cancellation.depositCents || 0);
  const refund = Number(cancellation.refundableDepositCents || 0);
  const released = booking.paymentStatus === 'released';
  const partlyCaptured = booking.paymentStatus === 'partially_captured';
  const payout = booking.payout || {};
  const payoutNet = payout.netCents;
  const payoutStatus = payout.status || booking.payoutStatus || 'none';
  const payoutInProgress = ['pending', 'processing', 'scheduled', 'in_transit'].includes(payoutStatus);
  const hasPayout = !byBusiness && payoutNet != null && (payoutStatus === 'paid' || payoutInProgress);
  const payoutSkipped = !byBusiness && payoutStatus === 'skipped';
  const payoutFailed = !byBusiness && payoutStatus === 'failed';

  return (
    <Card sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid', borderColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.24) }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'error.main', bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12) }}>
          <Iconify icon="solar:calendar-minimalistic-bold" width={24} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6">Booking cancelled {cancelledBy}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {formatWhen(cancellation.canceledAt)}
          </Typography>
        </Box>
      </Stack>

      {cancellation.reason && (
        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Reason
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>
            “{cancellation.reason}”
          </Typography>
        </Box>
      )}

      <Stack spacing={1}>
        {isProviderViewer ? (
          byBusiness ? (
            <>
              <Row label="Charge to you" value={formatCents(charge)} color={charge > 0 ? 'error.main' : 'success.dark'} strong />
              {cancellation.providerCancellationNumber != null && <Row label="Your cancellations" value={`#${cancellation.providerCancellationNumber}`} />}
              <Row label="Customer charged" value="Nothing" />
            </>
          ) : (
            <>
              <Row label="Customer paid (non-refundable deposit)" value={formatCents(charge)} />
              {(payoutSkipped || payoutFailed) && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Row label="Your payout" value={payoutSkipped ? 'Not paid out' : 'Failed'} color={payoutFailed ? 'error.main' : 'text.secondary'} strong />
                </>
              )}
              {hasPayout && (
                <>
                  {payout.stripeFeeShareCents > 0 && <Row label="Card processing fee" value={`−${formatCents(payout.stripeFeeShareCents)}`} />}
                  {payout.deductionCents > 0 && <Row label="Deductions" value={`−${formatCents(payout.deductionCents)}`} />}
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Row label="Your payout" value={formatCents(payoutNet)} color="success.dark" strong />
                </>
              )}
            </>
          )
        ) : (
          charge > 0 ? (
            <>
              <Row label="Deposit" value={formatCents(deposit)} />
              <Row label="Refunded to you" value={formatCents(refund)} color={refund > 0 ? 'success.dark' : undefined} />
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Row label="You were charged" value={formatCents(charge)} color="error.main" strong />
            </>
          ) : (
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 1.5, color: 'success.dark', bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1) }}
            >
              <Iconify icon="solar:check-circle-bold" width={22} />
              <Box>
                <Typography variant="subtitle2">You weren&apos;t charged anything</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {byBusiness ? 'The provider cancelled, so no fee or deposit was taken.' : 'No fee or deposit was taken for this cancellation.'}
                </Typography>
              </Box>
            </Stack>
          )
        )}
      </Stack>

      {!isProviderViewer && (released || partlyCaptured) && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: 'text.secondary' }}>
          <Iconify icon="solar:card-recive-linear" width={18} />
          <Typography variant="caption">
            {partlyCaptured ? 'Only the deposit was charged. The rest of the hold on your card has been released.' : 'The hold on your card has been released.'}
          </Typography>
        </Stack>
      )}

      {isProviderViewer && (hasPayout || payoutSkipped || payoutFailed) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 2, color: payoutStatus === 'paid' ? 'success.dark' : payoutFailed ? 'error.main' : 'text.secondary' }}
        >
          <Iconify
            icon={payoutStatus === 'paid' ? 'solar:check-circle-bold' : payoutFailed ? 'solar:danger-circle-bold' : payoutSkipped ? 'solar:info-circle-bold' : 'solar:clock-circle-bold'}
            width={18}
          />
          <Typography variant="caption">
            {payoutStatus === 'paid'
              ? `Paid out ${payout.paidAt ? formatWhen(payout.paidAt) : ''}`
              : payoutFailed
                ? 'The payout failed. Please contact support.'
                : payoutSkipped
                  ? payout.skipReason || payout.reason || 'No payout was made for this cancellation.'
                  : 'Payout is being processed.'}
          </Typography>
        </Stack>
      )}

      {isProviderViewer && byBusiness && (
        <Stack spacing={1.25} sx={{ mt: 2 }}>
          {cancellation.warningIssued && (
            <Alert severity="warning">A cancellation warning was added to your account. Cancelling often can lower your ranking or pause instant bookings.</Alert>
          )}
          {cancellation.rankingReductionApplied && <Alert severity="error">Your ranking was lowered because of this cancellation.</Alert>}
          {cancellation.suspendedUntil && <Alert severity="error">Instant bookings are paused until {formatWhen(cancellation.suspendedUntil)}.</Alert>}
        </Stack>
      )}
    </Card>
  );
}
