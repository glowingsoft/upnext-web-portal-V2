import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { OFFER_WINDOW_SEC } from './live-offers-mock';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

export function getUrgencyColor(secondsLeft) {
  if (secondsLeft <= 10) return 'error';
  if (secondsLeft <= 30) return 'warning';
  return 'success';
}

export function getOfferWindowSeconds(offer, secondsLeft) {
  const total = offer?.expiresAt && offer?.receivedAt ? Math.round((offer.expiresAt - offer.receivedAt) / 1000) : 0;
  return Math.max(total, secondsLeft || 0, 1);
}

export function OfferCountdown({ secondsLeft, totalSeconds = OFFER_WINDOW_SEC, size = 84, thickness = 4.5, showCaption = true }) {
  const color = getUrgencyColor(secondsLeft);
  const value = Math.min(100, Math.max(0, (secondsLeft / Math.max(totalSeconds, secondsLeft, 1)) * 100));
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          ...(secondsLeft <= 10 && secondsLeft > 0 && { animation: `${pulse} 1s ease-in-out infinite` }),
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{ position: 'absolute', inset: 0, color: 'background.neutral' }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={size}
          thickness={thickness}
          color={color}
          sx={{ position: 'absolute', inset: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round', transition: 'stroke-dashoffset 1s linear' } }}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: size >= 72 ? 20 : 14,
              fontVariantNumeric: 'tabular-nums',
              color: `${color}.${color === 'success' ? 'dark' : 'main'}`,
            }}
          >
            {minutes}:{seconds}
          </Typography>
        </Box>
      </Box>
      {showCaption && (
        <Typography variant="caption" sx={{ color: secondsLeft <= 30 ? `${color}.main` : 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {secondsLeft <= 10 ? 'Expiring now' : 'left to respond'}
        </Typography>
      )}
    </Box>
  );
}
