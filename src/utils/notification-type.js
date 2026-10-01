// the notifications drawer and the FCM toast so both look consistent.
const TYPE_ICON = {
  booking: { icon: 'solar:calendar-mark-bold', color: 'primary' },
  message: { icon: 'solar:chat-round-dots-bold', color: 'info' },
  payment: { icon: 'solar:wallet-money-bold', color: 'success' },
  promotion: { icon: 'solar:tag-price-bold', color: 'warning' },
  review: { icon: 'solar:star-bold', color: 'warning' },
};
const DEFAULT_TYPE_ICON = { icon: 'solar:bell-bold', color: 'primary' };

export function getNotificationTypeMeta(type = '') {
  const key = Object.keys(TYPE_ICON).find((k) => type.toLowerCase().includes(k));
  return TYPE_ICON[key] || DEFAULT_TYPE_ICON;
}
