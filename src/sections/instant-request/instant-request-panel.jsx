import { useState } from 'react';
import { keyframes } from '@mui/material/styles';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { getInstantOfferDeadline, getLocalInstantDeadline, parseInstantTimestamp } from 'src/utils/instant-booking-time';
import { useGetNextProvidersQuery, useSendInstantAgainMutation, useSendInstantNextMutation } from 'src/store/Reducer/instant-bookings-api';

import { useNow } from 'src/sections/live-offers/live-offers-context';
import { CancelInstantBookingDialog } from './cancel-instant-booking-dialog';

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
`;

const RETRYABLE_STATUSES = ['awaiting_customer_decision', 'expired', 'declined', 'rejected', 'provider_declined', 'no_response', 'timed_out', 'unanswered'];

const formatCents = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100);

function formatRemaining(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function BookingExpiry({ secondsLeft }) {
  if (secondsLeft == null) return null;

  const expired = secondsLeft === 0;
  const urgent = secondsLeft <= 300;

  return (
    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: expired || urgent ? 'error.main' : 'text.secondary', fontWeight: urgent ? 700 : 400 }}>
      {expired ? 'Booking session has expired.' : `Booking session expires in ${formatRemaining(secondsLeft)}.`}
    </Typography>
  );
}

function CountdownRing({ secondsLeft, totalSeconds, size = 96 }) {
  const value = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const color = secondsLeft <= 10 ? 'error' : secondsLeft <= Math.min(60, totalSeconds / 3) ? 'warning' : 'success';
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" viewBox="0 0 100 100" sx={{ width: 1, height: 1, transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="6" stroke="currentColor" opacity={0.12} />
        <Box
          component="circle"
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          sx={{ stroke: (theme) => theme.vars.palette[color].main, transition: 'stroke-dashoffset 1s linear' }}
        />
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: secondsLeft >= 3600 ? 15 : 19, fontVariantNumeric: 'tabular-nums', color: `${color}.${color === 'success' ? 'dark' : 'main'}` }}
        >
          {formatRemaining(secondsLeft)}
        </Typography>
      </Box>
    </Box>
  );
}

function ProviderAvatar({ name, image, waiting, size = 64 }) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {waiting &&
        [0, 0.9].map((delay) => (
          <Box
            key={delay}
            sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid', borderColor: 'primary.main', animation: `${ripple} 1.8s ease-out ${delay}s infinite` }}
          />
        ))}
      <Avatar src={image} alt={name} sx={{ width: size, height: size, bgcolor: 'primary.main', fontWeight: 700 }}>
        {name?.charAt(0)?.toUpperCase()}
      </Avatar>
    </Box>
  );
}

function ConfirmSendDialog({ open, title, providerName, totalCents, agreementText, loading, onClose, onConfirm }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
      TransitionProps={{ onExited: () => setAgreed(false) }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Your request will go to <strong>{providerName}</strong>. They will have a limited time to accept. You are only charged once they accept.
        </Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ p: 1.5, mb: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2">Total</Typography>
          <Typography variant="subtitle2" sx={{ color: 'primary.dark' }}>
            {formatCents(totalCents)}
          </Typography>
        </Stack>
        {agreementText && (
          <FormControlLabel
            sx={{ alignItems: 'flex-start', mx: 0 }}
            control={<Checkbox checked={agreed} onChange={(event) => setAgreed(event.target.checked)} sx={{ mt: -0.75 }} />}
            label={<Typography variant="body2">{agreementText}</Typography>}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton variant="contained" color="primary" loading={loading} disabled={Boolean(agreementText) && !agreed} onClick={onConfirm}>
          Send request
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

function normalizeNextProvider(item) {
  const business = item.business || item.businessInfo || item.provider || item;
  const target = item.target || item.match || item.service || item.package || null;
  return {
    providerId: item.providerId || business._id || item._id,
    name: business.businessName || business.name || item.businessName || 'Provider',
    image: normalizeImageUrl(business.image || business.profileImage || item.image),
    rating: Number(business.rating?.avgRating ?? item.rating?.avgRating ?? item.rating ?? 0),
    distanceKm: item.distanceKm ?? business.distanceKm ?? null,
    scope: item.scope || target?.scope || (item.packageId ? 'package' : item.serviceId ? 'service' : null),
    targetId: item.targetId || target?._id || target?.id || item.serviceId || item.packageId || null,
    targetName: target?.name || item.targetName || item.serviceName || null,
    totalCents: item.totalCents ?? item.pricing?.totalCents ?? target?.pricing?.totalCents ?? null,
  };
}

function NextProvidersDialog({ open, bookingId, onClose, onSend, sendingId }) {
  const router = useRouter();
  const { data, isFetching, error } = useGetNextProvidersQuery(bookingId, { skip: !open || !bookingId });
  const raw = data?.data;
  const list = (Array.isArray(raw) ? raw : raw?.providers || raw?.items || raw?.results || []).map(normalizeNextProvider);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Stack direction="row" alignItems="center" sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Choose another provider</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Send your request to someone else, or open a profile to pick a different service or package.
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>
      <DialogContent sx={{ pb: 3 }}>
        {isFetching ? (
          <Stack spacing={1.25}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={72} />
            ))}
          </Stack>
        ) : error ? (
          <Alert severity="info">{error?.data?.message || 'Could not load other providers right now.'}</Alert>
        ) : list.length === 0 ? (
          <Alert severity="info">No other providers are available for this booking right now. Try sending your request again later.</Alert>
        ) : (
          <Stack spacing={1.25}>
            {list.map((provider) => (
              <Stack key={provider.providerId} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <Avatar src={provider.image} sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700 }}>
                  {provider.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {provider.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
                    <Iconify icon="eva:star-fill" width={13} sx={{ color: 'warning.main' }} />
                    <Typography variant="caption">{provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}</Typography>
                    {provider.distanceKm != null && <Typography variant="caption">· {Number(provider.distanceKm).toFixed(1)} km</Typography>}
                  </Stack>
                  {provider.targetName && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                      {provider.targetName}
                      {provider.totalCents != null ? ` · ${formatCents(provider.totalCents)}` : ''}
                    </Typography>
                  )}
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                  <Button size="small" color="inherit" variant="outlined" onClick={() => router.push(paths.dashboard.providerDetails(provider.providerId))}>
                    View profile
                  </Button>
                  {provider.targetId && provider.scope && (
                    <LoadingButton size="small" variant="contained" color="primary" loading={sendingId === provider.providerId} onClick={() => onSend(provider)}>
                      Send request
                    </LoadingButton>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function InstantRequestPanel({ booking, offerStatus: offerStatusOverride, isRefreshing = false }) {
  const router = useRouter();
  const [sendAgain, { isLoading: isResending }] = useSendInstantAgainMutation();
  const [sendNext] = useSendInstantNextMutation();
  const [confirmAgainOpen, setConfirmAgainOpen] = useState(false);
  const [providersOpen, setProvidersOpen] = useState(false);
  const [nextTarget, setNextTarget] = useState(null);
  const [sendingNext, setSendingNext] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const status = booking?.status;
  const offer = booking?.flow?.currentOffer;
  const offerStatus = offerStatusOverride || offer?.status || booking?.currentOffer?.status;
  const sentAtMs = parseInstantTimestamp(offer?.sentAt || booking?.flow?.attemptStartedAt || booking?.createdAt);
  const expiresAtMs = getInstantOfferDeadline(booking);
  const isAwaitingCustomerDecision = status === 'awaiting_customer_decision';
  const sessionExpiry = isAwaitingCustomerDecision
    ? booking?.awaitingDecisionDeadline || booking?.flow?.attemptExpiresAt || booking?.offerExpiresAt || offer?.expiresAt
    : booking?.flow?.attemptExpiresAt || booking?.offerExpiresAt || offer?.expiresAt;
  const sessionExpiresAtMs = getLocalInstantDeadline(sessionExpiry, offer?.serverNow || booking?.serverNow);
  const isPending = status === 'requested';
  const now = useNow(isPending || isAwaitingCustomerDecision);
  const secondsLeft = expiresAtMs != null ? Math.max(0, Math.ceil((expiresAtMs - now) / 1000)) : null;
  const sessionSecondsLeft = sessionExpiresAtMs != null ? Math.max(0, Math.ceil((sessionExpiresAtMs - now) / 1000)) : null;
  const expiresAtRaw = parseInstantTimestamp(offer?.expiresAt || booking?.offerExpiresAt || booking?.flow?.attemptExpiresAt);
  const totalSeconds = expiresAtRaw != null && sentAtMs != null ? Math.max(1, Math.round((expiresAtRaw - sentAtMs) / 1000)) : Math.max(1, secondsLeft || 1);
  const sessionExpired = status === 'expired' || ((isPending || isAwaitingCustomerDecision) && sessionSecondsLeft === 0);
  const providerDeclined = ['declined', 'rejected', 'provider_declined'].includes(offerStatus);
  const declinedStatus = ['declined', 'rejected', 'provider_declined'].includes(status);
  const waiting = isPending && (expiresAtMs == null || expiresAtMs > now) && !sessionExpired && !providerDeclined && !declinedStatus;
  const noAnswer = (isPending && expiresAtMs != null && expiresAtMs <= now) || sessionExpired || RETRYABLE_STATUSES.includes(status) || (providerDeclined && isPending);

  if (!booking || isRefreshing || (!waiting && !noAnswer)) return null;

  const business = booking.businessInfo || {};
  const providerName = business.businessName || 'the provider';
  const providerImage = normalizeImageUrl(business.image);
  const totalCents = booking.pricing?.totalCents;
  const agreementText = booking.agreement?.text;
  const agreementVersion = booking.agreement?.version || 'instant-v1';
  const declined = providerDeclined || declinedStatus || (booking.providerDeclineCount > 0 && !waiting);

  const handleSendAgain = async () => {
    try {
      await sendAgain({ id: booking._id, expectedTotalCents: totalCents, agreedNonRefundable: true, agreementVersion }).unwrap();
      toast.success(`Request sent to ${providerName} again`);
      setConfirmAgainOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send the request again');
    }
  };

  const handleSendNext = async () => {
    if (!nextTarget) return;
    setSendingNext(true);
    try {
      const response = await sendNext({
        id: booking._id,
        providerId: nextTarget.providerId,
        scope: nextTarget.scope,
        targetId: nextTarget.targetId,
        expectedTotalCents: nextTarget.totalCents ?? totalCents,
        agreedNonRefundable: true,
        agreementVersion,
      }).unwrap();
      toast.success(`Request sent to ${nextTarget.name}`);
      setNextTarget(null);
      setProvidersOpen(false);
      const newId = response?.data?._id || response?.data?.booking?._id;
      if (newId && newId !== booking._id) router.push(paths.dashboard.bookingDetails(newId, 'instant'));
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send the request');
    } finally {
      setSendingNext(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          border: '1.5px solid',
          borderColor: waiting ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.4) : (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.5),
          bgcolor: waiting ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04) : (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.05),
        }}
      >
        {waiting ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 2, sm: 3 }}>
            <ProviderAvatar name={providerName} image={providerImage} waiting />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6">Waiting for {providerName} to accept</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Your request was sent. You can send it again or choose another provider if the server response deadline expires. You are only charged once a provider accepts.
              </Typography>
              <BookingExpiry secondsLeft={sessionSecondsLeft} />
              {expiresAtMs != null && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                  Request expires at {new Date(expiresAtMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Typography>
              )}
            </Box>
            <Stack alignItems="center" spacing={1.5} sx={{ flexShrink: 0, alignSelf: { xs: 'center', sm: 'auto' } }}>
              {secondsLeft != null ? (
                <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
              ) : (
                <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 96, textAlign: 'center' }}>
                  Waiting for server deadline
                </Typography>
              )}
              <Button size="small" color="inherit" variant="outlined" onClick={() => setCancelOpen(true)}>
                Cancel request
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 2, sm: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <ProviderAvatar name={providerName} image={providerImage} />
              <Box
                sx={{
                  position: 'absolute',
                  right: -4,
                  bottom: -4,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'common.white',
                  bgcolor: declined ? 'error.main' : 'warning.main',
                  border: '2px solid',
                  borderColor: 'background.paper',
                }}
              >
                <Iconify icon={declined ? 'mingcute:close-line' : 'solar:clock-circle-bold'} width={14} />
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6">
                {sessionExpired ? 'Booking session expired' : declined ? `${providerName} declined this request` : `${providerName} didn't respond in time`}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {sessionExpired ? 'You have not been charged. This booking session has ended.' : 'You have not been charged. Send the request again or choose another provider.'}
              </Typography>
              <BookingExpiry secondsLeft={sessionSecondsLeft} />
            </Box>
            {!sessionExpired && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0, width: { xs: 1, sm: 'auto' } }}>
                <Button variant="outlined" color="error" startIcon={<Iconify icon="mingcute:close-line" />} onClick={() => setCancelOpen(true)}>
                  Cancel request
                </Button>
                <Button variant="contained" color="primary" startIcon={<Iconify icon="solar:refresh-bold" />} onClick={() => setConfirmAgainOpen(true)}>
                  Send request again
                </Button>
                <Button variant="outlined" color="primary" startIcon={<Iconify icon="solar:users-group-rounded-bold" />} onClick={() => setProvidersOpen(true)}>
                  Choose another provider
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Card>

      <ConfirmSendDialog
        open={confirmAgainOpen}
        title="Send request again?"
        providerName={providerName}
        totalCents={totalCents}
        agreementText={agreementText}
        loading={isResending}
        onClose={() => setConfirmAgainOpen(false)}
        onConfirm={handleSendAgain}
      />

      <NextProvidersDialog
        open={providersOpen}
        bookingId={booking._id}
        onClose={() => setProvidersOpen(false)}
        onSend={setNextTarget}
        sendingId={sendingNext ? nextTarget?.providerId : null}
      />

      <ConfirmSendDialog
        open={Boolean(nextTarget)}
        title={`Send request to ${nextTarget?.name || 'this provider'}?`}
        providerName={nextTarget?.name || ''}
        totalCents={nextTarget?.totalCents ?? totalCents}
        agreementText={agreementText}
        loading={sendingNext}
        onClose={() => setNextTarget(null)}
        onConfirm={handleSendNext}
      />

      <CancelInstantBookingDialog open={cancelOpen} bookingId={booking._id} title="Cancel request" onClose={() => setCancelOpen(false)} />
    </>
  );
}
