import { useEffect } from 'react';
import { keyframes } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';
import { useGetInstantBookingQuery } from 'src/store/Reducer/instant-bookings-api';
import { getLocalInstantDeadline } from 'src/utils/instant-booking-time';

import { useNow } from 'src/sections/live-offers/live-offers-context';

import { clearActiveRequest, updateActiveRequest, useActiveRequest } from './active-request-store';

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.7); opacity: 0; }
`;

const ACTIVE_REQUEST_STATUSES = ['requested', 'awaiting_customer_decision'];

export function ActiveRequestPill() {
  const request = useActiveRequest();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useChatSocketContext();

  const status = request?.status || 'requested';
  const { data: bookingResponse, refetch } = useGetInstantBookingQuery(request?.bookingId, {
    skip: !request?.bookingId,
  });
  const apiBooking = Array.isArray(bookingResponse?.data) ? bookingResponse.data[0] : bookingResponse?.data;
  const apiStatus = apiBooking?.status;

  const now = useNow(Boolean(request));
  const isActiveRequest = ACTIVE_REQUEST_STATUSES.includes(status);
  const hasDeadline = Number.isFinite(request?.expiresAt) && request.expiresAt > 0;

  useEffect(() => {
    if (request?.bookingId && apiStatus) {
      updateActiveRequest(request.bookingId, { status: apiStatus });
    }
  }, [apiStatus, request?.bookingId]);

  useEffect(() => {
    if (status && !isActiveRequest && request?.bookingId) clearActiveRequest(request.bookingId);
  }, [isActiveRequest, request?.bookingId, status]);

  useEffect(() => {
    if (!socket || !request?.bookingId) return undefined;
    const bookingId = request.bookingId;

    const handleOfferReceived = (payload) => {
      if (payload?.bookingId === bookingId) {
        const deadline = getLocalInstantDeadline(payload.expiresAt, payload.serverNow);
        updateActiveRequest(bookingId, {
          status: 'requested',
          ...(deadline != null ? { expiresAt: deadline } : {}),
        });
        refetch();
      }
    };

    const handleOfferClosed = (payload) => {
      if (payload?.bookingId === bookingId) {
        if (payload.status) updateActiveRequest(bookingId, { status: payload.status });
        else refetch();
      }
    };

    const handleBookingStatusChanged = (payload) => {
      if (payload?.bookingId === bookingId && payload.status) {
        updateActiveRequest(bookingId, { status: payload.status });
        refetch();
      }
    };

    socket.on('offerReceived', handleOfferReceived);
    socket.on('offerClosed', handleOfferClosed);
    socket.on('bookingStatusChanged', handleBookingStatusChanged);

    return () => {
      socket.off('offerReceived', handleOfferReceived);
      socket.off('offerClosed', handleOfferClosed);
      socket.off('bookingStatusChanged', handleBookingStatusChanged);
    };
  }, [refetch, request?.bookingId, socket]);

  if (!request || (status && !isActiveRequest)) return null;
  if (request.bookingId && pathname === paths.dashboard.bookingDetails(request.bookingId)) return null;

  const secondsLeft = hasDeadline ? Math.max(0, Math.ceil((request.expiresAt - now) / 1000)) : null;
  const needsAction = status === 'awaiting_customer_decision' || (hasDeadline && secondsLeft === 0);

  const state = needsAction ? 'noAnswer' : 'waiting';
  const color = state === 'noAnswer' ? 'warning' : secondsLeft != null && secondsLeft <= 10 ? 'error' : secondsLeft != null && secondsLeft <= 30 ? 'warning' : 'primary';
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const title = state === 'noAnswer' ? 'Action needed' : `Waiting for ${request.providerName}`;
  const subtitle = state === 'noAnswer' ? 'Send again or choose another provider' : request.serviceName;

  const openBooking = () => {
    if (state !== 'waiting') clearActiveRequest(request.bookingId);
    if (request.bookingId) router.push(paths.dashboard.bookingDetails(request.bookingId, 'instant'));
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${title}. ${subtitle}. Open booking details.`}
      sx={{
        position: 'fixed',
        zIndex: (theme) => theme.zIndex.snackbar - 1,
        right: { xs: 12, sm: 24 },
        bottom: { xs: 12, sm: 24 },
        left: { xs: 12, sm: 'auto' },
        maxWidth: { sm: 360 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pl: 1,
        pr: 0.5,
        py: 1,
        borderRadius: 99,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        border: '1.5px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.5),
        boxShadow: (theme) => theme.customShadows.z16,
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
      onClick={openBooking}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openBooking();
        }
      }}
    >
      <Box sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        {state === 'waiting' && (
          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid', borderColor: `${color}.main`, animation: `${ripple} 1.6s ease-out infinite` }} />
        )}
        <Avatar src={request.providerImage} sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700 }}>
          {request.providerName?.charAt(0)?.toUpperCase()}
        </Avatar>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
          {subtitle}
        </Typography>
      </Box>

      {state === 'waiting' ? (
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            mr: 0.5,
            flexShrink: 0,
            borderRadius: 99,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            typography: 'subtitle2',
            color: `${color}.${color === 'primary' ? 'dark' : 'main'}`,
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
          }}
        >
          {secondsLeft == null ? '…' : `${minutes}:${seconds}`}
        </Box>
      ) : (
        <IconButton
          size="small"
          aria-label="Dismiss"
          onClick={(event) => {
            event.stopPropagation();
            clearActiveRequest(request.bookingId);
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      )}
    </Box>
  );
}
