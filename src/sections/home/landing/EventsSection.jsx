import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography } from '@mui/material';
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
import EventPreviewCard from './EventPreviewCard';

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

function EventCard({ event }) {
  const navigate = useNavigate();
  return <EventPreviewCard event={event} onSelect={() => navigate(paths.event.details(event.id))} />;
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
    <Box id="events" sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, py: { xs: 5, md: 8 }, scrollMarginTop: '92px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 3, md: 4 }, flexWrap: 'wrap', gap: 1.5 }}>

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
