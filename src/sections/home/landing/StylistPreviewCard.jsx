import { useState } from 'react';

import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

import { brand } from './theme';

// ----------------------------------------------------------------------

const badgeSx = {
  position: 'absolute',
  top: 12,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.25,
  py: 0.5,
  borderRadius: 99,
  fontSize: '0.72rem',
  fontWeight: 700,
  lineHeight: 1.4,
  color: 'text.primary',
  bgcolor: alpha('#fff', 0.92),
  backdropFilter: 'blur(6px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

export default function StylistPreviewCard({ business, onSelectStylist }) {
  const handleSelect = () => onSelectStylist?.({ id: business._id, slug: business.nameSlug });

  const image = normalizeImageUrl(business.image);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  const minPrice = business.priceRange?.min;
  const distance = business.distance ?? business.distanceKm ?? null;
  const initial = (business.businessName || '?').trim().charAt(0).toUpperCase() || '?';
  const visibleCategories = (business.categories || []).slice(0, 2);
  const extraCategoryCount = (business.categories || []).length - visibleCategories.length;

  const avgRating = Number(business.rating?.avgRating || 0);
  const bookingsCount = business.bookingsCount ?? 0;

  return (
    <Box
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
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(brand.green[400], 0.2)}`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(brand.green[400], 0.5),
          boxShadow: `0 24px 48px -24px ${alpha(brand.green[800], 0.35)}`,
        },
        '&:hover .stylist-card-image': { transform: 'scale(1.05)' },
        '&:hover .stylist-card-arrow': { bgcolor: brand.green[400], color: '#fff', borderColor: brand.green[400] },
        '&:focus-visible': { outline: `2px solid ${brand.green[400]}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '16 / 10',
          bgcolor: brand.green[100],
          ...(!showImage && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${brand.green[100]} 0%, ${brand.green[200]} 100%)`,
          }),
        }}
      >
        {showImage && (
          <Box
            component="img"
            className="stylist-card-image"
            loading="lazy"
            decoding="async"
            src={image}
            alt={business.businessName}
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          />
        )}

        {!showImage && (
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: '3.5rem', color: brand.green[600], opacity: 0.55 }}>
            {initial}
          </Typography>
        )}

        {business.isAvailable !== undefined && (
          <Box sx={{ ...badgeSx, left: 12 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: business.isAvailable ? 'success.main' : 'text.disabled',
              }}
            />
            {business.isAvailable ? 'Available' : 'Unavailable'}
          </Box>
        )}

        <Box sx={{ ...badgeSx, right: 12 }}>
          {avgRating > 0 ? (
            <>
              <Iconify icon="mingcute:star-fill" width={13} sx={{ color: '#F59E0B' }} />
              {avgRating.toFixed(1)}
            </>
          ) : (
            'New'
          )}
        </Box>
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" noWrap sx={{ mb: 0.5, fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.15rem', md: '1.15rem', lg: '1.2rem' }, lineHeight: 1.3 }}>
          {business.businessName}
        </Typography>

        {distance != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Iconify icon="mingcute:location-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{`${Number(distance).toFixed(1)} km away`}</Typography>
          </Box>
        )}

        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.25,
            fontSize: '0.82rem',
            lineHeight: 1.55,
            color: 'text.secondary',
          }}
        >
          {business.description}
        </Typography>

        {visibleCategories.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
            {visibleCategories.map((cat) => (
              <Box
                key={cat._id}
                sx={{
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
                {cat.name}
              </Box>
            ))}
            {extraCategoryCount > 0 && (
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary' }}>+{extraCategoryCount}</Typography>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            pt: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled' }}>
              {minPrice ? 'Starting from' : 'Pricing'}
            </Typography>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: minPrice ? '1.1rem' : '0.85rem', lineHeight: 1.5, color: 'text.primary' }}>
              {minPrice ? `$${minPrice}` : 'Contact for price'}
            </Typography>
            {bookingsCount > 0 && (
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {bookingsCount} {bookingsCount === 1 ? 'booking' : 'bookings'}
              </Typography>
            )}
          </Box>

          <Box
            component="button"
            type="button"
            aria-label={`View ${business.businessName} profile`}
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              flexShrink: 0,
              p: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: brand.green[600],
            }}
          >
            View Profile
            <Box
              className="stylist-card-arrow"
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: brand.green[600],
                border: `1px solid ${alpha(brand.green[400], 0.5)}`,
                transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
              }}
            >
              <Iconify icon="mingcute:arrow-right-line" width={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
