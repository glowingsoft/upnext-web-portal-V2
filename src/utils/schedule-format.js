import { error, grey, info, primary, success, warning } from 'src/theme/core/palette';

export const MONTH_LABELS = { jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec' };

export const BOOKING_STATUS_LABEL_KEYS = { scheduled: 'scheduled', requested: 'requested', ongoing: 'ongoing', expired: 'expired', canceled: 'cancelled', completed: 'completed' };

export const SCHEDULE_STATUS_LABELS = { scheduled: 'Scheduled', ongoing: 'Ongoing', completed: 'Completed' };

export const SCHEDULE_STATUS_ACCENTS = {
  scheduled: info.main,
  ongoing: primary.main,
  completed: success.main,
  requested: warning.main,
  canceled: error.main,
  expired: grey[500],
};

export function formatSlotTime12h(open) {
  if (!open) return { time: '--:--', meridiem: '' };
  const [hStr, mStr] = open.split(':');
  const hour24 = parseInt(hStr, 10);
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return { time: `${String(hour12).padStart(2, '0')}:${mStr}`, meridiem };
}

export function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?';
}

export function getScheduleStatusLabel(statusKey) {
  return SCHEDULE_STATUS_LABELS[statusKey] || (statusKey ? statusKey.charAt(0).toUpperCase() + statusKey.slice(1) : 'Scheduled');
}
