import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { varAlpha } from 'src/theme/styles';

import { getSecondsLeft } from './live-offers-context';
import { OfferCountdown, getOfferWindowSeconds, getUrgencyColor } from './offer-countdown';

export const OFFER_STATUS_META = {
  incoming: { label: 'Incoming', color: 'warning', icon: 'solar:bell-bing-bold' },
  accepted: { label: 'Accepted', color: 'success', icon: 'solar:check-circle-bold' },
  declined: { label: 'Declined', color: 'default', icon: 'solar:close-circle-bold' },
  expired: { label: 'Expired', color: 'error', icon: 'solar:clock-circle-bold' },
  closed: { label: 'Closed', color: 'default', icon: 'solar:lock-keyhole-bold' },
};

export const formatOfferPrice = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function formatOfferDate(iso) {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return 'Date unavailable';
  const datePart = String(iso).slice(0, 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(datePart)
    ? new Date(Number(datePart.slice(0, 4)), Number(datePart.slice(5, 7)) - 1, Number(datePart.slice(8, 10)))
    : new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatOfferTime(value) {
  if (!value) return 'Time unavailable';

  const clockTime = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(value).trim());
  if (clockTime) {
    const hours = Number(clockTime[1]);
    const minutes = Number(clockTime[2]);
    if (hours > 23 || minutes > 59) return 'Time unavailable';
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Time unavailable'
    : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatOfferSlotTime(offer) {
  if (!offer.slotOpen) return 'Time unavailable';
  const start = formatOfferTime(offer.slotOpen);
  const end = offer.slotClose ? formatOfferTime(offer.slotClose) : '';
  return end && end !== 'Time unavailable' ? `${start} – ${end}` : start;
}

export function formatDuration(mins) {
  if (!mins) return '';
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function timeAgo(ts, now) {
  const mins = Math.max(0, Math.round((now - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hr ago`;
}

export function OfferImage({ src, alt, size = 112, radius = 1.5 }) {
  const [failed, setFailed] = useState(false);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        color: 'primary.main',
        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
      }}
    >
      {src && !failed ? (
        <Box component="img" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} sx={{ width: 1, height: 1, objectFit: 'cover' }} />
      ) : (
        <Iconify icon="solar:scissors-bold-duotone" width={size / 2.6} />
      )}
    </Box>
  );
}

function DetailChip({ icon, children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, color: 'text.secondary' }}>
      <Iconify icon={icon} width={18} sx={{ flexShrink: 0, color: 'text.disabled' }} />
      <Typography variant="body2" noWrap sx={{ color: 'text.primary' }}>
        {children}
      </Typography>
    </Stack>
  );
}

export function OfferCard({ offer, now, onAccept, onDecline, isResponding = false }) {
  const [busyAction, setBusyAction] = useState(null);
  const runAction = (action, handler) => {
    if (!handler) return;
    setBusyAction(action);
    Promise.resolve(handler(offer.id)).finally(() => setBusyAction(null));
  };
  const isIncoming = offer.status === 'incoming';
  const secondsLeft = isIncoming ? getSecondsLeft(offer, now) : 0;
  const urgency = isIncoming ? getUrgencyColor(secondsLeft) : null;
  const status = OFFER_STATUS_META[offer.status];

  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isIncoming ? (theme) => varAlpha(theme.vars.palette[urgency].mainChannel, 0.4) : 'divider',
        boxShadow: isIncoming ? (theme) => theme.customShadows.z12 : 'none',
        opacity: offer.status === 'expired' || offer.status === 'declined' ? 0.82 : 1,
        transition: (theme) => theme.transitions.create(['border-color', 'box-shadow', 'opacity']),
        ...(isIncoming && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: `${urgency}.main`,
          },
        }),
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, md: 2.5 }, alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <OfferImage src={offer.image} alt={offer.serviceName} size={112} />
          </Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <OfferImage src={offer.image} alt={offer.serviceName} size={72} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
                  <Label variant="soft" color={offer.kind === 'package' ? 'info' : 'primary'}>
                    {offer.kind === 'package' ? 'Package' : 'Service'}
                  </Label>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {offer.category}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }} noWrap>
                  {offer.serviceName}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ flexShrink: 0, color: 'primary.dark', fontWeight: 800 }}>
                {formatOfferPrice(offer.price)}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <Avatar src={offer.customer.avatar} alt={offer.customer.name} sx={{ width: 28, height: 28, fontSize: 13 }}>
                {offer.customer.name.charAt(0)}
              </Avatar>
              <Typography variant="subtitle2" noWrap>
                {offer.customer.name}
              </Typography>
              {Number.isFinite(offer.customer.rating) && (
                <Stack direction="row" alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
                  <Iconify icon="eva:star-fill" width={14} sx={{ color: 'warning.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {offer.customer.rating.toFixed(1)}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Box sx={{ mt: 1.5, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, auto)' }, justifyContent: { md: 'start' }, columnGap: { md: 3 } }}>
              <DetailChip icon="solar:calendar-bold-duotone">{formatOfferDate(offer.appointmentAt)}</DetailChip>
              <DetailChip icon="solar:clock-circle-bold-duotone">{formatOfferSlotTime(offer)}</DetailChip>
              {offer.durationMins > 0 && <DetailChip icon="solar:hourglass-bold-duotone">{formatDuration(offer.durationMins)}</DetailChip>}
              <DetailChip icon="solar:map-point-bold-duotone">{offer.locationType}</DetailChip>
            </Box>
            {offer.address && offer.address !== 'Your salon' && (
              <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }} noWrap>
                {offer.address}
              </Typography>
            )}
          </Box>
        </Stack>

        {isIncoming ? (
          <Stack
            direction={{ xs: 'row', sm: 'column' }}
            alignItems="center"
            spacing={{ xs: 2, sm: 1.5 }}
            sx={{
              flexShrink: 0,
              pl: { sm: 2.5 },
              pt: { xs: 2, sm: 0 },
              borderLeft: { sm: '1px dashed' },
              borderTop: { xs: '1px dashed', sm: 'none' },
              borderColor: { xs: 'divider', sm: 'divider' },
              width: { sm: 200 },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <OfferCountdown secondsLeft={secondsLeft} totalSeconds={getOfferWindowSeconds(offer, secondsLeft)} size={84} />
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <OfferCountdown secondsLeft={secondsLeft} totalSeconds={getOfferWindowSeconds(offer, secondsLeft)} size={60} showCaption={false} />
            </Box>
            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ flex: 1, width: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={secondsLeft <= 0 || isResponding || Boolean(busyAction)}
                startIcon={busyAction === 'accept' ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
                onClick={() => runAction('accept', onAccept)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {busyAction === 'accept' ? (
                  'Accepting…'
                ) : (
                  <>
                    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                      Accept Offer
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                      Accept
                    </Box>
                  </>
                )}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                disabled={secondsLeft <= 0 || isResponding || Boolean(busyAction)}
                startIcon={busyAction === 'decline' ? <CircularProgress size={16} color="inherit" /> : null}
                onClick={() => runAction('decline', onDecline)}
                sx={{ '&:hover': { color: 'error.main', borderColor: 'error.main' } }}
              >
                {busyAction === 'decline' ? 'Declining…' : 'Decline'}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75} sx={{ flexShrink: 0, minWidth: { sm: 140 } }}>
            <Label variant="soft" color={status.color} startIcon={<Iconify icon={status.icon} width={16} />}>
              {status.label}
            </Label>
            {offer.respondedAt && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {offer.status === 'expired' ? 'Expired' : status.label} {timeAgo(offer.respondedAt, now)}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
