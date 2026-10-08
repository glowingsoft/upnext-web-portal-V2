import { useCallback, useEffect, useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { useTranslate } from 'src/locales/use-locales';
import { useDebounce } from 'src/hooks/use-debounce';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';
import { useGetEventsQuery } from 'src/store/Reducer/ticketmaster-api';
import { AddressFilterField } from 'src/sections/active-sections/services-view/components/address-filter-field';
import { isRealCoords } from 'src/utils/my-location-storage';

import EventPreviewCard from 'src/sections/home/landing/EventPreviewCard';

import { DEFAULT_EVENT_SEARCH_PARAMS, formatEventClassifications, formatEventDate, formatEventPrice, formatEventVenue, INITIAL_EVENTS } from './events-data';

// ----------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Music', label: 'Music' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts & Theatre', label: 'Arts & Theatre' },
  { value: 'Film', label: 'Film' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
];

const DEFAULT_RADIUS = '';

const RADIUS_OPTIONS = [
  { value: '', label: 'Any Radius' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

const UNIT_OPTIONS = [
  { value: 'miles', label: 'Miles' },
  { value: 'km', label: 'Km' },
];

function getClassificationChips(event) {
  const categories = event?.categories || {};

  return [categories.segment, categories.genre, categories.subGenre].filter((item) => item && item !== 'Undefined');
}

function ClassificationChips({ event }) {
  const chips = getClassificationChips(event);
  const visibleChips = chips.slice(0, 2);
  const moreCount = chips.length - visibleChips.length;

  if (!visibleChips.length) return '-';

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
      {visibleChips.map((chip) => (
        <Chip
          key={chip}
          size="small"
          label={chip}
          sx={{
            height: 24,
            borderRadius: 1,
            bgcolor: '#FFF0CC',
            color: '#6B3F00',
            fontWeight: 700,
            '& .MuiChip-label': { px: 1 },
            '&:hover': { bgcolor: '#FFF0CC' },
          }}
        />
      ))}
      {moreCount > 0 && (
        <Tooltip title={chips.slice(2).join(', ')}>
          <Chip
            size="small"
            label={`+${moreCount} More`}
            sx={{
              height: 24,
              borderRadius: 1,
              bgcolor: '#FFF0CC',
              color: '#6B3F00',
              fontWeight: 700,
              cursor: 'default',
              '& .MuiChip-label': { px: 1 },
              '&:hover': { bgcolor: '#FFF0CC' },
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}

function EventCard({ event, onClick }) {
  return <EventPreviewCard event={event} onSelect={onClick} />;
}

// ----------------------------------------------------------------------

export function EventsView() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslate();
  const isAdminDashboard = pathname.includes('/admin-dashboard');

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr'), width: 70 },
      { id: 'event', label: t('event'), width: 320 },
      { id: 'date', label: t('date'), width: 150 },
      { id: 'venue', label: t('venue'), minWidth: 220 },
      { id: 'classifications', label: t('classifications'), minWidth: 220 },
      { id: 'price', label: t('price'), width: 180 },
      { id: 'actions', label: '', width: 100, align: 'center' },
    ],
    [t]
  );

  const FILTER_FIELDS = useMemo(() => [createFilterField.search({ placeholder: t('searchEventsPlaceholder') })], [t]);

  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [queryLocation, setQueryLocation] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [unit, setUnit] = useState(DEFAULT_EVENT_SEARCH_PARAMS.unit);
  const [page, setPage] = useState(0);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);
  const [customerPageSize, setCustomerPageSize] = useState(20);
  const [dense, setDense] = useState(false);

  const rowsPerPage = isAdminDashboard ? adminRowsPerPage : customerPageSize;

  const debouncedSearch = useDebounce(searchValue, 400);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (debouncedSearch.trim()) filters.push({ key: 'search', label: 'Search', value: debouncedSearch.trim() });
    if (category) filters.push({ key: 'category', label: 'Category', value: category });
    if (dateFrom) filters.push({ key: 'dateFrom', label: 'From', value: dateFrom });
    if (dateTo) filters.push({ key: 'dateTo', label: 'To', value: dateTo });
    if (queryLocation?.address) filters.push({ key: 'location', label: 'Location', value: queryLocation.address });
    if (radius !== DEFAULT_RADIUS) {
      filters.push({ key: 'radius', label: 'Radius', value: `${radius} ${unit}` });
    }
    return filters;
  }, [debouncedSearch, category, dateFrom, dateTo, queryLocation, radius, unit]);

  const {
    data: ticketmasterData,
    isLoading: customerEventsLoading,
    isFetching: customerEventsFetching,
  } = useGetEventsQuery(
    {
      page,
      size: rowsPerPage,
      keyword: debouncedSearch.trim() || undefined,
      classificationName: category || undefined,
      startDateTime: dateFrom ? `${dateFrom}T00:00:00Z` : undefined,
      endDateTime: dateTo ? `${dateTo}T23:59:59Z` : undefined,
      ...(isRealCoords(queryLocation?.lat, queryLocation?.lng) ? { latlong: `${queryLocation.lat},${queryLocation.lng}` } : {}),
      radius,
      unit,
    },
    { skip: isAdminDashboard }
  );

  const customerEvents = ticketmasterData?.events || [];
  const customerTotal = ticketmasterData?.page?.totalElements || 0;

  const filteredAdminEvents = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return INITIAL_EVENTS;

    return INITIAL_EVENTS.filter((event) => {
      const searchableText = [event.title, event.description, formatEventDate(event), formatEventVenue(event), formatEventClassifications(event), formatEventPrice(event)];

      return searchableText.filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [searchValue]);

  const paginatedEvents = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredAdminEvents.slice(start, end);
  }, [filteredAdminEvents, page, rowsPerPage]);

  useEffect(() => {
    if (!isAdminDashboard) return;

    const maxPage = Math.max(0, Math.ceil(filteredAdminEvents.length / rowsPerPage) - 1);

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [isAdminDashboard, filteredAdminEvents.length, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category, dateFrom, dateTo, queryLocation, radius, unit]);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    const value = parseInt(event.target.value, 10);
    if (isAdminDashboard) {
      setAdminRowsPerPage(value);
    } else {
      setCustomerPageSize(value);
    }
    setPage(0);
  }, [isAdminDashboard]);

  const handleChangeDense = useCallback((event) => {
    setDense(event.target.checked);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchValue(event.target.value);
    setPage(0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    setPage(0);
  }, []);

  const handleCategoryChange = useCallback((event) => {
    setCategory(event.target.value);
  }, []);

  const handleRemoveFilter = useCallback((key) => {
    if (key === 'search') setSearchValue('');
    if (key === 'category') setCategory('');
    if (key === 'dateFrom') setDateFrom('');
    if (key === 'dateTo') setDateTo('');
    if (key === 'location') setQueryLocation(null);
    if (key === 'radius') {
      setRadius(DEFAULT_RADIUS);
      setUnit(DEFAULT_EVENT_SEARCH_PARAMS.unit);
    }
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setSearchValue('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    setQueryLocation(null);
    setRadius(DEFAULT_RADIUS);
    setUnit(DEFAULT_EVENT_SEARCH_PARAMS.unit);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'search') {
      setSearchValue(value);
      setPage(0);
    }
  }, []);

  const dashboardRoot = isAdminDashboard ? paths.adminDashboard.root : paths.dashboard.root;
  const getEventDetailsPath = useCallback((id) => (isAdminDashboard ? paths.adminDashboard.eventDetails(id) : paths.dashboard.eventDetails(id)), [isAdminDashboard]);

  // ---- render ----

  if (!isAdminDashboard) {
    return (
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs heading={t('events')} links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('events') }]} sx={{ mb: { xs: 3, md: 5 } }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t('searchEventsPlaceholder')}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mingcute:search-line" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <AddressFilterField
            value={queryLocation?.address}
            onPlaceSelected={setQueryLocation}
            sx={{ flex: 1, '& .MuiInputBase-input': { py: '16.5px' } }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} alignItems={{ sm: 'center' }}>
          <TextField
            select
            label="Unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'background.paper' } }}
          >
            {UNIT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Radius"
            value={radius}
            onChange={(event) => setRadius(event.target.value === '' ? '' : Number(event.target.value))}
            sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'background.paper' } }}
          >
            {RADIUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'background.paper' } }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="From"
            value={dateFrom ? dayjs(dateFrom) : null}
            onChange={(newValue) => setDateFrom(newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                sx: { minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'background.paper' } },
              },
            }}
          />

          <DatePicker
            label="To"
            value={dateTo ? dayjs(dateTo) : null}
            onChange={(newValue) => setDateTo(newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                sx: { minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'background.paper' } },
              },
            }}
          />
        </Stack>

        {activeFilters.length > 0 && (
          <FiltersResult totalResults={customerTotal} onReset={handleResetAllFilters} sx={{ mb: 3 }}>
            {activeFilters.map((filter) => (
              <FiltersBlock key={filter.key} label={`${filter.label}:`} isShow>
                <Chip
                  {...chipProps}
                  label={filter.value}
                  onDelete={() => handleRemoveFilter(filter.key)}
                  sx={{ textTransform: 'capitalize' }}
                />
              </FiltersBlock>
            ))}
          </FiltersResult>
        )}

        {customerEventsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Box sx={{ position: 'relative', opacity: customerEventsFetching ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
              <Grid container spacing={2}>
                {customerEvents.map((event) => (
                  <Grid key={event.id} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                    <EventCard event={event} onClick={() => router.push(getEventDetailsPath(event.id))} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {!customerEvents.length && (
              <Box
                sx={{
                  mt: 1,
                  py: { xs: 7, md: 8.5 },
                  px: 2,
                  width: 1,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: alpha('#B29673', 0.35),
                  bgcolor: alpha('#B29673', 0.02),
                }}
              >
                <Iconify icon="solar:calendar-mark-bold" width={28} sx={{ mb: 1.25, color: '#B29673' }} />

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}>
                  {searchValue.trim() ? `No results found for "${searchValue.trim()}".` : 'No events found.'}
                </Typography>

                {searchValue.trim() && (
                  <Box
                    component="button"
                    type="button"
                    onClick={handleClearSearch}
                    sx={{
                      p: 0,
                      border: 0,
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                      color: '#8B6F4E',
                      font: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Clear search
                  </Box>
                )}
              </Box>
            )}

            {customerTotal > rowsPerPage && (
              <TablePaginationCustom
                page={page}
                count={customerTotal}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[12, 20, 40]}
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}
      </DashboardContent>
    );
  }

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs heading={t('events')} links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('events') }]} sx={{ mb: { xs: 3, md: 5 } }} />

        <Card>
          <FlexibleTableToolbar
            filterFields={FILTER_FIELDS}
            filterValues={{ search: searchValue }}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            inlineFilters
          />

          <Box sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} sx={{ '& th': { fontWeight: 700 } }} />
                <TableBody>
                  {paginatedEvents.map((ev, index) => (
                    <TableRow key={ev.id} tabIndex={-1}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell sx={{ width: 320, maxWidth: 320 }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Avatar src={ev.image || ''} alt={ev.title} variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'grey.200' }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {ev.title}
                            </Typography>
                            <Typography
                              component="div"
                              variant="caption"
                              sx={{
                                display: 'block',
                                maxWidth: 1,
                                overflow: 'hidden',
                                color: 'text.secondary',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ev.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatEventDate(ev)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {ev.venue?.name || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          {[ev.venue?.city, ev.venue?.stateCode].filter(Boolean).join(', ')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <ClassificationChips event={ev} />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {formatEventPrice(ev) || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GenericTableRowActions
                            actions={[{ key: 'view', icon: 'solar:eye-bold', tooltip: t('viewDetails'), onClick: () => router.push(getEventDetailsPath(ev.id)) }]}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableNoData notFound={paginatedEvents.length === 0} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            dense={dense}
            onChangeDense={handleChangeDense}
            page={page}
            count={filteredAdminEvents.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      </DashboardContent>
    </>
  );
}
