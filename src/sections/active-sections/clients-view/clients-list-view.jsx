import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { memo, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { useGetCustomersQuery } from 'src/store/Reducer/customers-api';
// Import flexible table system
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useDataTable } from 'src/hooks/use-data-table';
import { useTranslate } from 'src/locales/use-locales';

import { SupportTableRow } from './clients-table-row';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

// Memoized Table Content Component
const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => <SupportTableRow key={row._id} row={row} serialNumber={currentPage * itemsPerPage + index + 1} />)}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

// ----------------------------------------------------------------------

export function ClientsListView() {
  const { t } = useTranslate();

  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || '');
  const handleToggleBookingsSort = useCallback(() => {
    setSortBy((prev) => (prev === 'totalBookings' ? '' : 'totalBookings'));
  }, []);

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr'), width: 80, sortable: false },
      { id: 'name', label: t('name'), sortable: false },
      { id: 'phone', label: t('phone'), sortable: false },
      { id: 'totalBookings', label: t('totalBookings'), minWidth: 120 },
      { id: 'joiningDate', label: t('joiningDate'), minWidth: 120, sortable: false },
      { id: 'status', label: t('status'), sortable: false },
      { id: 'action', label: t('action'), width: 132, align: 'center', sortable: false },
    ],
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'active', label: t('active'), color: 'success' },
      { value: 'inactive', label: t('inactive'), color: 'default' },
      { value: 'suspended', label: t('suspended'), color: 'error' },
      { value: 'pending', label: t('pending'), color: 'warning' },
      { value: 'deleted', label: t('deleted'), color: 'default' },
    ],
    [t]
  );

  const CUSTOMER_FILTER_FIELDS = useMemo(
    () => [
      createFilterField.status({
        options: statusOptions,
        showCounts: true,
      }),
      createFilterField.search({
        placeholder: t('searchPlaceholder'),
      }),
    ],
    [statusOptions, t]
  );

  const statusFilterField = useMemo(() => CUSTOMER_FILTER_FIELDS.find((f) => f.type === 'status'), [CUSTOMER_FILTER_FIELDS]);
  const toolbarFilterFields = useMemo(() => CUSTOMER_FILTER_FIELDS.filter((f) => f.type !== 'status'), [CUSTOMER_FILTER_FIELDS]);

  const DEFAULT_FILTERS = useMemo(
    () =>
      CUSTOMER_FILTER_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [CUSTOMER_FILTER_FIELDS]
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
    queryHook: useGetCustomersQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: CUSTOMER_FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(search ? { keyword: search } : {}),
        ...(sortBy ? { sortBy } : {}),
      };
    },
  });

  const totalCount = meta?.totalRecords ?? dataList.length;

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        return meta?.statusList?.all ?? meta?.counts?.all ?? meta?.statuses?.all ?? meta?.totalRecords ?? meta?.total ?? dataList.length ?? 0;
      }
      return meta?.statusList?.[status] ?? meta?.counts?.[status] ?? meta?.statuses?.[status] ?? 0;
    },
    [dataList.length, meta]
  );

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs heading={t('customers')} links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('customers') }]} sx={{ mb: { xs: 3, md: 5 } }} />

        <Card>
          <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} />

          {/* Flexible Toolbar with Debounced Search */}
          <FlexibleTableToolbar
            filterFields={toolbarFilterFields}
            filterValues={{
              ...filters.state,
              search: searchDisplayValue,
            }}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            inlineFilters
          />

          {/* Active Filters Display */}
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
            {/* Loading Indicator */}
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  headLabel={TABLE_HEAD}
                  order={sortBy === 'totalBookings' ? 'desc' : 'asc'}
                  orderBy={sortBy === 'totalBookings' ? 'totalBookings' : ''}
                  onSort={handleToggleBookingsSort}
                />

                <TableContent
                  isLoading={isLoading}
                  isFetching={isFetching}
                  rows={dataList}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
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
    </>
  );
}
