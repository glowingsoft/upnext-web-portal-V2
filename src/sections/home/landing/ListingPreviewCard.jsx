import { useState } from 'react';

import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

import { brand } from './theme';
import {
  getInitial,
  previewArrowSx,
  previewBadgeSx,
  previewCardSx,
  previewFooterSx,
  previewLinkSx,
  previewOverlineSx,
} from './previewCardStyles';

// ----------------------------------------------------------------------

const isUsableImage = (url) => Boolean(url && !String(url).toLowerCase().includes('noimg'));

function getListingImage(item) {
  const candidates = [
    item.image,
    item.coverImage,
    ...(item.photos || []),
    ...(item.packageMedia || []),
    ...(item.services || []).flatMap((service) => [service.image, service.coverImage, ...(service.photos || [])]),
  ];
  return candidates.find(isUsableImage) || null;
}

export default function ListingPreviewCard({ item, kind = 'service', onView }) {
  const { t } = useTranslate();
  const isPackage = kind === 'package';

  const name = item.name || item.packageName || (isPackage ? t('package') : t('service'));
  const image = normalizeImageUrl(getListingImage(item));
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  const price = item.packagePrice ?? item.price;
  const hasPrice = price != null && price !== '';
  const hasDiscount = isPackage && item.actualPrice > 0 && item.actualPrice !== price;
  const rating = Number(item.rating || 0);
  const isUnavailable = item.isAvailable === false;
  const includedServices = isPackage ? item.services || [] : [];

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
          ...(!showImage && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${brand.green[100]} 0%, ${brand.green[200]} 100%)`,
          }),
        }}
      >
        {showImage ? (
          <Box
            component="img"
            className="preview-card-image"
            loading="lazy"
            decoding="async"
            src={image}
            alt={name}
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          />
        ) : (
          <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '3.5rem', sm: '3.5rem', md: '3.5rem', lg: '3.5rem' }, color: brand.green[600], opacity: 0.55 }}>
            {getInitial(name)}
          </Typography>
        )}

        <Box sx={{ ...previewBadgeSx, left: 12 }}>
          {isUnavailable ? (
            t('unavailable')
          ) : (
            <>
              <Iconify icon={isPackage ? 'solar:box-minimalistic-bold' : 'solar:scissors-bold'} width={12} sx={{ color: brand.green[600] }} />
              {isPackage ? t('package') : t('service')}
            </>
          )}
        </Box>

        {rating > 0 && (
          <Box sx={{ ...previewBadgeSx, right: 12 }}>
            <Iconify icon="mingcute:star-fill" width={13} sx={{ color: '#F59E0B' }} />
            {rating.toFixed(1)}
          </Box>
        )}
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
          {name}
        </Typography>

        {item.providerName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25, minWidth: 0 }}>
            <Iconify icon="mingcute:store-2-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {item.providerName}
            </Typography>
          </Box>
        )}

        {includedServices.length > 0 && (
          <Box sx={{ mb: 1.25 }}>
            <Typography sx={{ ...previewOverlineSx, mb: 0.5 }}>{t('includes')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {includedServices.slice(0, 3).map((service) => (
                <Box key={service._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Iconify icon="mingcute:check-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
                  <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'text.primary' }}>
                    {service.name || service.serviceName}
                  </Typography>
                </Box>
              ))}
              {includedServices.length > 3 && (
                <Typography sx={{ pl: 2.75, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {t('moreItemsCount', { count: includedServices.length - 3 })}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {(item.duration || item.distance != null) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
            {item.duration && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 99,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: brand.green[800],
                  border: `1px solid ${alpha(brand.green[400], 0.35)}`,
                  bgcolor: alpha(brand.green[400], 0.06),
                }}
              >
                <Iconify icon="mingcute:time-line" width={12} />
                {item.duration}
              </Box>
            )}
            {item.distance != null && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', color: 'text.secondary' }}>
                <Iconify icon="mingcute:location-line" width={13} sx={{ color: brand.green[400] }} />
                {t('kmAway', { distance: Number(item.distance).toFixed(1) })}
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        <Box sx={previewFooterSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={previewOverlineSx}>{t('price')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: hasPrice ? '1.1rem' : '0.85rem', lineHeight: 1.5 }}>
                {hasPrice ? `$${price}` : t('contactForPrice')}
              </Typography>
              {hasDiscount && (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', textDecoration: 'line-through' }}>${item.actualPrice}</Typography>
              )}
            </Box>
          </Box>

          <Box
            component="button"
            type="button"
            aria-label={`View ${name}`}
            onClick={(event) => {
              event.stopPropagation();
              onView?.();
            }}
            sx={previewLinkSx}
          >
            {t('viewDetails')}
            <Box className="preview-card-arrow" sx={previewArrowSx}>
              <Iconify icon="mingcute:arrow-right-line" width={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
