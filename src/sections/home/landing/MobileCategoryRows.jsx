import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Skeleton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useGetPublicBusinessesQuery } from 'src/store/Reducer/businesses-api';
import { fCurrency } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

import { brand } from './theme';

const FETCH_LIMIT = 50;
const ROW_LIMIT = 10;
const CARD_WIDTH = 'calc((100% - 12px) / 2.2)';

const ROW_SX = {
  display: 'flex',
  gap: 1.5,
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const CARD_SX = { flex: `0 0 ${CARD_WIDTH}`, minWidth: 0, scrollSnapAlign: 'start' };

function getAreaLabel(business) {
  const distance = business.distance ?? business.distanceKm ?? null;
  if (distance != null) return `${Number(distance).toFixed(1)} km away`;
  const parts = String(business.location?.address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return '';
  return parts.length >= 3 ? parts[parts.length - 3] : parts[0];
}

function CompactStylistCard({ business, onSelectStylist }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = normalizeImageUrl(business.image);
  const showImage = Boolean(image) && !imageFailed;
  const avgRating = Number(business.rating?.avgRating || 0);
  const bookingsCount = business.bookingsCount ?? 0;
  const minPrice = business.priceRange?.min;
  const areaLabel = getAreaLabel(business);
  const initial = (business.businessName || '?').trim().charAt(0).toUpperCase() || '?';

  const handleSelect = () => onSelectStylist?.({ id: business._id, slug: business.nameSlug });

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      sx={{ ...CARD_SX, cursor: 'pointer' }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '1 / 1',
          borderRadius: 2.5,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(145deg, ${brand.green[100]} 0%, ${brand.green[50]} 100%)`,
          color: brand.green[600],
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {showImage ? (
          <Box
            component="img"
            src={image}
            alt={business.businessName}
            loading="lazy"
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover' }}
          />
        ) : (
          initial
        )}

        {business.isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              px: 1,
              py: 0.4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'text.primary',
              bgcolor: alpha('#fff', 0.94),
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            Available
          </Box>
        )}
      </Box>

      <Typography noWrap sx={{ mt: 1, fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
        {business.businessName}
      </Typography>

      {areaLabel && (
        <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
          {areaLabel}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Iconify icon="eva:star-fill" width={13} sx={{ color: brand.green[400], flexShrink: 0 }} />
        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
        </Box>
        {bookingsCount > 0 && (
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            · {bookingsCount} {bookingsCount === 1 ? 'booking' : 'bookings'}
          </Box>
        )}
      </Box>

      {minPrice > 0 && (
        <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
          From{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {fCurrency(minPrice)}
          </Box>
        </Typography>
      )}
    </Box>
  );
}

function SeeAllCard({ height, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        p: 0,
        flex: '0 0 84px',
        height: height || 'auto',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontFamily: 'inherit',
        bgcolor: 'transparent',
        scrollSnapAlign: 'end',
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          bgcolor: brand.green[400],
          boxShadow: `0 6px 14px ${alpha(brand.green[400], 0.35)}`,
        }}
      >
        <Iconify icon="eva:arrow-forward-fill" width={22} />
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: brand.green[600] }}>See all</Typography>
    </Box>
  );
}

function ArrowButton({ direction, disabled, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
      disabled={disabled}
      onClick={onClick}
      sx={{
        p: 0,
        width: 30,
        height: 30,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        cursor: disabled ? 'default' : 'pointer',
        color: 'text.primary',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        opacity: disabled ? 0.35 : 1,
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
        boxShadow: disabled ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <Iconify icon={direction === 'prev' ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'} width={16} />
    </Box>
  );
}

function CategoryRow({ title, categoryId, businesses, onSelectStylist, onSeeAll }) {
  const rowRef = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const [cardSize, setCardSize] = useState(0);

  const updateEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setEdges({ atStart: row.scrollLeft <= 4, atEnd: row.scrollLeft + row.clientWidth >= row.scrollWidth - 4 });
    setCardSize(row.firstElementChild?.firstElementChild?.offsetHeight || 0);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges, businesses]);

  const scrollByPage = (direction) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.9, behavior: 'smooth' });
  };

  const handleSeeAll = categoryId ? () => onSeeAll?.(categoryId) : undefined;

  return (
    <Box>
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography noWrap sx={{ minWidth: 0, fontSize: 18, fontWeight: 700 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {handleSeeAll && (
            <Box
              component="button"
              type="button"
              onClick={handleSeeAll}
              sx={{
                mr: 0.5,
                p: 0,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                bgcolor: 'transparent',
                color: brand.green[600],
              }}
            >
              See all
            </Box>
          )}
          <ArrowButton direction="prev" disabled={edges.atStart} onClick={() => scrollByPage(-1)} />
          <ArrowButton direction="next" disabled={edges.atEnd} onClick={() => scrollByPage(1)} />
        </Box>
      </Box>

      <Box ref={rowRef} onScroll={updateEdges} sx={ROW_SX}>
        {businesses.slice(0, ROW_LIMIT).map((business) => (
          <CompactStylistCard key={business._id} business={business} onSelectStylist={onSelectStylist} />
        ))}
        {handleSeeAll && <SeeAllCard height={cardSize} onClick={handleSeeAll} />}
      </Box>
    </Box>
  );
}

function RowSkeleton() {
  return (
    <Box sx={{ ...ROW_SX, overflowX: 'hidden' }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box key={index} sx={CARD_SX}>
          <Skeleton variant="rounded" sx={{ width: 1, height: 'auto', aspectRatio: '1 / 1', borderRadius: 2.5 }} />
          <Skeleton variant="text" sx={{ mt: 1, width: '80%' }} />
          <Skeleton variant="text" sx={{ width: '55%' }} />
          <Skeleton variant="text" sx={{ width: '45%' }} />
        </Box>
      ))}
    </Box>
  );
}

function groupByCategory(businesses, categories) {
  const known = new Map(categories.map((category) => [String(category._id), { title: category.name, categoryId: category._id, businesses: [] }]));
  const other = [];

  businesses.forEach((business) => {
    let placed = false;
    (business.categories || []).forEach((category) => {
      const group = known.get(String(category?._id ?? category));
      if (group) {
        group.businesses.push(business);
        placed = true;
      }
    });
    if (!placed) other.push(business);
  });

  const groups = [...known.values()].filter((group) => group.businesses.length > 0);
  if (other.length > 0) groups.push({ title: 'More providers', categoryId: null, businesses: other });
  return groups;
}

export default function MobileCategoryRows({ categories = [], baseArgs, onSelectStylist, onSeeAll }) {
  const { data, isLoading, isFetching } = useGetPublicBusinessesQuery({ ...baseArgs, page: 1, limit: FETCH_LIMIT });

  const groups = useMemo(() => groupByCategory(data?.businesses || [], categories), [data, categories]);

  if (isLoading || isFetching) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" sx={{ mb: 1.5, width: 150, fontSize: 18 }} />
            <RowSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
        No providers match your current filters.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {groups.map((group) => (
        <CategoryRow
          key={group.categoryId || 'other'}
          title={group.title}
          categoryId={group.categoryId}
          businesses={group.businesses}
          onSelectStylist={onSelectStylist}
          onSeeAll={onSeeAll}
        />
      ))}
    </Box>
  );
}
