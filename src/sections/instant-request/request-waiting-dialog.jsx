import { useEffect, useState } from 'react';

import { keyframes } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { useGetBusinessesQuery } from 'src/store/Reducer/businesses-api';
import {
  useCancelInstantBookingMutation,
  useGetInstantBookingQuery,
  useSendInstantAgainMutation,
} from 'src/store/Reducer/instant-bookings-api';
import { getInstantOfferDeadline, getLocalInstantDeadline } from 'src/utils/instant-booking-time';
import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';
import { clearActiveRequest, setActiveRequest } from './active-request-store';
import { CancelInstantBookingDialog } from './cancel-instant-booking-dialog';

import { useNow } from 'src/sections/live-offers/live-offers-context';
import { OfferCountdown } from 'src/sections/live-offers/offer-countdown';

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.9); opacity: 0; }
`;

const dots = keyframes`
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`;

function ProviderAvatar({ provider, size = 88, waiting }) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      {waiting &&
        [0, 0.9].map((delay) => (
          <Box
            key={delay}
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              animation: `${ripple} 1.8s ease-out ${delay}s infinite`,
            }}
          />
        ))}
      <Avatar
        src={provider.image}
        alt={provider.name}
        sx={{
          width: size,
          height: size,
          fontSize: size / 2.8,
          fontWeight: 700,
          bgcolor: 'primary.main',
          border: '3px solid',
          borderColor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.z8,
        }}
      >
        {provider.name?.charAt(0)?.toUpperCase()}
      </Avatar>
    </Box>
  );
}

function BookingSummary({ request }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral', textAlign: 'left' }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: 1.25,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
        }}
      >
        {request.image ? (
          <Box component="img" src={request.image} alt={request.name} sx={{ width: 1, height: 1, objectFit: 'cover' }} />
        ) : (
          <Iconify icon="solar:scissors-bold-duotone" width={24} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {request.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
          {[request.dateLabel, request.slotLabel].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
      {request.price != null && (
        <Typography variant="subtitle1" sx={{ color: 'primary.dark', fontWeight: 800, flexShrink: 0 }}>
          {fCurrency(request.price)}
        </Typography>
      )}
    </Stack>
  );
}

function Step({ done, active, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box
        sx={{
          width: 22,
          height: 22,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: done ? 'common.white' : 'primary.main',
          bgcolor: done ? 'success.main' : (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.14),
        }}
      >
        {done ? (
          <Iconify icon="eva:checkmark-fill" width={14} />
        ) : (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', animation: active ? `${dots} 1.2s infinite` : 'none' }} />
        )}
      </Box>
      <Typography variant="body2" sx={{ color: done || active ? 'text.primary' : 'text.secondary', fontWeight: active ? 700 : 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function OtherProviders({ excludeId, onOpenProfile }) {
  const { data, isLoading } = useGetBusinessesQuery({ page: 1, limit: 8 });
  const list = (Array.isArray(data?.data) ? data.data : data?.data?.businesses || []).filter((item) => item._id !== excludeId).slice(0, 5);

  if (isLoading) {
    return (
      <Stack spacing={1.25}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="rounded" height={64} />
        ))}
      </Stack>
    );
  }

  if (list.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 3 }}>
        No other providers are available right now. Try sending your request again.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ textAlign: 'left' }}>
      {list.map((provider) => {
        const rating = Number(provider.rating?.avgRating || 0);
        const category = (provider.categories || []).map((cat) => (typeof cat === 'string' ? cat : cat?.name)).filter(Boolean)[0];
        return (
          <Stack
            key={provider._id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main' } }}
          >
            <Avatar src={normalizeImageUrl(provider.image)} alt={provider.businessName} sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontWeight: 700 }}>
              {provider.businessName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {provider.businessName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
                <Iconify icon="eva:star-fill" width={13} sx={{ color: 'warning.main' }} />
                <Typography variant="caption">{rating > 0 ? rating.toFixed(1) : 'New'}</Typography>
                {category && (
                  <Typography variant="caption" noWrap>
                    · {category}
                  </Typography>
                )}
              </Stack>
            </Box>
            <Button size="small" variant="outlined" onClick={() => onOpenProfile(provider._id)} sx={{ flexShrink: 0 }}>
              View profile
            </Button>
          </Stack>
        );
      })}
    </Stack>
  );
}

const ACCEPTED_BOOKING_STATUSES = ['accepted', 'accepted_awaiting_payment', 'confirmed', 'ongoing', 'completed'];
const CLOSED_OFFER_STATUSES = ['declined', 'expired', 'closed', 'rejected'];

export function RequestWaitingDialog({ request, onClose }) {
  const router = useRouter();
  const { socket } = useChatSocketContext();
  const [status, setStatus] = useState('waiting');
  const [expiresAt, setExpiresAt] = useState(0);
  const [showProviders, setShowProviders] = useState(false);
  const [windowSec, setWindowSec] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBooking, { isLoading: isCancelling }] = useCancelInstantBookingMutation();
  const [sendAgain, { isLoading: isResending }] = useSendInstantAgainMutation();
  const { data: bookingResponse } = useGetInstantBookingQuery(request?.bookingId, {
    skip: !request?.bookingId,
    pollingInterval: status === 'waiting' ? 5000 : 0,
  });
  const apiBooking = Array.isArray(bookingResponse?.data) ? bookingResponse.data[0] : bookingResponse?.data;
  const apiDeadline = getInstantOfferDeadline(apiBooking);

  const open = Boolean(request);
  const now = useNow(open && status === 'waiting' && expiresAt > 0);

  useEffect(() => {
    if (!request) return;
    setStatus('waiting');
    setShowProviders(false);
    setExpiresAt(request.expiresAt || 0);
  }, [request]);

  useEffect(() => {
    if (!request?.expiresAt && apiDeadline != null) setExpiresAt(apiDeadline);
  }, [apiDeadline, request?.expiresAt]);

  useEffect(() => {
    if (!socket || !request?.bookingId) return undefined;

    const handleOfferReceived = (payload) => {
      if (payload?.bookingId !== request.bookingId) return;
      const deadline = getLocalInstantDeadline(payload.expiresAt, payload.serverNow);
      if (deadline != null) setExpiresAt(deadline);
    };

    const handleOfferClosed = (payload) => {
      if (payload?.bookingId !== request.bookingId) return;
      if (payload.status === 'accepted') setStatus('accepted');
      else if (CLOSED_OFFER_STATUSES.includes(payload.status)) setStatus((prev) => (prev === 'waiting' ? 'expired' : prev));
    };

    socket.on('offerReceived', handleOfferReceived);
    socket.on('offerClosed', handleOfferClosed);
    return () => {
      socket.off('offerReceived', handleOfferReceived);
      socket.off('offerClosed', handleOfferClosed);
    };
  }, [request?.bookingId, socket]);

  useEffect(() => {
    if (status === 'waiting' && ACCEPTED_BOOKING_STATUSES.includes(apiBooking?.status)) setStatus('accepted');
  }, [apiBooking?.status, status]);

  useEffect(() => {
    if (status === 'accepted' && request?.bookingId) clearActiveRequest(request.bookingId);
  }, [status, request?.bookingId]);

  useEffect(() => {
    if (expiresAt > 0) setWindowSec(Math.max(1, Math.round((expiresAt - Date.now()) / 1000)));
  }, [expiresAt]);

  const hasDeadline = expiresAt > 0;
  const secondsLeft = hasDeadline ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : null;

  useEffect(() => {
    if (status === 'waiting' && hasDeadline && secondsLeft === 0) setStatus('expired');
  }, [hasDeadline, status, secondsLeft]);

  if (!request) return null;

  const provider = request.provider;

  const resend = async () => {
    if (!request.bookingId) {
      toast.error('Could not find the booking ID to resend this request.');
      return;
    }

    try {
      const response = await sendAgain({
        id: request.bookingId,
        expectedTotalCents: request.expectedTotalCents,
        agreedNonRefundable: true,
        agreementVersion: request.agreementVersion || 'instant-v1',
      }).unwrap();
      const payload = response?.data?.data ?? response?.data ?? response;
      const booking = payload?.booking ?? payload;
      setExpiresAt(getInstantOfferDeadline(booking, payload) || 0);
      setStatus('waiting');
      setShowProviders(false);
      toast.info(`Request sent to ${provider.name} again`);
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send the request again.');
    }
  };

  const cancelRequest = async () => {
    if (request.bookingId) {
      try {
        await cancelBooking({ id: request.bookingId, reason: 'client' }).unwrap();
      } catch (error) {
        toast.error(error?.data?.message || 'Could not cancel the request');
        return;
      }
    }
    clearActiveRequest(request.bookingId);
    setStatus('cancelled');
    toast.info('Booking request cancelled');
    onClose();
  };

  const hideWhileWaiting = () => {
    setActiveRequest({
      bookingId: request.bookingId,
      providerName: provider.name,
      providerImage: provider.image,
      serviceName: request.name,
      expiresAt,
    });
    onClose();
  };

  const handleClose = status === 'waiting' ? hideWhileWaiting : onClose;

  const openProfile = (id) => {
    onClose();
    router.push(paths.dashboard.providerDetails(id));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <IconButton aria-label={status === 'waiting' ? 'Hide' : 'Close'} onClick={handleClose} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <Box sx={{ px: 3, pt: 4, pb: 3, textAlign: 'center' }}>
        {status === 'waiting' && (
          <>
            <ProviderAvatar provider={provider} waiting />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Waiting for {provider.name} to accept
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
              Your request has been sent. {provider.name} has {windowSec >= 120 ? `${Math.round(windowSec / 60)} minutes` : `${windowSec} seconds`} to respond.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
              {hasDeadline ? (
                <OfferCountdown secondsLeft={secondsLeft} totalSeconds={windowSec || secondsLeft} size={104} thickness={4} />
              ) : (
                <Typography variant="body2" sx={{ py: 4, color: 'text.secondary' }}>
                  Waiting for the server response deadline…
                </Typography>
              )}
            </Box>

            <Stack spacing={1.25} sx={{ mb: 2.5, mx: 'auto', width: 'fit-content', textAlign: 'left' }}>
              <Step done label="Request sent" />
              <Step done label={`${provider.name} notified`} />
              <Step active label="Waiting for a response" />
            </Stack>

            <BookingSummary request={request} />

            <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
              <Button fullWidth variant="outlined" color="inherit" onClick={() => (request.bookingId ? setCancelOpen(true) : cancelRequest())} disabled={isCancelling}>
                Cancel request
              </Button>
              <Button fullWidth variant="contained" color="primary" onClick={hideWhileWaiting} disabled={isCancelling}>
                Hide and keep waiting
              </Button>
            </Stack>
            <Typography variant="caption" sx={{ mt: 1.25, display: 'block', color: 'text.secondary' }}>
              Hiding doesn&apos;t cancel your request. You can follow it from Bookings.
            </Typography>
          </>
        )}

        {status === 'accepted' && (
          <>
            <Box sx={{ width: 88, height: 88, mx: 'auto', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'success.main', bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.14) }}>
              <Iconify icon="solar:check-circle-bold" width={56} />
            </Box>
            <Typography variant="h6" sx={{ mt: 2.5 }}>
              {provider.name} accepted your request
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
              Your booking is being confirmed. You can follow its status in Bookings.
            </Typography>

            <BookingSummary request={request} />

            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:calendar-mark-bold" />}
              onClick={() => {
                onClose();
                if (request.bookingId) router.push(paths.dashboard.bookingDetails(request.bookingId, 'instant'));
              }}
              sx={{ mt: 2.5 }}
            >
              View booking
            </Button>
          </>
        )}

        {status === 'expired' && (
          <>
            {!showProviders ? (
              <>
                <Box sx={{ position: 'relative', width: 88, mx: 'auto' }}>
                  <ProviderAvatar provider={provider} />
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -4,
                      bottom: -4,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'common.white',
                      bgcolor: 'warning.main',
                      border: '3px solid',
                      borderColor: 'background.paper',
                    }}
                  >
                    <Iconify icon="solar:clock-circle-bold" width={16} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mt: 2.5 }}>
                  {provider.name} didn&apos;t respond in time
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5 }}>
                  You have not been charged. Send the request again or choose another provider.
                </Typography>

                <BookingSummary request={request} />

                <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                  <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Iconify icon="solar:refresh-bold" />} onClick={resend} disabled={isResending}>
                    Send request again
                  </Button>
                  <Button fullWidth size="large" variant="outlined" startIcon={<Iconify icon="solar:users-group-rounded-bold" />} onClick={() => setShowProviders(true)}>
                    Choose another provider
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <IconButton size="small" aria-label="Back" onClick={() => setShowProviders(false)}>
                    <Iconify icon="eva:arrow-ios-back-fill" />
                  </IconButton>
                  <Typography variant="h6">Choose another provider</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'left' }}>
                  Open a provider&apos;s profile to see their services and packages, then send a new request.
                </Typography>
                <OtherProviders excludeId={provider.id} onOpenProfile={openProfile} />
              </>
            )}
          </>
        )}
      </Box>

      {request.bookingId && (
        <CancelInstantBookingDialog
          open={cancelOpen}
          bookingId={request.bookingId}
          title="Cancel request"
          onClose={() => setCancelOpen(false)}
          onCancelled={() => {
            clearActiveRequest(request.bookingId);
            setStatus('cancelled');
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}
