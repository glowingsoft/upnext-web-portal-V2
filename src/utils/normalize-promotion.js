export const getPromotionItemId = (item) => item?._id || item?.id;

export function normalizePromotion(item) {
  const promo = item.promotion || {};
  const business = item.businessInfo || item.business || {};
  const providerName = business.businessName ?? item.businessName ?? item.providerName;

  return {
    ...item,
    _id: getPromotionItemId(item), // the underlying service/package id, kept for nav/key fallbacks
    promotionId: promo._id,
    scope: item.scope,
    targetId: getPromotionItemId(item),
    name: promo.name || item.name || item.packageName,
    targetName: item.name || item.packageName,
    promoCode: promo.promoCode,
    discountType: promo.discountType,
    discountValue: promo.discount,
    expiresAt: promo.expiresAt,
    providerName,
    providerId: business._id,
    image: promo.photos?.[0] || item.photos?.[0] || item.image,
    description: item.description,
    distance: item.distance ?? item.distanceKm ?? business.distanceKm,
  };
}
