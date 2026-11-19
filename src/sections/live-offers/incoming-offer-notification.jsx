import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { keyframes } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { getSecondsLeft, useLiveOffers, useNow } from './live-offers-context';
import { OfferCountdown, getOfferWindowSeconds } from './offer-countdown';
import { OfferImage, formatOfferDate, formatOfferPrice, formatOfferSlotTime } from './offer-card';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ping = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  80%, 100% { transform: scale(2.4); opacity: 0; }
`;

export function LiveDot({ color = 'error.main', size = 8 }) {
  return (
    <Box component="span" sx={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <Box component="span" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: color, animation: `${ping} 1.6s cubic-bezier(0, 0, 0.2, 1) infinite` }} />
      <Box component="span" sx={{ position: 'relative', width: size, height: size, borderRadius: '50%', bgcolor: color }} />
    </Box>
  );
}

export function IncomingOfferNotification() {
  const live = useLiveOffers();
  const [busyAction, setBusyAction] = useState(null);
  const pathname = usePathname();
  const navigate = useNavigate();
  const now = useNow(Boolean(live?.counts?.incoming));

  if (!live?.enabled || pathname.startsWith(paths.dashboard.liveOffers)) return null;

  const pending = live.offers
    .filter((offer) => offer.status === 'incoming' && !live.dismissedIds.has(offer.id) && getSecondsLeft(offer, now) > 0)
    .sort((a, b) => b.receivedAt - a.receivedAt);

  const offer = pending[0];
  if (!offer) return null;

  const secondsLeft = getSecondsLeft(offer, now);
  const runAction = (action, handler) => {
    setBusyAction(action);
    Promise.resolve(handler(offer.id)).finally(() => setBusyAction(null));
  };
  const others = pending.length - 1;

  return (
    <Card
      key={offer.id}
      role="alert"
      sx={{
        position: 'fixed',
        zIndex: (theme) => theme.zIndex.snackbar - 1,
        right: { xs: 12, sm: 24 },
        left: { xs: 12, sm: 'auto' },
        bottom: { xs: 12, sm: 24 },
        width: { sm: 400 },
        p: 0,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.4),
        boxShadow: (theme) => theme.customShadows.z24,
        animation: `${slideIn} 0.35s ease-out`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1.25, bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12) }}
      >
        <LiveDot />
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          New booking offer
        </Typography>
        <IconButton size="small" aria-label="Dismiss notification" onClick={() => live.dismissNotification(offer.id)}>
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
        <OfferImage src={offer.image} alt={offer.serviceName} size={60} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {offer.serviceName}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25 }}>
            <Avatar src={offer.customer.avatar} sx={{ width: 20, height: 20, fontSize: 11 }}>
              {offer.customer.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
              {offer.customer.name}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
            <Box component="span" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              {formatOfferPrice(offer.price)}
            </Box>
            {' · '}
            {formatOfferDate(offer.appointmentAt)}, {formatOfferSlotTime(offer)}
          </Typography>
        </Box>
        <OfferCountdown secondsLeft={secondsLeft} totalSeconds={getOfferWindowSeconds(offer, secondsLeft)} size={56} thickness={4} showCaption={false} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={live.isResponding || Boolean(busyAction)}
          onClick={() => runAction('accept', live.acceptOffer)}
          startIcon={busyAction === 'accept' ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
        >
          {busyAction === 'accept' ? 'Accepting…' : 'Accept'}
        </Button>
        <Button fullWidth variant="outlined" color="inherit" disabled={live.isResponding || Boolean(busyAction)} onClick={() => runAction('decline', live.declineOffer)}>
          {busyAction === 'decline' ? 'Declining…' : 'Decline'}
        </Button>
      </Stack>

      <Box
        component="button"
        type="button"
        onClick={() => navigate(paths.dashboard.liveOffers)}
        sx={{
          width: 1,
          py: 1.25,
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          fontFamily: 'inherit',
          typography: 'subtitle2',
          color: 'primary.dark',
          bgcolor: 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {others > 0 ? `View all offers (${others} more waiting)` : 'View all offers'}
      </Box>
    </Card>
  );
}
