export const INSTANT_STATUS_META = {
  requested: { label: 'Waiting for provider', color: 'warning', icon: 'solar:hourglass-bold' },
  awaiting_customer_decision: { label: 'Action needed', color: 'info', icon: 'solar:bell-bing-bold' },
  accepted: { label: 'Accepted', color: 'success', icon: 'solar:check-circle-bold' },
  accepted_awaiting_payment: { label: 'Accepted · Payment pending', color: 'info', icon: 'solar:card-bold' },
  confirmed: { label: 'Confirmed', color: 'success', icon: 'solar:check-circle-bold' },
  ongoing: { label: 'In progress', color: 'primary', icon: 'solar:play-circle-bold' },
  completed: { label: 'Completed', color: 'success', icon: 'solar:check-circle-bold' },
  canceled: { label: 'Cancelled', color: 'error', icon: 'solar:close-circle-bold' },
  expired: { label: 'Expired', color: 'default', icon: 'solar:clock-circle-bold' },
};

export const INSTANT_STATUS_TABS = ['requested', 'awaiting_customer_decision', 'accepted_awaiting_payment', 'confirmed', 'ongoing', 'completed', 'canceled'];

export function humanizeStatus(value) {
  const text = String(value || '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getInstantStatusMeta(status) {
  return INSTANT_STATUS_META[status] || { label: humanizeStatus(status), color: 'default', icon: 'solar:info-circle-bold' };
}
