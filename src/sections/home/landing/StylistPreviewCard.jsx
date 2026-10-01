import { useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

import SurfaceCard from './SurfaceCard';
import { brand } from './theme';

// ----------------------------------------------------------------------

export default function StylistPreviewCard({ business, onSelectStylist }) {
  const handleSelect = () => onSelectStylist?.({ id: business._id });

  const image = normalizeImageUrl(business.image);
  // Some uploaded objects 404/403 straight from storage (bad ACL, etc.) — a CSS background-image
  // would just silently render nothing in that case, so use a real <img> and fall back to the
  // initials placeholder on a genuine load failure instead.
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;
  const priceLabel = business.priceRange?.min ? `$${business.priceRange.min}+` : 'Contact for price';
  const distance = business.distance ?? business.distanceKm ?? null;
  const initial = (business.businessName || '?').trim().charAt(0).toUpperCase() || '?';
  const visibleCategories = (business.categories || []).slice(0, 2);
  const extraCategoryCount = (business.categories || []).length - visibleCategories.length;

  return (
    <SurfaceCard
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 10px 26px ${alpha(theme.palette.primary.main, 0.16)}`,
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          height: 200,
          position: 'relative',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          ...(!showImage && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${alpha(brand.green[400], 0.16)} 0%, ${alpha(brand.green[600], 0.28)} 100%)`,
          }),
        }}
      >
        {showImage && (
          <Box
            component="img"
            src={image}
            alt={business.businessName}
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover' }}
          />
        )}

        {!showImage && (
          <Typography variant="h2" sx={{ fontWeight: 800, color: brand.green[700], opacity: 0.5 }}>
            {initial}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
            {business.businessName}
          </Typography>
          {business.isAvailable !== undefined && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: business.isAvailable ? 'success.main' : 'text.disabled',
              }}
            />
          )}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
            lineHeight: 1.6,
          }}
        >
          {business.description}
        </Typography>

        {visibleCategories.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.25, rowGap: 0.5 }}>
            {visibleCategories.map((cat) => (
              <Box key={cat._id} sx={{ px: 1, py: 0.25, borderRadius: 99, bgcolor: alpha(brand.green[400], 0.1) }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: brand.green[700], fontSize: '0.68rem' }}>
                  {cat.name}
                </Typography>
              </Box>
            ))}
            {extraCategoryCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', fontSize: '0.68rem' }}>
                +{extraCategoryCount}
              </Typography>
            )}
          </Stack>
        )}

        {distance != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
            <Iconify icon="mingcute:location-fill" width={13} sx={{ color: brand.green[600], flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
              {`${Number(distance).toFixed(1)} km away`}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <Iconify icon="mingcute:star-fill" width={13} sx={{ color: '#F59E0B', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            {Number(business.rating?.avgRating || 0).toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({business.bookingsCount ?? 0} bookings)
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
            {priceLabel}
          </Typography>
        </Box>

        <Box
          component="button"
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSelect(); }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: brand.green[600],
            px: 0,
            py: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          View Profile
          <Iconify icon="mingcute:arrow-right-line" width={14} />
        </Box>
      </Box>
    </SurfaceCard>
  );
}
