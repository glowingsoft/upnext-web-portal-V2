import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Pagination, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';
import { useLiveLocation } from 'src/hooks/use-live-location';
import { loadGoogleMapsPlaces } from 'src/lib/google-maps-loader';
import { useGetPublicCategoriesQuery } from 'src/store/Reducer/categories-api';
import { useGetPublicBusinessesQuery } from 'src/store/Reducer/businesses-api';
import { AddressFilterField } from 'src/sections/active-sections/services-view/components/address-filter-field';
import { getItemId, normalizePackage, normalizeService } from 'src/sections/active-sections/services-view/customer-services-view';
import { PortfolioViewDialog } from 'src/sections/active-sections/provider-detail-view/components/portfolio/portfolio-view-dialog';
import { isRealCoords } from 'src/utils/my-location-storage';
import { reverseGeocode } from 'src/utils/reverse-geocode';

import AiSearchBar from './AiSearchBar';
import SectionHeader from './SectionHeader';
import CardSkeleton from './CardSkeleton';
import FilterPill from './FilterPill';
import ListingPreviewCard from './ListingPreviewCard';
import PortfolioPreviewCard from './PortfolioPreviewCard';
import StylistPreviewCard from './StylistPreviewCard';
import SurfaceCard from './SurfaceCard';
import { brand } from './theme';
import { useOpenListing } from './use-open-listing';

const PAGE_LIMIT = 12;

// Result types the AI search can return, in display order. `key` matches the response field.
const RESULT_TABS = [
  { key: 'businesses', label: 'Stylists', icon: 'mingcute:user-star-line' },
  { key: 'services', label: 'Services', icon: 'solar:bill-list-bold-duotone' },
  { key: 'packages', label: 'Packages', icon: 'solar:box-minimalistic-bold' },
  { key: 'portfolios', label: 'Portfolios', icon: 'solar:gallery-wide-bold-duotone' },
];

// Per-type totals across all pages. Falls back to the business-level total, then to nothing
// (callers use the current page's item count instead).
function getTypeTotal(meta, key) {
  const total = meta?.counts?.[key] ?? meta?.totals?.[key] ?? meta?.[key]?.total ?? meta?.[`${key}Total`];
  if (total != null) return total;
  if (key === 'businesses') return meta?.totalRecords ?? meta?.total;
  return undefined;
}

const SORT_OPTIONS = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'rating_high_low', label: 'Rating: High to Low' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
];

const DEFAULT_CATEGORY = { value: 'all', label: 'All Categories' };
const DEFAULT_SORT = SORT_OPTIONS[0].value;

const BUSINESS_TYPE_LABELS = { all: 'All Types', solo: 'Solo', team: 'Team' };
const DEFAULT_BUSINESS_TYPE = 'all';

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Not Available' },
];
const DEFAULT_AVAILABILITY = 'all';

const MIN_EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any Experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
];
const DEFAULT_MIN_EXPERIENCE = '';

const FILTER_ICONS = {
  category: 'mingcute:scissors-line',
  businessType: 'mingcute:building-2-line',
  experience: 'mingcute:medal-line',
  date: 'mingcute:calendar-line',
  sort: 'mingcute:sort-descending-line',
  availability: 'mingcute:time-line',
};


export default function AvailabilitySection({ onSelectStylist }) {
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY.value);
  const [businessType, setBusinessType] = useState(DEFAULT_BUSINESS_TYPE);
  const [minExperience, setMinExperience] = useState(DEFAULT_MIN_EXPERIENCE);
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [date, setDate] = useState(null);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

  // AI search is costly, so the query only runs when the user submits — not on every keystroke.
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState(RESULT_TABS[0].key);
  const handleSearchChange = useCallback((event) => setSearch(event.target.value), []);
  const submitSearch = useCallback((value) => {
    setKeyword(value.trim());
    setActiveTab(RESULT_TABS[0].key);
  }, []);
  const resetSearch = useCallback(() => {
    setSearch('');
    setKeyword('');
  }, []);
  const [queryLocation, setQueryLocation] = useState(null);
  const { isLocating: isDetectingLocation, requestLocation } = useLiveLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { lat, lng } = await requestLocation({ enableHighAccuracy: false, timeout: 5000, maximumAge: 5 * 60 * 1000 });
        const maps = await loadGoogleMapsPlaces();
        const address = await reverseGeocode(maps, { lat, lng });
        if (cancelled) return;
        setQueryLocation((prev) => prev ?? { address, lat, lng });
      } catch {
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryChange = useCallback((value) => setCategoryId(value), []);
  const handleBusinessTypeChange = useCallback((value) => setBusinessType(value), []);
  const handleMinExperienceChange = useCallback((value) => setMinExperience(value), []);
  const handleAvailabilityChange = useCallback((value) => setAvailability(value), []);
  const handleSortByChange = useCallback((value) => setSortBy(value), []);

  const { data: categoriesData } = useGetPublicCategoriesQuery({ limit: 100 });

  const categoryOptions = useMemo(
    () => [DEFAULT_CATEGORY, ...((categoriesData?.data || []).map((cat) => ({ value: cat._id, label: cat.name })))],
    [categoriesData]
  );

  const filterArgs = useMemo(
    () => ({
      limit: PAGE_LIMIT,
      keyword: keyword || undefined,
      ...(isRealCoords(queryLocation?.lat, queryLocation?.lng) ? { lat: queryLocation.lat, lng: queryLocation.lng } : {}),
      businessType: businessType !== DEFAULT_BUSINESS_TYPE ? businessType : undefined,
      categoryId: categoryId !== DEFAULT_CATEGORY.value ? categoryId : undefined,
      minExperience: minExperience || undefined,
      isAvailable: availability === 'all' ? undefined : availability === 'available',
      date: date?.isValid?.() ? date.format('YYYY-MM-DD') : undefined,
      sortBy,
    }),
    [keyword, queryLocation, categoryId, businessType, minExperience, availability, date, sortBy]
  );
  const filterKey = JSON.stringify(filterArgs);
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const page = pageState.filterKey === filterKey ? pageState.page : 1;

  const { data, isFetching, isLoading } = useGetPublicBusinessesQuery({ ...filterArgs, page });

  const businessTypeOptions = useMemo(() => {
    const list = data?.meta?.businessTypeList || ['all', 'solo', 'team'];
    return list.map((value) => ({ value, label: BUSINESS_TYPE_LABELS[value] || value }));
  }, [data]);

  const openListing = useOpenListing();
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const resultsRef = useRef(null);

  const results = useMemo(
    () =>
      RESULT_TABS.map((tab) => {
        const pageItems = data?.[tab.key] || [];
        return { ...tab, items: pageItems, total: getTypeTotal(data?.meta, tab.key) ?? pageItems.length };
      }),
    [data]
  );

  // Only offer tabs for result types that actually came back; stylists are always the fallback.
  const visibleTabs = results.filter((tab) => tab.total > 0);
  const currentTab = visibleTabs.find((tab) => tab.key === activeTab) || visibleTabs[0] || results[0];
  const showTabs = visibleTabs.length > 1;
  const totalRecords = results.reduce((sum, tab) => sum + tab.total, 0);

  const totalPages = useMemo(() => {
    const meta = data?.meta;
    const explicit = meta?.totalPages ?? meta?.pages ?? meta?.pageCount;
    if (explicit != null) return Math.max(1, explicit);

    const knownTotals = RESULT_TABS.map((tab) => getTypeTotal(meta, tab.key)).filter((total) => total != null);
    if (knownTotals.length > 0) return Math.max(1, ...knownTotals.map((total) => Math.ceil(total / PAGE_LIMIT)));

    // No totals from the API: offer a next page whenever this one came back full.
    const isFullPage = RESULT_TABS.some((tab) => (data?.[tab.key]?.length || 0) >= PAGE_LIMIT);
    return page + (isFullPage ? 1 : 0);
  }, [data, page]);

  const handlePageChange = (_, nextPage) => {
    setPageState({ filterKey, page: nextPage });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const appliedFilterCount = useMemo(() => {
    let count = 0;

    if (keyword) count += 1;
    if (queryLocation?.address) count += 1;
    if (categoryId !== DEFAULT_CATEGORY.value) count += 1;
    if (businessType !== DEFAULT_BUSINESS_TYPE) count += 1;
    if (minExperience !== DEFAULT_MIN_EXPERIENCE) count += 1;
    if (availability !== DEFAULT_AVAILABILITY) count += 1;
    if (date?.isValid()) count += 1;
    if (sortBy !== DEFAULT_SORT) count += 1;

    return count;
  }, [keyword, queryLocation, categoryId, businessType, minExperience, availability, date, sortBy]);

  const resetFilters = () => {
    resetSearch();
    setQueryLocation(null);
    setCategoryId(DEFAULT_CATEGORY.value);
    setBusinessType(DEFAULT_BUSINESS_TYPE);
    setMinExperience(DEFAULT_MIN_EXPERIENCE);
    setAvailability(DEFAULT_AVAILABILITY);
    setDate(null);
    setSortBy(DEFAULT_SORT);
  };

  const datePickerSlots = useMemo(
    () => ({
      openPickerIcon: () => (
        <Iconify icon={FILTER_ICONS.date} width={15} sx={{ color: date?.isValid() ? brand.green[600] : 'text.secondary' }} />
      ),
    }),
    [date]
  );

  const datePickerSlotProps = useMemo(() => ({
    textField: {
      size: 'small',
      placeholder: 'Any Date',
      sx: {
        flexShrink: 0,
        '& .MuiOutlinedInput-root': {
          borderRadius: 50,
          height: 40,
          bgcolor: date?.isValid() ? alpha(brand.green[400], 0.08) : '#fff',
          transition: 'background-color 0.18s ease',
          '& fieldset': {
            borderColor: date?.isValid() ? brand.green[400] : 'rgba(145,158,171,0.24)',
            borderWidth: '1.5px',
          },
          '&:hover fieldset': { borderColor: brand.green[400] },
          '& .MuiInputBase-input': {
            fontSize: '0.825rem',
            py: 0,
            px: 1.5,
            color: date?.isValid() ? brand.green[700] : 'text.primary',
            fontWeight: date?.isValid() ? 700 : 400,
            width: 90,
          },
          '& .MuiInputAdornment-root': { mr: 0.5 },
        },
      },
    },
    actionBar: { actions: ['clear', 'today'] },
    desktopPaper: {
      sx: {
        fontSize: '0.8rem',
        '& .MuiPickersCalendarHeader-root': { fontSize: '0.85rem' },
        '& .MuiDayCalendar-weekDayLabel': { fontSize: '0.75rem', width: 32, height: 32 },
        '& .MuiPickersDay-root': { fontSize: '0.78rem', width: 32, height: 32 },
        '& .MuiPickersCalendarHeader-label': { fontSize: '0.875rem', fontWeight: 700 },
        '& .MuiPickersLayout-actionBar': {
          pt: 0,
          '& .MuiButton-contained': {
            bgcolor: brand.green[400],
            borderRadius: 99,
            px: 2,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: brand.green[600] },
          },
          '& .MuiButton-text': {
            color: brand.green[600],
            fontSize: '0.8rem',
          },
        },
      },
    },
    popper: { disablePortal: false },
  }), [date]);

  const isReplacing = isLoading || isFetching;

  return (
    <Box id="available-now" sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, py: { xs: 7, md: 11 }, scrollMarginTop: '72px' }}>
      <SectionHeader
        eyebrow="Book Today"
        title="Available Now"
        subtitle="Discover talented stylists near you who are ready to take your booking."
      />

      <Box
        sx={{
          position: 'relative',
          maxWidth: 960,
          mx: 'auto',
          borderRadius: 5,
          p: { xs: 2, sm: 3 },
          mb: { xs: 4, md: 6 },
          background: `linear-gradient(135deg, ${alpha(brand.green[100], 0.7)} 0%, ${alpha(brand.green[50], 0.95)} 100%)`,
          border: `1px solid ${alpha(brand.green[400], 0.16)}`,
          boxShadow: `0 24px 48px -32px ${alpha(brand.green[800], 0.35)}`,
        }}
      >
        <AiSearchBar
          value={search}
          onChange={handleSearchChange}
          onClear={resetSearch}
          onSubmit={() => submitSearch(search)}
          isDirty={search.trim() !== keyword}
          placeholder='Try: "balayage specialist open this weekend"'
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, minHeight: 32 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{ ml: 0.5, color: 'text.disabled', letterSpacing: '0.2em', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}
          >
            Refine Results
          </Typography>
          <Box
            sx={{
              px: 1.25,
              py: 0.25,
              borderRadius: 99,
              bgcolor: alpha(brand.green[400], 0.12),
              border: `1px solid ${alpha(brand.green[400], 0.3)}`,
              opacity: appliedFilterCount > 0 ? 1 : 0,
              transition: 'opacity 0.18s ease',
              pointerEvents: appliedFilterCount > 0 ? 'auto' : 'none',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: brand.green[600], fontSize: '0.72rem' }}>
              {appliedFilterCount} active
            </Typography>
          </Box>
        </Box>

        <Box
          component="button"
          type="button"
          onClick={resetFilters}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            border: `1px solid ${alpha(brand.green[400], 0.35)}`,
            borderRadius: 99,
            background: 'transparent',
            color: brand.green[600],
            cursor: appliedFilterCount > 0 ? 'pointer' : 'default',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            px: 1.5,
            py: 0.5,
            opacity: appliedFilterCount > 0 ? 1 : 0,
            transition: 'opacity 0.18s ease',
            pointerEvents: appliedFilterCount > 0 ? 'auto' : 'none',
            '&:hover': { bgcolor: alpha(brand.green[400], 0.06) },
          }}
        >
          <Iconify icon="mingcute:close-line" width={13} />
          Clear filters
        </Box>
      </Box>

      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: { xs: 3.5, md: 5 },
          p: 1.25,
          borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          overflowX: 'auto',
          flexWrap: 'nowrap',
        }}
      >
        <FilterPill
          icon={FILTER_ICONS.category}
          value={categoryId}
          defaultValue={DEFAULT_CATEGORY.value}
          onChange={handleCategoryChange}
          options={categoryOptions}
        />

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        <AddressFilterField
          hideLabel
          value={queryLocation?.address}
          onPlaceSelected={setQueryLocation}
          loading={isDetectingLocation}
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

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        <FilterPill
          icon={FILTER_ICONS.businessType}
          value={businessType}
          defaultValue={DEFAULT_BUSINESS_TYPE}
          onChange={handleBusinessTypeChange}
          options={businessTypeOptions}
        />

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        <FilterPill
          icon={FILTER_ICONS.experience}
          value={minExperience}
          defaultValue={DEFAULT_MIN_EXPERIENCE}
          onChange={handleMinExperienceChange}
          options={MIN_EXPERIENCE_OPTIONS}
        />

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        <FilterPill
          icon={FILTER_ICONS.availability}
          value={availability}
          defaultValue={DEFAULT_AVAILABILITY}
          onChange={handleAvailabilityChange}
          options={AVAILABILITY_OPTIONS}
        />

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        {/* Date pill — MUI DatePicker, sent to the API as `date` (YYYY-MM-DD). */}
        <DatePicker
          value={date}
          onChange={(newVal) => setDate(newVal)}
          disablePast
          slots={datePickerSlots}
          slotProps={datePickerSlotProps}
        />

        <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', flexShrink: 0 }} />

        <FilterPill
          icon={FILTER_ICONS.sort}
          value={sortBy}
          defaultValue={DEFAULT_SORT}
          onChange={handleSortByChange}
          options={SORT_OPTIONS}
        />
      </Box>

      <Box ref={resultsRef} sx={{ scrollMarginTop: '92px' }} />

      {appliedFilterCount > 0 && !isReplacing && (
        <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
          <Box component="strong" sx={{ color: 'text.primary' }}>
            {totalRecords}
          </Box>{' '}
          {totalRecords === 1 ? 'result found' : 'results found'}
        </Typography>
      )}

      {showTabs && !isReplacing && (
        <Tabs
          value={currentTab.key}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            mb: 2,
            minHeight: 40,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 40,
              borderRadius: 99,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              px: 2,
              mr: 1,
              border: '1px solid',
              borderColor: 'divider',
            },
            '& .Mui-selected': {
              color: `${brand.green[600]} !important`,
              bgcolor: alpha(brand.green[400], 0.1),
              borderColor: brand.green[400],
            },
          }}
        >
          {visibleTabs.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              icon={<Iconify icon={tab.icon} width={16} />}
              iconPosition="start"
              label={`${tab.label} (${tab.total})`}
            />
          ))}
        </Tabs>
      )}

      {isReplacing ? (
        <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
            {currentTab.items.length > 0 ? (
              currentTab.items.map((item) => (
                <Grid key={getItemId(item)} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                  {currentTab.key === 'businesses' && (
                    <StylistPreviewCard business={item} onSelectStylist={onSelectStylist} />
                  )}
                  {currentTab.key === 'services' && (
                    <ListingPreviewCard
                      kind="service"
                      item={normalizeService(item)}
                      onView={() => openListing(normalizeService(item), 'services')}
                    />
                  )}
                  {currentTab.key === 'packages' && (
                    <ListingPreviewCard
                      kind="package"
                      item={normalizePackage(item)}
                      onView={() => openListing(normalizePackage(item), 'packages')}
                    />
                  )}
                  {currentTab.key === 'portfolios' && <PortfolioPreviewCard item={item} onView={setViewPortfolio} />}
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
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
                    <Iconify icon="mingcute:search-line" width={28} sx={{ color: brand.green[600] }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {keyword ? 'No results found' : 'No stylists found'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.8, mb: 3 }}>
                    {keyword
                      ? 'Nothing matched your search. Try describing it differently or loosening the filters.'
                      : 'No stylists match your current filters. Try a different search or category.'}
                  </Typography>

                  <Box
                    component="button"
                    type="button"
                    onClick={resetFilters}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 3,
                      py: 1,
                      borderRadius: 99,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: brand.green[400],
                      color: '#fff',
                      '&:hover': { bgcolor: brand.green[600] },
                    }}
                  >
                    <Iconify icon="mingcute:refresh-line" width={16} />
                    Clear all filters
                  </Box>
                </SurfaceCard>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={handlePageChange}
            disabled={isReplacing}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { fontWeight: 700 },
              '& .MuiPaginationItem-root.Mui-selected': {
                color: '#fff',
                bgcolor: brand.green[400],
                '&:hover': { bgcolor: brand.green[600] },
              },
            }}
          />
        </Box>
      )}

      <PortfolioViewDialog item={viewPortfolio} canManage={false} onClose={() => setViewPortfolio(null)} />
    </Box>
  );
}
