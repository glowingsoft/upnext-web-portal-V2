import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales/use-locales';
import { formatPaymentStatusLabel, getPaymentStatusColor } from 'src/sections/active-sections/sessions-view/utils/booking-normalizer';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

import { BOOKING_STATUS_COLOR, BOOKING_STATUS_LABEL_COLOR, formatBookingTimeRange } from './utils/map-bookings-to-events';

// ----------------------------------------------------------------------

export function personLabel(t, name, isProvider) {
  if (!name) return '';
  return isProvider
    ? t('clientWithName', { name })
    : t('withProviderName', { name });
}

export function CalendarDayPanel({ selectedDate, bookings, eventsById, selectedBookingId, isProvider, nextEvent, onOpenBooking, onSelectEvent }) {
  const { t } = useTranslate();
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  return (
    <Box sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
            {dayjs(selectedDate).format('dddd, MMM D')}
          </Typography>
          {isToday && (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {t('today')}
            </Typography>
          )}
        </Box>

        {bookings.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
            {t('bookingsOnDay', { count: bookings.length })}
          </Typography>
        )}
      </Stack>

      {bookings.length === 0 ? (
        <Stack spacing={2}>
          <Stack alignItems="center" spacing={1} sx={{ py: 3, color: 'text.disabled', textAlign: 'center' }}>
            <Iconify icon="solar:calendar-mark-bold-duotone" width={36} />
            <Typography variant="body2">{t('nothingBookedThisDay')}</Typography>
          </Stack>

          {nextEvent && (
            <Box
              role="button"
              tabIndex={0}
              onClick={() => onSelectEvent(nextEvent)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectEvent(nextEvent);
                }
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.4)}`,
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                transition: (theme) => theme.transitions.create(['background-color']),
                '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) },
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', mb: 0.25, fontWeight: 700, color: 'primary.main', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                {t('nextBooking')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {nextEvent.extendedProps.serviceName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                {dayjs(nextEvent.start).format('ddd, MMM D')} · {dayjs(nextEvent.start).format('h:mm A')}
                {nextEvent.extendedProps.personName ? ` · ${personLabel(t, nextEvent.extendedProps.personName, isProvider)}` : ''}
              </Typography>
            </Box>
          )}
        </Stack>
      ) : (
        <Stack spacing={1}>
          {bookings.map((booking) => {
            const isSelected = booking._id === selectedBookingId;
            const isOnsite = booking.deliveryMethod === 'onsite';
            const durationMins = booking.serviceSummary?.durationMins;
            const calendarEvent = eventsById[booking._id];
            const timeLabel = calendarEvent ? formatBookingTimeRange(calendarEvent.start, calendarEvent.end) : booking.slot;

            return (
              <Stack
                key={booking._id}
                direction="row"
                alignItems="flex-start"
                spacing={1.5}
                onClick={() => onOpenBooking(booking._id)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: (theme) => `1px solid ${isSelected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                  borderLeft: (theme) => `3px solid ${BOOKING_STATUS_COLOR[booking.status] || theme.vars.palette.grey[500]} !important`,
                  bgcolor: isSelected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06) : 'transparent',
                  transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                  },
                }}
              >
                <Avatar
                  src={booking.photos?.[0]}
                  variant="rounded"
                  sx={{ width: 40, height: 40, fontSize: 13, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark' }}
                >
                  <Iconify icon="solar:box-minimalistic-bold" width={20} />
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {booking.serviceName}
                    </Typography>
                    <Tooltip title={t(booking.deliveryMethod, { defaultValue: booking.deliveryMethod })} arrow placement="top">
                      <span style={{ display: 'flex' }}>
                        <Iconify icon={isOnsite ? 'solar:map-point-bold' : 'solar:laptop-bold'} width={13} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                      </span>
                    </Tooltip>
                  </Stack>

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                    {personLabel(t, isProvider ? booking.client?.name : booking.providerName, isProvider)}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                    <Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {[timeLabel, durationMins ? `${durationMins} min` : null].filter(Boolean).join(' · ')}
                    </Typography>
                  </Stack>

                  {isOnsite && booking.venueLocation && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                      <Iconify icon="solar:map-point-bold" width={12} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                        {booking.venueLocation}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 0.75, gap: 0.5 }}>
                    <Label variant="soft" color={BOOKING_STATUS_LABEL_COLOR[booking.status] || 'default'} sx={{ textTransform: 'capitalize' }}>
                      {t(booking.status === 'canceled' ? 'cancelled' : booking.status)}
                    </Label>

                    {booking.paymentStatus && (
                      <Label variant="soft" color={getPaymentStatusColor(booking.paymentStatus)} sx={{ textTransform: 'none' }}>
                        {t(booking.paymentStatus, { defaultValue: formatPaymentStatusLabel(booking.paymentStatus) })}
                      </Label>
                    )}
                  </Stack>
                </Box>

                <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                  {booking.price != null && (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {fCurrency(booking.price)}
                    </Typography>
                  )}
                  <Iconify icon="solar:alt-arrow-right-bold" width={16} sx={{ color: 'text.disabled' }} />
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
