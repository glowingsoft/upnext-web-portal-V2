export function parseInstantTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;

  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getLocalInstantDeadline(expiresAt, serverNow) {
  const expiryMs = parseInstantTimestamp(expiresAt);
  if (!expiryMs) return null;

  const serverNowMs = parseInstantTimestamp(serverNow);
  const remainingMs = expiryMs - (serverNowMs ?? Date.now());
  return Date.now() + Math.max(0, remainingMs);
}

export function getInstantOfferDeadline(booking = {}, response = {}) {
  const offer =
    response.offer ||
    response.currentOffer ||
    response.flow?.currentOffer ||
    booking.flow?.currentOffer ||
    booking.currentOffer ||
    booking.offer ||
    {};
  const expiresAt =
    offer.expiresAt ??
    response.offerExpiresAt ??
    response.flow?.attemptExpiresAt ??
    booking.offerExpiresAt ??
    booking.flow?.attemptExpiresAt ??
    response.expiresAt ??
    booking.expiresAt;
  const serverNow = offer.serverNow ?? response.serverNow ?? booking.serverNow;

  return getLocalInstantDeadline(expiresAt, serverNow);
}
