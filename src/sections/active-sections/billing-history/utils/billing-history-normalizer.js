import { normalizeImageUrl } from 'src/utils/normalize-image-url';

function getTarget(raw) {
  if (Array.isArray(raw?.target)) return raw.target[0] || {};
  return raw?.target || {};
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

export function normalizeBillingHistoryRow(raw = {}) {
  const target = getTarget(raw);
  const customer = raw.customer || {};
  const customerName = customer.name || raw.customerName || '';

  return {
    _id: raw.bookingId || raw._id,
    bookingId: raw.bookingId || raw._id,
    bookingNumber: raw.bookingNumber,
    customerName,
    customerInitial: getInitial(customerName),
    customerEmail: customer.email || raw.customerEmail || '',
    customerAvatar: normalizeImageUrl(customer.profileImage || raw.customerAvatar),
    serviceName: target.name || raw.serviceName || '',
    serviceImage: normalizeImageUrl(target.photos?.[0] || raw.serviceImage),
    preferredServiceType: target.preferredServiceType || raw.preferredServiceType || '',
    amount: raw.amount ?? raw.price ?? target.actaulPrice ?? target.price ?? 0,
    currency: raw.currency,
    paymentMethod: raw.paymentMethod || '',
    transactionId: raw.transactionId || '',
    status: String(raw.status || raw.paymentStatus || '').toLowerCase(),
    billingDate: raw.date || raw.createdAt || raw.billingDate,
  };
}

export function normalizeBillingHistoryRows(rows = []) {
  return rows.map(normalizeBillingHistoryRow);
}

export function normalizeBillingHistoryDetail(raw = {}) {
  const target = getTarget(raw);
  const customerName = raw.customerName || raw.customer?.name || '';

  return {
    bookingId: raw._id || raw.bookingId,
    bookingNumber: raw.bookingNumber,
    customerName,
    customerInitial: getInitial(customerName),
    customerEmail: raw.customer?.email || raw.customerEmail || '',
    customerAvatar: normalizeImageUrl(raw.customer?.profileImage || raw.customerAvatar),
    serviceName: target.name || raw.serviceName || '',
    serviceImage: normalizeImageUrl(target.photos?.[0] || raw.serviceImage),
    preferredServiceType: target.preferredServiceType || '',
    price: raw.price ?? target.actaulPrice ?? target.price ?? 0,
    currency: raw.currency,
    platformFee: raw.platformPayment,
    paymentMethod: raw.paymentMethod || '',
    transactionId: raw.transactionId || '',
    paymentStatus: String(raw.paymentStatus || raw.status || '').toLowerCase(),
    slotOpen: raw.slot?.open,
    slotClose: raw.slot?.close,
    isOverNight: Boolean(raw.slot?.isOverNight),
    durationMins: raw.sessionSlotMins,
  };
}
