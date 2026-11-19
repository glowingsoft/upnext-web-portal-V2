import dayjs from 'dayjs';

import { fDate } from 'src/utils/format-time';

const fallbackImage = '/assets/images/salon/promotion-hero.png';

const PAYMENT_STATUS_COLOR = {
  paid: 'success',
  captured: 'success',
  released: 'success',
  card_saved: 'default',
  authorized: 'info',
  refunded: 'info',
  vaulted: 'warning',
  pending: 'warning',
  failed: 'error',
  requires_payment_fix: 'error',
};

export function getPaymentStatusColor(status) {
  return PAYMENT_STATUS_COLOR[status] || 'warning';
}

// Humanizes a snake_case backend status ("requires_payment_fix") into a readable label

export function formatPaymentStatusLabel(status) {
  if (!status) return '';
  return String(status)
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getTarget(raw) {
  if (Array.isArray(raw?.target)) return raw.target[0] || {};
  // The admin booking-detail endpoint nests the booked service/package under `bookedService`
  // instead of `target` — treat it the same way so name/price/photos/rating all resolve.
  return raw?.target || raw?.bookedService || {};
}

function getInitials(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return '?';

  return cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getPaymentStatus(raw) {
  if (raw?.paymentStatus) return raw.paymentStatus;
  if (raw?.paymentInfo?.status) return raw.paymentInfo.status;
  if (raw?.payment && typeof raw.payment === 'object') return raw.payment.status;
  return null;
}

function getSlotLabel(raw) {
  const slotOpen = raw?.slot?.open || raw?.slotOpen;
  const slotClose = raw?.slot?.close || raw?.slotClose;

  if (slotOpen) return slotClose ? `${slotOpen} - ${slotClose}` : slotOpen;
  if (typeof raw?.slot === 'string') return raw.slot;

  return '';
}

function getDayLabel(raw) {
  if (raw?.dayOfWeek || raw?.day) return raw.dayOfWeek || raw.day;
  if (!raw?.date) return null;

  return dayjs(raw.date).isValid() ? fDate(raw.date) : raw.date;
}

// GeoJSON coordinate order is [lng, lat]; [0, 0] is a placeholder default, not a real point.

function getVenueMapUrl(location, address) {
  const coords = Array.isArray(location?.coordinates) && location.coordinates.length === 2 ? location.coordinates : null;
  const hasRealCoords = coords && (coords[0] !== 0 || coords[1] !== 0);

  if (hasRealCoords) return `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`;
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return null;
}

export function normalizeBooking(raw = {}) {
  const target = getTarget(raw);
  const userInfo = raw.userInfo || raw.user || raw.client || {};
  const providerInfo = raw.provider && typeof raw.provider === 'object' ? raw.provider : {};
  const businessInfo = raw.businessInfo || (raw.business && typeof raw.business === 'object' ? raw.business : {}) || {};
  const customerName = userInfo.name || raw.customerName || raw.clientName || '';
  const businessName =
    providerInfo.businessName ||
    businessInfo.businessName ||
    businessInfo.name ||
    raw.businessName ||
    raw.providerName ||
    (typeof raw.provider === 'string' ? raw.provider : raw.provider?.name) ||
    (typeof raw.business === 'string' ? raw.business : '') ||
    '';
  const businessImage = providerInfo.image || businessInfo.image;
  const serviceName =
    raw.name ||
    raw.entityName ||
    target.name ||
    (typeof raw.service === 'string' ? raw.service : raw.service?.name) ||
    raw.package?.name ||
    raw.serviceName ||
    '';

  // The admin bookings list returns `price` as { paid, originalPrice, discount, isDiscounted,
  // currency } rather than a flat number — other endpoints (e.g. booking detail) still send a
  // plain numeric price, so support both shapes.
  const priceObj = raw.price && typeof raw.price === 'object' ? raw.price : null;
  const price = priceObj
    ? priceObj.paid
    : raw.snapshot?.pricing?.finalPrice ?? raw.finalPrice ?? raw.price ?? target.price ?? raw.originalPrice;
  const actualPriceRaw = priceObj?.isDiscounted
    ? priceObj.originalPrice
    : target.actaulPrice ?? target.actualPrice ?? raw.actaulPrice ?? raw.actualPrice;
  const actualPrice = typeof actualPriceRaw === 'number' && actualPriceRaw > (price ?? 0) ? actualPriceRaw : null;
  const serviceImage = (typeof raw.service === 'object' && (raw.service?.image || raw.service?.photos?.[0])) || null;
  const packageImage = raw.package?.image || raw.package?.photos?.[0] || null;
  const photos = raw.photos || target.photos || raw.service?.photos || raw.package?.photos || (serviceImage ? [serviceImage] : []) || (packageImage ? [packageImage] : []) || [];

  const deliveryMethod =
    (typeof raw.type === 'string' ? raw.type : null) ||
    raw.serviceType ||
    (typeof target.type === 'string' ? target.type : null) ||
    raw.deliveryMethod ||
    'onsite';
  const paymentStatus = getPaymentStatus(raw);
  const slot = getSlotLabel(raw);
  const day = getDayLabel(raw);

  return {
    ...raw,
    _id: raw._id,
    bookingId: raw.bookingId,
    clientId: raw.userId || userInfo._id || (typeof raw.user === 'string' ? raw.user : raw.user?._id),

    providerId: providerInfo._id || businessInfo.user || raw.businessId || businessInfo._id || raw.business?._id,
    serviceName,
    serviceType: raw.scope || raw.serviceType || 'service',
    deliveryMethod,
    status: raw.status || 'requested',
    paymentStatus,
    price,
    actualPrice,
    client: {
      ...userInfo,
      name: customerName,
      initials: getInitials(customerName),
    },
    providerName: businessName,
    business: { ...businessInfo, image: businessImage },
    day,
    date: raw.date,
    slot,
    requestedAt: raw.createdAt || raw.requestedAt,
    photos,
    cover: raw.coverImage || photos[0] || businessImage || raw.cover || fallbackImage,
    serviceSummary: {
      ...(raw.serviceSummary || {}),
      image: raw.serviceSummary?.image || raw.coverImage || photos[0] || businessImage || fallbackImage,
      durationMins: raw.serviceSummary?.durationMins ?? raw.sessionSlotMins ?? target.durationMins ?? (typeof raw.service === 'object' ? raw.service?.sessionSlotMins : undefined),
      description: raw.serviceSummary?.description ?? raw.description ?? target.description ?? (typeof raw.service === 'object' ? raw.service?.description : undefined),
      rating:
        raw.serviceSummary?.rating ??
        target.rating?.avgRating ??
        (typeof raw.service === 'object' ? raw.service?.rating?.avgRating ?? raw.service?.rating : undefined),
      reviewCount:
        raw.serviceSummary?.reviewCount ??
        target.rating?.totalReviews ??
        (typeof raw.service === 'object' ? raw.service?.rating?.totalReviews ?? raw.service?.reviewCount : undefined),
    },
    preferredServiceType:
      raw.preferredServiceType?.optionName ||
      (typeof raw.type === 'object' ? raw.type?.optionName : null) ||
      (typeof target.type === 'object' ? target.type?.optionName : null) ||
      null,
    venueTitle: businessName,
    venueLocation: businessInfo.location?.address || providerInfo.location?.address || raw.venueLocation,
    venueMapUrl: getVenueMapUrl(
      businessInfo.location || providerInfo.location,
      businessInfo.location?.address || providerInfo.location?.address || raw.venueLocation
    ),
    target: Array.isArray(raw.target) ? raw.target : raw.target ? [raw.target] : [],
    mode: raw.mode || null,
    instant: raw.mode === 'instant' ? raw : null,
  };
}

export function normalizeBookings(rows = []) {
  return rows.map(normalizeBooking);
}
