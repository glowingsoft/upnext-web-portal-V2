import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';
import { useGetAdminBusinessesQuery, useGetBusinessesQuery } from 'src/store/Reducer/businesses-api';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useDataTable } from 'src/hooks/use-data-table';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { ProviderTableRow } from './provider-table-row';


function useGetProvidersListQuery(params, options) {
  const user = useSelector((state) => state.user);
  const userType = user?.user?.accountState?.userType ?? user?.accountState?.userType;
  const isAdmin = userType === 'admin';

  const adminResult = useGetAdminBusinessesQuery(params, { ...options, skip: !isAdmin || Boolean(options?.skip) });
  const publicResult = useGetBusinessesQuery(params, { ...options, skip: isAdmin || Boolean(options?.skip) });

  return isAdmin ? adminResult : publicResult;
}

function mapBusinessRow(raw) {
  const categoryNames = Array.isArray(raw.categoryNames)
    ? raw.categoryNames
    : Array.isArray(raw.categories)
      ? raw.categories.map((cat) => (typeof cat === 'string' ? cat : cat?.name || cat?.translations?.en)).filter(Boolean)
      : [];

  return {

    ...raw,
    _id: raw._id,
    name: raw.businessName ?? raw.name ?? '',
    avatar: raw.image ?? raw.logo ?? raw.avatar ?? raw.coverUrl,
    user: {
      ...raw.user,
      name: raw.user?.name ?? raw.ownerName ?? raw.contactName ?? '',
      email: raw.user?.email ?? raw.email ?? '',
      avatar: raw.user?.profileIcon ?? raw.user?.avatar,
    },
    categoryNames,
    category: categoryNames.length ? categoryNames.join(', ') : raw.category ?? '',
    specialty: raw.skills ?? raw.specialties ?? raw.specialty ?? [],
    charge: raw.priceRange ?? raw.charge ?? '',
    location: raw.location ?? raw.address ?? '',
    licensedProfessional: Boolean(raw.certifications),
    status: raw.status ?? (raw.isAvailable === false ? 'inactive' : 'active'),
  };
}

const TableContent = memo(({ isLoading, isFetching, currentPage, itemsPerPage, rows, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => <ProviderTableRow key={row._id} row={row} serialNumber={currentPage * itemsPerPage + index + 1} />)}
    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}
    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

export function ProviderListView() {
  const { t } = useTranslate();
  const user = useSelector((state) => state.user);
  const userType = user?.user?.accountState?.userType ?? user?.accountState?.userType;
  const isAdmin = userType === 'admin';
  const isCustomer = userType === 'customer' || userType === 'user';
  const [searchParams] = useSearchParams();
  const sortByFromUrl = searchParams.get('sortBy');
  const dashboardPath = isAdmin ? paths.adminDashboard.root : paths.dashboard.root;

  const BUSINESS_TYPE_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'solo', label: t('solo') },
      { value: 'team', label: t('team') },
    ],
    [t]
  );

  const AVAILABILITY_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'available', label: t('available') },
      { value: 'unavailable', label: t('unavailable') },
    ],
    [t]
  );

  const MIN_EXPERIENCE_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('any') },
      { value: '1', label: t('yearsPlus', { count: 1 }) },
      { value: '3', label: t('yearsPlus', { count: 3 }) },
      { value: '5', label: t('yearsPlus', { count: 5 }) },
      { value: '10', label: t('yearsPlus', { count: 10 }) },
    ],
    [t]
  );

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr'), minWidth: 56, width: 56 },
      { id: 'email', label: t('username'), minWidth: 240 },
      { id: 'name', label: t('businessName'), minWidth: 320 },
      { id: 'category', label: t('category'), minWidth: 120 },
      { id: 'specialty', label: t('specialties'), minWidth: 220 },
      { id: 'charge', label: t('priceRange'), minWidth: 120, align: 'center' },
      { id: 'location', label: t('location'), minWidth: 160, align: 'center' },
      ...(isAdmin ? [{ id: 'licensedProfessional', label: t('licensedProfessional'), minWidth: 150, align: 'center' }] : []),
      ...(!isCustomer ? [{ id: 'status', label: t('status'), minWidth: 100, align: 'center' }] : []),
      { id: 'action', label: t('actions'), minWidth: 100, align: 'center' },
    ],
    [isAdmin, isCustomer, t]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'active', label: t('active'), color: 'success' },
      { value: 'inactive', label: t('inactive'), color: 'secondary' },
      { value: 'suspended', label: t('suspended'), color: 'info' },
      { value: 'pending', label: t('pending'), color: 'warning' },
      { value: 'deleted', label: t('deleted'), color: 'error' },
    ],
    [t]
  );

  const SORT_BY_OPTIONS = useMemo(
    () => [
      { value: 'best_match', label: t('bestMatch') },
      { value: 'rating_high_low', label: t('ratingHighToLow') },
      { value: 'price_low_high', label: t('priceLowToHigh') },
      { value: 'price_high_low', label: t('priceHighToLow') },
    ],
    [t]
  );

  const PROVIDER_FILTER_FIELDS = useMemo(
    () => [
      ...(isAdmin ? [createFilterField.status({ options: statusOptions, showCounts: true })] : []),
      createFilterField.search({ placeholder: t('searchPlaceholder') }),
      createFilterField.select({ key: 'businessType', label: t('businessType'), options: BUSINESS_TYPE_OPTIONS, defaultValue: 'all' }),
      createFilterField.select({ key: 'availability', label: t('availability'), options: AVAILABILITY_OPTIONS, defaultValue: 'all' }),
      createFilterField.select({ key: 'minExperience', label: t('experience'), options: MIN_EXPERIENCE_OPTIONS, defaultValue: 'all' }),
      ...(isAdmin ? [createFilterField.select({ key: 'sortBy', label: t('sortBy'), options: SORT_BY_OPTIONS, defaultValue: 'best_match' })] : []),
    ],
    [isAdmin, t, statusOptions, SORT_BY_OPTIONS, BUSINESS_TYPE_OPTIONS, AVAILABILITY_OPTIONS, MIN_EXPERIENCE_OPTIONS]
  );

  const statusFilterField = useMemo(() => PROVIDER_FILTER_FIELDS.find((f) => f.type === 'status'), [PROVIDER_FILTER_FIELDS]);
  const toolbarFilterFields = useMemo(() => PROVIDER_FILTER_FIELDS.filter((f) => f.type !== 'status'), [PROVIDER_FILTER_FIELDS]);

  const DEFAULT_FILTERS = useMemo(
    () =>
      PROVIDER_FILTER_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [PROVIDER_FILTER_FIELDS]
  );

  const {
    table,
    filters,
    currentPage,
    itemsPerPage,
    searchDisplayValue,
    dataList,
    meta,
    isLoading,
    isFetching,
    canReset,
    activeFilters,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRemoveFilter,
    handleResetFilters,
  } = useDataTable({
    queryHook: useGetProvidersListQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: PROVIDER_FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, availability, minExperience, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(search ? { keyword: search } : {}),
        ...(availability && availability !== 'all' ? { isAvailable: availability === 'available' } : {}),
        ...(minExperience && minExperience !== 'all' ? { minExperience } : {}),
      };
    },
  });

  useEffect(() => {
    if (sortByFromUrl) handleFilterChange('sortBy', sortByFromUrl);
  }, []);

  const providerRows = useMemo(() => dataList.map(mapBusinessRow), [dataList]);
  const totalCount = meta?.totalRecords ?? providerRows.length;

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        return meta?.statusList?.all ?? meta?.counts?.all ?? meta?.statuses?.all ?? meta?.totalRecords ?? meta?.total ?? providerRows.length ?? 0;
      }
      return meta?.statusList?.[status] ?? meta?.counts?.[status] ?? meta?.statuses?.[status] ?? 0;
    },
    [providerRows.length, meta]
  );

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('providers')}
        links={[{ name: t('dashboard'), href: dashboardPath }, { name: t('providers') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card>
        <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} />
        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={{
            ...filters.state,
            search: searchDisplayValue,
          }}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        {canReset && (
          <FlexibleTableFiltersResult
            activeFilters={activeFilters}
            totalResults={totalCount}
            onResetFilters={handleResetFilters}
            onRemoveFilter={handleRemoveFilter}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          {isFetching && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9,
              }}
            />
          )}

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: isAdmin ? 1250 : 1100 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} rowCount={totalCount} />
              <TableContent
                isLoading={isLoading}
                isFetching={isFetching}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                rows={providerRows}
                table={table}
              />
            </Table>
          </Scrollbar>
        </Box>
        <TablePaginationCustom
          page={currentPage}
          dense={table.dense}
          count={totalCount}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>
    </DashboardContent>
  );
}
