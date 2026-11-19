import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';

import { useNow } from 'src/sections/live-offers/live-offers-context';
import { OfferCountdown, getUrgencyColor } from 'src/sections/live-offers/offer-countdown';

const toMs = (value) => {
  const ms = new Date(value || 0).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

export function ProviderOfferTimer({ booking }) {
  const offer = booking?.flow?.currentOffer || {};
  const expiresAtMs = toMs(offer.expiresAt || booking?.offerExpiresAt);
  const sentAtMs = toMs(offer.sentAt || booking?.flow?.attemptStartedAt || booking?.createdAt);
  const active = booking?.status === 'requested' && expiresAtMs > 0;
  const now = useNow(active);

  if (!active) return null;

  const secondsLeft = Math.max(0, Math.ceil((expiresAtMs - now) / 1000));
  const totalSeconds = Math.max(1, Math.round((expiresAtMs - sentAtMs) / 1000), secondsLeft);
  const expired = secondsLeft === 0;
  const color = expired ? 'error' : getUrgencyColor(secondsLeft);
  const deadline = new Date(expiresAtMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        border: '1.5px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.4),
        bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.04),
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 2, sm: 3 }}>
        <Box sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}>
          <OfferCountdown secondsLeft={secondsLeft} totalSeconds={totalSeconds} size={96} thickness={4} showCaption={false} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={expired ? 'solar:clock-circle-bold' : 'solar:bell-bing-bold'} width={20} sx={{ color: `${color}.main` }} />
            <Typography variant="h6">{expired ? 'This request has expired' : 'Respond before the timer runs out'}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {expired
              ? 'You did not respond in time. The customer can send the request again or choose another provider.'
              : `Accept or reject this instant request by ${deadline}. If you don't respond, it expires and the customer can choose another provider.`}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
