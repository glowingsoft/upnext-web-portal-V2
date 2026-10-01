import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { memo, useCallback, useMemo, useState } from 'react';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { useGetBillingHistoryQuery } from 'src/store/Reducer/bookings-api';

import { useDataTable } from 'src/hooks/use-data-table';
import { createFilterField, DATE_FORMAT_PRESETS } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';

import { BillingHistoryDetailDialog } from './billing-history-detail-dialog';
import { BillingHistoryTableRow } from './billing-history-table-row';
import { normalizeBillingHistoryRows } from './utils/billing-history-normalizer';

// ----------------------------------------------------------------------

const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, onViewRow, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => (
        <BillingHistoryTableRow key={row._id} row={row} serialNumber={currentPage * itemsPerPage + index + 1} onViewRow={onViewRow} />
      ))}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

// ----------------------------------------------------------------------

export function BillingHistoryListView() {
  const { t } = useTranslate();
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'paid', label: t('paid'), color: 'success' },
      { value: 'pending', label: t('pending'), color: 'warning' },
      { value: 'partially_captured', label: t('partially_captured'), color: 'warning' },
      { value: 'released', label: t('released'), color: 'primary' },
      { value: 'refunded', label: t('refunded'), color: 'info' },
      { value: 'failed', label: t('failed'), color: 'error' },
      { value: 'expired', label: t('expired'), color: 'default' },
    ],
    [t]
  );

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr'), width: 80 },
      { id: 'customerName', label: t('customer') },
      { id: 'serviceName', label: t('services') },
      { id: 'date', label: t('date'), width: 140 },
      { id: 'paymentMethod', label: t('paymentMethod'), width: 130 },
      { id: 'transactionId', label: t('transactionId'), width: 160 },
      { id: 'amount', label: t('amount'), width: 120, align: 'right' },
      { id: 'status', label: t('status'), width: 140 },
      { id: 'actions', label: '', width: 70, align: 'center' },
    ],
    [t]
  );

  const BILLING_FILTER_FIELDS = useMemo(
    () => [
      createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: false,
      }),

      createFilterField.search({
        placeholder: t('searchByServiceCustomerTransaction'),
      }),

      createFilterField.dateRange({
        key: 'dateRange',
        startLabel: t('startDate'),
        endLabel: t('endDate'),
        displayFormat: DATE_FORMAT_PRESETS.UK,
        apiFormat: DATE_FORMAT_PRESETS.ISO,
        outputFormat: 'flat',
      }),
    ],
    [t, STATUS_OPTIONS]
  );

  const DEFAULT_FILTERS = useMemo(
    () =>
      BILLING_FILTER_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [BILLING_FILTER_FIELDS]
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
    queryHook: useGetBillingHistoryQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: BILLING_FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, status, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(status ? { status } : {}),
        ...(search ? { keyword: search } : {}),
      };
    },
  });

  const rows = useMemo(() => normalizeBillingHistoryRows(dataList), [dataList]);
  const totalCount = meta?.totalRecords ?? meta?.total ?? rows.length;

  const getStatusCount = useCallback(
    (status) => {
      const statusCounts = meta?.statusCounts || {};
      return statusCounts[status] ?? 0;
    },
    [meta]
  );

  const statusFilterField = useMemo(() => BILLING_FILTER_FIELDS.find((f) => f.type === 'status'), [BILLING_FILTER_FIELDS]);
  const toolbarFilterFields = useMemo(() => BILLING_FILTER_FIELDS.filter((f) => f.type !== 'status'), [BILLING_FILTER_FIELDS]);

  const handleViewRow = useCallback((row) => {
    setSelectedBookingId(row.bookingId || row._id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedBookingId(null);
  }, []);

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs heading={t('billingHistory')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('billingHistory') }]} sx={{ mb: { xs: 3, md: 5 } }} />

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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={totalCount} sx={{ '& th': { fontWeight: 700, bgcolor: 'background.neutral' } }} />

                <TableContent
                  isLoading={isLoading}
                  isFetching={isFetching}
                  rows={rows}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onViewRow={handleViewRow}
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

      <BillingHistoryDetailDialog open={Boolean(selectedBookingId)} onClose={handleCloseDetail} bookingId={selectedBookingId} />
    </>
  );
}
