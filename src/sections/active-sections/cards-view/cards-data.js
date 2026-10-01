// ----------------------------------------------------------------------

export function maskCardNumber(last4) {
  if (!last4) return '-';
  return `**** **** **** ${last4}`;
}

export function normalizeCard(raw) {
  return {
    id: raw._id,
    stripePaymentMethodId: raw.stripePaymentMethodId || '',
    cardHolderName: raw.cardHolderName || '',
    brand: raw.brand || '',
    last4: raw.last4 || '',
    cardNumber: maskCardNumber(raw.last4),
    expMonth: raw.expMonth,
    expYear: raw.expYear,
    expiryDate: raw.expMonth && raw.expYear ? `${String(raw.expMonth).padStart(2, '0')} / ${raw.expYear}` : '-',
    isDefault: Boolean(raw.isDefault),
  };
}
