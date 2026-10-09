import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { alpha } from '@mui/material/styles';

import { error, grey, info, primary, success, warning } from 'src/theme/core/palette';

dayjs.extend(customParseFormat);

export const BOOKING_STATUS_COLOR = {
  requested: warning.main,
  scheduled: info.main,
  ongoing: primary.main,
  completed: success.main,
  expired: grey[500],
  canceled: error.main,
};

export const BOOKING_STATUS_LABEL_COLOR = {
  requested: 'warning',
  scheduled: 'info',
  ongoing: 'primary',
  completed: 'success',
  expired: 'default',
  canceled: 'error',
};

const LONG_EVENT_THRESHOLD_MINUTES = 240;

export function formatBookingTimeRange(start, end) {
  if (!start) return '';

  const from = dayjs(start);
  const to = end ? dayjs(end) : null;
  if (!to || !to.isValid()) return from.format('h:mm A');

  const sameHalf = from.format('A') === to.format('A');
  return `${from.format(sameHalf ? 'h:mm' : 'h:mm A')} – ${to.format('h:mm A')}`;
}

function parseTimeOnDate(baseDate, timeStr) {
  const cleaned = String(timeStr || '').trim();
  if (!cleaned) return null;

  const parsed = dayjs(cleaned, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm'], true);
  if (!parsed.isValid()) return null;

  return baseDate.hour(parsed.hour()).minute(parsed.minute()).second(0).millisecond(0);
}

function buildBookingEventTimes(booking) {
  const baseDate = dayjs(booking.date || booking.requestedAt || new Date());
  const slotLabel = booking.slot || '';
  const [startLabel, endLabel] = slotLabel.includes('-') ? slotLabel.split('-') : [slotLabel, null];
  const durationMins = booking.serviceSummary?.durationMins || 60;

  const start = parseTimeOnDate(baseDate, startLabel) || baseDate.hour(9).minute(0).second(0).millisecond(0);
  let end = endLabel ? parseTimeOnDate(baseDate, endLabel) : null;
  if (!end || !end.isAfter(start)) end = start.add(durationMins, 'minute');

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    displayDate: start.format('MMM D, YYYY'),
    displaySlot: slotLabel || start.format('h:mm A'),
  };
}

export function mapBookingsToCalendarEvents(bookings = [], { isProvider = false } = {}) {
  return bookings.map((booking) => {
    const { start, end, displayDate, displaySlot } = buildBookingEventTimes(booking);
    const color = BOOKING_STATUS_COLOR[booking.status] || primary.main;
    const personName = isProvider ? booking.client?.name : booking.providerName;
    const durationMinutes = dayjs(end).diff(dayjs(start), 'minute');
    const isLongWindow = durationMinutes >= LONG_EVENT_THRESHOLD_MINUTES;

    return {
      id: booking._id,
      title: booking.serviceName,
      start,
      end,
      allDay: isLongWindow,
      backgroundColor: alpha(color, 0.16),
      borderColor: alpha(color, 0.32),
      textColor: color,
      extendedProps: {
        bookingId: booking._id,
        serviceName: booking.serviceName,
        personName,
        dateLabel: displayDate,
        timeSlot: displaySlot,
        status: booking.status,
        price: booking.price,
      },
    };
  });
}
