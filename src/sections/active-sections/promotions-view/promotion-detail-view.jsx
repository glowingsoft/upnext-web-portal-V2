import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { useGetPromotionByIdQuery } from 'src/store/Reducer/services-api';

import { PromotionGeneralTab } from './components/promotion-general-tab';

function getPromotionPrice(price, discountType, discountValue) {
  const basePrice = Number(String(price ?? '').replace(/[^0-9.]/g, ''));
  const discount = Number(discountValue);

  if (!Number.isFinite(basePrice) || !Number.isFinite(discount)) return null;
  if (discountType === 'percentage') return Math.max(0, basePrice - (basePrice * discount) / 100);
  if (discountType === 'flat' || discountType === 'fixed') return Math.max(0, basePrice - discount);

  return basePrice;
}

function isUsableImage(url) {
  return Boolean(url && typeof url === 'string' && !url.toLowerCase().includes('noimg') && /^https?:\/\//i.test(url));
}

function PromotionDetailSkeleton() {
  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={90} height={34} />
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
        <Box sx={{ position: 'relative', minHeight: 88, px: 3, py: 2, pl: { xs: 18, md: 22 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton
            variant="rounded"
            width={104} height={104}
            sx={{ position: 'absolute', left: { xs: 20, md: 40 }, top: { xs: -24, md: -30 }, borderRadius: 2.5, border: 'solid 4px #fff', flexShrink: 0 }}
          />
          <Box>
            <Skeleton variant="text" width={200} height={34} />
            <Skeleton variant="text" width={100} height={20} sx={{ mt: 0.3 }} />
          </Box>
          <Skeleton variant="rounded" width={90} height={28} sx={{ ml: 'auto', borderRadius: 999 }} />
        </Box>
        <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider', py: 1.5 }}>
          <Stack direction="row" spacing={0}>
            {[100, 100].map((w, i) => (
              <Skeleton key={i} variant="text" width={w} height={36} sx={{ mx: 2.5 }} />
            ))}
          </Stack>
        </Box>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2.5 }} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

function mapApiPromotion(raw) {
  if (!raw) return null;

  const business = raw.business && typeof raw.business === 'object' ? raw.business : null;
  const targetList = Array.isArray(raw.target) ? raw.target : raw.target ? [raw.target] : [];
  const appliedToList = raw.appliedToList ?? targetList;
  const appliedTo = raw.appliedTo ?? appliedToList[0];

  return {
    ...raw,
    discountValue: raw.discountValue ?? raw.discount,
    usageLimit: raw.usageLimit ?? raw.totalUsageLimit,
    redemptionsUsed: raw.redemptionsUsed ?? raw.redemptions ?? 0,
    redemptionsRemaining: raw.redemptionsRemaining,
    appliedTo,
    appliedToList,
    providerId: raw.providerId ?? business?._id,
    providerName: raw.providerName ?? business?.businessName,
    status: raw.isAvailable === false
      ? 'unavailable'
      : raw.status ?? (raw.expiresAt && new Date(raw.expiresAt) < new Date() ? 'expired' : 'active'),
    reviews: raw.reviews || [],
    averageRating: raw.rating?.avgRating ?? raw.averageRating ?? raw.avgRating,
    reviewCount: raw.rating?.totalReviews ?? raw.reviewCount ?? raw.totalReviews,
    ratingBreakdown: raw.rating?.ratingCount || {},
  };
}

// The marketplace list (GET /app/businesses/promotions) returns a service/package with the
// promotion nested inside it, rather than a promotion document with its target nested inside —
// the inverse shape of mapApiPromotion's input. This maps that shape into the same downstream
// `promotion` interface the tabs already expect, so clicking "Claim Offer" can render the detail
// page straight from data already in hand instead of firing a second request.
function mapStatePromotion(item) {
  if (!item) return null;

  const promo = item.promotion || {};
  const business = item.businessInfo || item.business || {};
  const providerName = business.businessName ?? item.businessName ?? item.providerName;
  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();

  const appliedTo = {
    _id: item._id,
    name: item.name || item.packageName,
    description: item.description,
    image: item.photos?.[0] || item.image,
    photos: item.photos,
    price: item.price ?? item.packagePrice,
    type: item.scope === 'service' ? item.type : undefined,
  };

  return {
    ...item,
    _id: promo._id,
    name: promo.name || item.name || item.packageName,
    promoCode: promo.promoCode,
    discountType: promo.discountType,
    discountValue: promo.discount,
    expiresAt: promo.expiresAt,
    photos: promo.photos?.length ? promo.photos : item.photos,
    description: item.description,
    appliedTo,
    appliedToList: [appliedTo],
    reviewScope: item.scope,
    reviewTargetId: item._id,
    providerId: business._id ?? item.businessId,
    providerName,
    business,
    status: isExpired ? 'expired' : 'active',
    reviews: [],
    isItemLinked: true,
  };
}

export const PromotionDetailView = memo(({ promotion }) => {
  const { t } = useTranslate();
  const router = useRouter();

  const ownPhoto = promotion.photos?.find(isUsableImage);
  const primaryImage = ownPhoto || (isUsableImage(promotion.appliedTo?.image) ? promotion.appliedTo.image : null);
  const discountDisplay = promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : fCurrency(promotion.discountValue);
  const STATUS_COLOR = { active: 'success', expired: 'warning', unavailable: 'error' };
  const STATUS_ICON = { active: 'solar:check-circle-bold', expired: 'solar:close-circle-bold', unavailable: 'solar:close-circle-bold' };

  // Customer "Claim Offer" path: the service/package is the subject of the page, so the hero leads
  // with its name + price, and the promotion is shown as the discount applied on top of that price
  // rather than as the page's primary identity (unlike the provider/admin view of a promotion record).

  
  const isItemLinked = Boolean(promotion.isItemLinked);
  const appliedTo = promotion.appliedTo || {};
  const heroTitle = isItemLinked ? appliedTo.name || promotion.name : promotion.name;
  const itemFinalPrice = isItemLinked ? getPromotionPrice(appliedTo.price, promotion.discountType, promotion.discountValue) : null;
  const itemOriginalPrice = Number(String(appliedTo.price ?? '').replace(/[^0-9.]/g, ''));

  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<Iconify width={16} height={16} sx={{ fontWeight: 800 }} icon="solar:alt-arrow-left-linear" />}
          onClick={() => router.back()}
          sx={{ color: 'text.primary', fontWeight: 800 }}
        >
          {t('back')}
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            height: { xs: 160, md: 200 },
            position: 'relative',
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            minHeight: 88,
            px: { xs: 2.5, md: 3 },
            py: 2,
            pl: { xs: 18, md: 22 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 20, md: 40 },
              top: { xs: -24, md: -30 },
              zIndex: 5,
              width: { xs: 88, md: 104 },
              height: { xs: 88, md: 104 },
              borderRadius: 2.5,
              overflow: 'hidden',
              border: '4px solid #fff',
              bgcolor: '#eadfc8',
              boxShadow: (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.28)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {primaryImage ? (
              <Box
                component="img"
                src={primaryImage}
                alt={promotion.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Iconify icon="solar:tag-price-bold" width={36} sx={{ color: '#b79a73' }} />
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
              {heroTitle}
            </Typography>
            {promotion.providerName && (
              <Typography variant="body2" noWrap sx={{ color: 'text.secondary', mt: 0.25 }}>
                {promotion.providerName}
              </Typography>
            )}
            {isItemLinked && Number.isFinite(itemFinalPrice) && (
              <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'success.main' }}>
                  {fCurrency(itemFinalPrice)}
                </Typography>
                {Number.isFinite(itemOriginalPrice) && itemOriginalPrice > itemFinalPrice && (
                  <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                    {fCurrency(itemOriginalPrice)}
                  </Typography>
                )}
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75, minWidth: 0 }} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={promotion.promoCode || t('notAvailable')}
                icon={<Iconify icon="solar:ticket-bold" width={14} />}
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiChip-icon': { color: 'primary.contrastText', ml: 0.75 },
                }}
              />
              <Chip
                size="small"
                label={t('discountOff', { discount: discountDisplay })}
                sx={{
                  height: 24,
                  fontWeight: 800,
                  fontSize: 11,
                  bgcolor: isItemLinked ? 'error.main' : 'primary.main',
                  color: isItemLinked ? 'error.contrastText' : 'primary.contrastText',
                }}
              />
            </Stack>
            {isItemLinked && promotion.name && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                {t('promotionApplied', { name: promotion.name })}
              </Typography>
            )}
          </Box>

          <Chip
            size="small"
            variant="soft"
            color={STATUS_COLOR[promotion.status] || 'warning'}
            icon={<Iconify icon={STATUS_ICON[promotion.status] || 'solar:close-circle-bold'} width={14} />}
            label={t(promotion.status)}
            sx={{ ml: 'auto', flexShrink: 0, fontWeight: 700, textTransform: 'capitalize' }}
          />
        </Box>

      </Card>

      <Box>
        <PromotionGeneralTab promotion={promotion} />
      </Box>
    </Container>
  );
});

export function PromotionDetailPageView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const location = useLocation();

  // Coming from "Claim Offer" on the marketplace list, the item is already fully in hand — skip
  // the network round-trip entirely and render straight from what was passed via navigation state.
  const statePromotionItem = location.state?.promotion;

  const { data: promotionData, isLoading, isFetching, error } = useGetPromotionByIdQuery(id, {
    skip: !id || Boolean(statePromotionItem),
    refetchOnMountOrArgChange: true,
  });

  const promotion = useMemo(
    () => (statePromotionItem ? mapStatePromotion(statePromotionItem) : mapApiPromotion(promotionData?.data)),
    [statePromotionItem, promotionData?.data]
  );

  if (!statePromotionItem && (isLoading || isFetching)) {
    return <PromotionDetailSkeleton />;
  }

  if (!promotion) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity={error ? 'error' : 'warning'}>{error?.data?.message || t('promotionNotFound')}</Alert>
      </Container>
    );
  }

  return <PromotionDetailView promotion={promotion} />;
}
