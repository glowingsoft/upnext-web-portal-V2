import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Chip, Grid, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { useDebouncedInput } from 'src/hooks/use-debounced-input';
import { useLiveLocation } from 'src/hooks/use-live-location';
import { loadGoogleMapsPlaces } from 'src/lib/google-maps-loader';
import { useGetEventsQuery } from 'src/store/Reducer/ticketmaster-api';
import { DEFAULT_EVENT_SEARCH_PARAMS } from 'src/sections/active-sections/events-view/events-data';
import { AddressFilterField } from 'src/sections/active-sections/services-view/components/address-filter-field';
import { isRealCoords } from 'src/utils/my-location-storage';
import { formatCityStateCountry, reverseGeocodeCityStateCountry } from 'src/utils/reverse-geocode';

import FilterPill from './FilterPill';
import SearchBox from './SearchBox';
import CardSkeleton from './CardSkeleton';
import SurfaceCard from './SurfaceCard';
import { brand } from './theme';

const EVENTS_PAGE_SIZE = 12;

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Music', label: 'Music' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts & Theatre', label: 'Arts & Theatre' },
  { value: 'Film', label: 'Film' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
];
const DEFAULT_CATEGORY = '';

const SEGMENT_COLORS = {
  Music: { bg: alpha('#8B5CF6', 0.1), color: '#7C3AED', border: alpha('#8B5CF6', 0.25) },
  Sports: { bg: alpha('#F59E0B', 0.1), color: '#D97706', border: alpha('#F59E0B', 0.25) },
  Arts: { bg: alpha('#EC4899', 0.1), color: '#DB2777', border: alpha('#EC4899', 0.25) },
  default: { bg: alpha(brand.green[400], 0.1), color: brand.green[600], border: alpha(brand.green[400], 0.25) },
};

function formatDate(dateStr, timeStr) {
  if (!dateStr) return '';
  const date = new Date(timeStr ? `${dateStr}T${timeStr}` : dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!timeStr) return datePart;
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

function EventCard({ event }) {
  const navigate = useNavigate();
  const segment = event.categories?.segment;
  const genre = event.categories?.genre;
  const colors = SEGMENT_COLORS[segment] || SEGMENT_COLORS.default;
  const location = [event.venue?.city, event.venue?.stateCode || event.venue?.state].filter(Boolean).join(', ');

  const handleSelect = () => navigate(paths.event.details(event.id));

  return (
    <SurfaceCard
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
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
          boxShadow: `0 10px 26px ${alpha(brand.green[400], 0.14)}`,
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          height: 190,
          position: 'relative',
          backgroundImage: event.image ? `url(${event.image})` : undefined,
          bgcolor: event.image ? undefined : alpha(brand.green[400], 0.12),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Dark gradient for readability */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
          }}
        />
        {/* Segment chip */}
        {segment && (
          <Chip
            label={segment}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              height: 24,
              bgcolor: alpha('#0B1220', 0.72),
              color: '#F8FAFC',
              border: `1px solid ${alpha(colors.color, 0.58)}`,
              backdropFilter: 'blur(8px) saturate(130%)',
              WebkitBackdropFilter: 'blur(8px) saturate(130%)',
              boxShadow: `0 6px 16px ${alpha('#020617', 0.32)}`,
              fontWeight: 800,
              fontSize: '0.68rem',
              letterSpacing: 0.2,
              '& .MuiChip-label': {
                px: 1,
                textShadow: '0 1px 2px rgba(2,6,23,0.65)',
              },
            }}
          />
        )}
        {/* Genre bottom-left */}
        {genre && (
          <Typography
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 10,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {genre}
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 0.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.35,
          }}
        >
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <Iconify icon="mingcute:calendar-line" width={13} sx={{ color: brand.green[600], flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {formatDate(event.date?.localDate, event.date?.localTime)}
          </Typography>
        </Box>

        {event.venue?.name && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0 }}>
            <Iconify icon="mingcute:location-line" width={13} sx={{ color: brand.green[600], flexShrink: 0 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.75rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {event.venue.name}{location ? `, ${location}` : ''}
            </Typography>
          </Box>
        )}

        {event.distance != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Iconify icon="mingcute:route-line" width={13} sx={{ color: brand.green[600], flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {`${Number(event.distance).toFixed(1)} ${event.units || 'miles'} away`}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {event.ticketUrl && (
          <Box
            component="a"
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{
              mt: 1.75,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: brand.green[600],
              textDecoration: 'none',
              '&:hover': { color: brand.green[800] },
            }}
          >
            Get Tickets
            <Iconify icon="mingcute:arrow-right-line" width={14} />
          </Box>
        )}
      </Box>
    </SurfaceCard>
  );
}

export default function EventsSection() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [queryLocation, setQueryLocation] = useState(null);
  const { displayValue: search, debouncedValue: keyword, handleChange: handleSearchChange, reset: resetSearch } = useDebouncedInput('', undefined, 500);
  const { isLocating: isDetectingLocation, requestLocation } = useLiveLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { lat, lng } = await requestLocation({ enableHighAccuracy: false, timeout: 5000, maximumAge: 5 * 60 * 1000 });
        const maps = await loadGoogleMapsPlaces();
        const address = await reverseGeocodeCityStateCountry(maps, { lat, lng });
        if (cancelled) return;
        setQueryLocation((prev) => prev ?? { address, lat, lng });
      } catch {
        // Permission denied, unavailable, or Places failed to load — leave the field empty.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isFetching } = useGetEventsQuery({
    page: 0,
    size: EVENTS_PAGE_SIZE,
    keyword: keyword.trim() || undefined,
    classificationName: category || undefined,
    ...(isRealCoords(queryLocation?.lat, queryLocation?.lng) ? { latlong: `${queryLocation.lat},${queryLocation.lng}` } : {}),
    unit: DEFAULT_EVENT_SEARCH_PARAMS.unit,
  });

  const events = data?.events || [];
  const showSkeleton = isLoading || isFetching;
  const canReset = category !== DEFAULT_CATEGORY || Boolean(keyword) || Boolean(queryLocation?.address);

  const resetFilters = () => {
    setCategory(DEFAULT_CATEGORY);
    setQueryLocation(null);
    resetSearch();
  };

  return (
    <Box id="events" sx={{ mt: 4, mb: 3, px: { xs: 2, md: 3 }, scrollMarginTop: '92px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: brand.green[600] }}>
          Events
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterPill
            icon="mingcute:sword-line"
            value={category}
            defaultValue={DEFAULT_CATEGORY}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
          />

          <AddressFilterField
            hideLabel
            value={queryLocation?.address}
            onPlaceSelected={setQueryLocation}
            loading={isDetectingLocation}
            reverseGeocodeFormatter={reverseGeocodeCityStateCountry}
            placeTypes={['(regions)']}
            formatAddress={formatCityStateCountry}
            sx={{
              width: 260,
              flexShrink: 0,
              flexGrow: 0,
              '& .MuiOutlinedInput-root': {
                height: 40,
                borderRadius: 50,
                bgcolor: queryLocation?.address ? alpha(brand.green[400], 0.08) : '#fff',
                fontSize: '0.825rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: queryLocation?.address ? brand.green[400] : 'rgba(145,158,171,0.24)',
                borderWidth: '1.5px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand.green[400] },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brand.green[400] },
            }}
          />

          <SearchBox
            icon="mingcute:search-line"
            placeholder="Search events…"
            value={search}
            onChange={handleSearchChange}
            onClear={resetSearch}
          />

          {canReset && (
            <Box
              component="button"
              type="button"
              onClick={resetFilters}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
                border: `1px solid ${alpha(brand.green[400], 0.35)}`,
                borderRadius: 99,
                background: 'transparent',
                color: brand.green[600],
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'inherit',
                px: 1.5,
                py: 0.5,
                '&:hover': { bgcolor: alpha(brand.green[400], 0.06) },
              }}
            >
              <Iconify icon="mingcute:close-line" width={13} />
              Clear filters
            </Box>
          )}
        </Box>
      </Box>

      {showSkeleton ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : events.length > 0 ? (
        <Grid container spacing={2}>
          {events.map((event) => (
            <Grid key={event.id} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <SurfaceCard
          sx={{
            py: 7,
            px: 3,
            textAlign: 'center',
            background: `linear-gradient(145deg, #F3EADC 0%, #FDFBF7 100%)`,
            border: `1px dashed ${alpha(brand.green[400], 0.35)}`,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: alpha(brand.green[400], 0.1),
              border: `1.5px solid ${alpha(brand.green[400], 0.25)}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Iconify icon="mingcute:calendar-2-line" width={28} sx={{ color: brand.green[600] }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {category || keyword ? 'No events found' : 'No upcoming events'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.8 }}>
            {category || keyword
              ? 'Try a different search or category.'
              : 'Check back soon for events happening near you.'}
          </Typography>
        </SurfaceCard>
      )}
    </Box>
  );
}
