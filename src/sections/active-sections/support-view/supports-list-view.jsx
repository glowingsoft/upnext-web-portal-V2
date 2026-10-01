import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { memo, useCallback, useMemo } from 'react';

import { toast } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslate } from 'src/locales/use-locales';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { useGetSupportRequestsQuery, useUpdateSupportRequestStatusMutation } from 'src/store/Reducer/contact-support-api';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useDataTable } from 'src/hooks/use-data-table';

import { SupportTableRow } from './support-table-row';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default', countKey: 'totalDocs' },
  { value: 'pending', label: 'Pending', color: 'warning', countKey: 'totalPending' },
  { value: 'responded', label: 'Responded', color: 'info', countKey: 'totalResponded' },
  { value: 'resolved', label: 'Resolved', color: 'success', countKey: 'totalResolved' },
];

// Memoized Table Content Component
const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, onReplySent, onResolve, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => (
        <SupportTableRow key={row._id} row={row} serialNumber={currentPage * itemsPerPage + index + 1} onReplySent={onReplySent} onResolve={onResolve} />
      ))}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

// ----------------------------------------------------------------------

export function SupportListView() {
  const { t } = useTranslate();

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'pending', label: t('pending'), color: 'warning', countKey: 'totalPending' },
      { value: 'responded', label: t('responded', { defaultValue: 'Responded' }), color: 'info', countKey: 'totalResponded' },
      { value: 'resolved', label: t('resolved', { defaultValue: 'Resolved' }), color: 'success', countKey: 'totalResolved' },
    ],
    [t]
  );

  const [updateSupportRequestStatus] = useUpdateSupportRequestStatusMutation();

  const tableHead = useMemo(
    () => [
      { id: 'sr', label: t('srNumber'), width: 80 },
      { id: 'name', label: t('name') },
      { id: 'email', label: t('email') },
      { id: 'subject', label: t('subject') },
      { id: 'message', label: t('message') },
      { id: 'receivedAt', label: t('receivedAt'), minWidth: 120 },
      { id: 'status', label: t('status') },
      { id: 'actions', label: t('actions'), width: 100, align: 'center' },
    ],
    [t]
  );

  const supportFilterFields = useMemo(
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

  const defaultFilters = useMemo(
    () =>
      supportFilterFields.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [supportFilterFields]
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
    refetch,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRemoveFilter,
    handleResetFilters,
  } = useDataTable({
    queryHook: useGetSupportRequestsQuery,
    defaultFilters,
    filterFields: supportFilterFields,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { page, search, status, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(status && status !== 'all' ? { status } : {}),
        ...(search ? { keyword: search } : {}),
      };
    },
  });

  const totalCount = meta?.totalRecords ?? dataList.length;

  const handleReplySent = useCallback(async (id) => {
    await updateSupportRequestStatus({ id, status: 'responded' }).unwrap();
    toast.success(t('replySentSuccessfully'));
    refetch();
  }, [refetch, t, updateSupportRequestStatus]);

  const handleResolve = useCallback(async (id) => {
    await updateSupportRequestStatus({ id, status: 'resolved' }).unwrap();
    toast.success(t('resolved', { defaultValue: 'Resolved' }));
    refetch();
  }, [refetch, t, updateSupportRequestStatus]);

  const getStatusCount = useCallback(
    (status) => {
      const counts = meta?.requestsCount || {};
      const option = statusOptions.find((item) => item.value === status);
      if (status === 'all') return counts.totalDocs ?? meta?.totalRecords ?? dataList.length;
      return counts[option?.countKey] ?? dataList.filter((row) => row.status === status).length;
    },
    [dataList, meta, statusOptions]
  );

  // Get status filter field for tabs
  const statusFilterField = useMemo(() => supportFilterFields.find((f) => f.type === 'status'), [supportFilterFields]);

  // Get toolbar filter fields (exclude status as it's in tabs)
  const toolbarFilterFields = useMemo(() => supportFilterFields.filter((f) => f.type !== 'status'), [supportFilterFields]);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('support')} links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('support') }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Card>
        {/* Status Tabs Filter - Conditionally Rendered */}
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
              <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={tableHead} rowCount={totalCount} onSort={table.onSort} />

              <TableContent
                isLoading={isLoading}
                isFetching={isFetching}
                rows={dataList}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onReplySent={handleReplySent}
                onResolve={handleResolve}
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
