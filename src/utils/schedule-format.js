
export const MONTH_LABELS = { jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec' };

export const BOOKING_STATUS_LABEL_KEYS = { scheduled: 'scheduled', requested: 'requested', ongoing: 'ongoing', expired: 'expired', canceled: 'cancelled', completed: 'completed' };

export const SCHEDULE_STATUS_LABELS = { scheduled: 'Scheduled', ongoing: 'Ongoing', completed: 'Completed' };

export const SCHEDULE_STATUS_ACCENTS = {
  scheduled: '#8b5cf6',
  ongoing: '#f59e0b',
  completed: '#3b82f6',
  requested: '#10b981',
  canceled: '#ef4444',
  expired: '#64748b',
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
