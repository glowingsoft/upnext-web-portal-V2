import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { fDate } from 'src/utils/format-time';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

import { brand } from 'src/sections/home/landing/theme';
import {
  getInitial,
  previewArrowSx,
  previewBadgeSx,
  previewCardSx,
  previewFooterSx,
  previewLinkSx,
  previewOverlineSx,
} from 'src/sections/home/landing/previewCardStyles';

// ----------------------------------------------------------------------

const isUsableImage = (url) => Boolean(url && !String(url).toLowerCase().includes('noimg'));

function InfoLine({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Iconify icon={icon} width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
      <Typography noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function PromotionCard({ svc, providerName, onView, hideDistance, actionLabel }) {
  const { t } = useTranslate();

  const image = isUsableImage(svc.image) ? normalizeImageUrl(svc.image) : null;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  const isUnavailable = svc.isAvailable === false;
  const provider = providerName ?? svc.providerName;

  const discountValue = svc.discountValue ?? svc.discount;
  const hasDiscount = discountValue != null && discountValue !== '';
  const discountLabel = hasDiscount
    ? `${svc.discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`} ${t('off')}`
    : '';

  const expiry = svc.expiresAt || svc.validUntil || svc.expiryDate || svc.endDate;
  const validUntil = expiry ? fDate(expiry) : '';

  return (
    <Box
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onView?.();
        }
      }}
      sx={previewCardSx}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          aspectRatio: '16 / 10',
          bgcolor: brand.green[100],
          ...(isUnavailable && { filter: 'grayscale(0.5)', opacity: 0.75 }),
          ...(!showImage && { display: 'flex', alignItems: 'center', justifyContent: 'center' }),
        }}
      >
        {showImage ? (
          <Box
            component="img"
            className="preview-card-image"
            loading="lazy"
            decoding="async"
            src={image}
            alt={svc.name}
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          />
        ) : (
          <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '3.5rem', sm: '3.5rem', md: '3.5rem', lg: '3.5rem' }, color: brand.green[600], opacity: 0.55 }}>
            {getInitial(svc.name)}
          </Typography>
        )}

        {hasDiscount && !isUnavailable && (
          <Box
            sx={{
              ...previewBadgeSx,
              left: 12,
              color: '#fff',
              bgcolor: brand.green[400],
              backdropFilter: 'none',
              boxShadow: `0 4px 12px ${alpha(brand.green[800], 0.35)}`,
            }}
          >
            <Iconify icon="solar:tag-price-bold" width={13} />
            {discountLabel}
          </Box>
        )}

        {isUnavailable && <Box sx={{ ...previewBadgeSx, left: 12 }}>{t('unavailable')}</Box>}
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 0.5,
            fontWeight: 700,
            fontSize: { xs: '1.15rem', sm: '1.15rem', md: '1.15rem', lg: '1.2rem' },
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {svc.name}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          {provider && <InfoLine icon="mingcute:store-2-line">{provider}</InfoLine>}

          {svc.targetName && (
            <InfoLine icon="mingcute:scissors-line">
              {t('appliesTo')}:{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {svc.targetName}
              </Box>
            </InfoLine>
          )}

          {validUntil && (
            <InfoLine icon="mingcute:calendar-line">
              {t('validUntil')}:{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {validUntil}
              </Box>
            </InfoLine>
          )}

          {!hideDistance && svc.distance != null && (
            <InfoLine icon="mingcute:location-line">{t('kmAway', { distance: Number(svc.distance).toFixed(1) })}</InfoLine>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={previewFooterSx}>
          <Box sx={{ minWidth: 0 }}>
            {hasDiscount && (
              <>
                <Typography sx={previewOverlineSx}>{t('discount')}</Typography>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.5, color: 'text.primary' }}>
                  {discountLabel}
                </Typography>
              </>
            )}
          </Box>

          <Box
            component="button"
            type="button"
            aria-label={svc.name}
            onClick={(event) => {
              event.stopPropagation();
              onView?.();
            }}
            sx={previewLinkSx}
          >
            {actionLabel || t('claimOffer', { defaultValue: 'Claim Offer' })}
            <Box className="preview-card-arrow" sx={previewArrowSx}>
              <Iconify icon="mingcute:arrow-right-line" width={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
