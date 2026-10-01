import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { memo, useCallback, useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { SUPPORT_STATUS_OPTIONS } from 'src/_mock';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { useDeleteWalletMutation, useGetWalletsQuery } from 'src/store/Reducer/wallets-api';

import { useClientSideTablePagination } from 'src/hooks/use-client-side-table-pagination';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { useDataTable } from 'src/hooks/use-data-table';
import { useDeleteConfirmation } from 'src/hooks/use-delete-confirmation';

import { SupportTableRow } from './leads-table-row';
import { DUMMYDATA } from './mocks/mock-data';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...SUPPORT_STATUS_OPTIONS.map((option) => ({
    ...option,
    color: (option.value === 'open' && 'success') || (option.value === 'closed' && 'warning') || 'default',
  })),
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 80 },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'joiningDate', label: 'Joining Date', minWidth: 120 },
  { id: 'status', label: 'Status' },
  { id: 'action', label: 'Action', width: 100, align: 'center' },
];

// ----------------------------------------------------------------------

const TIME_PERIOD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'request', label: 'Request' },
  { value: 'profile-viewed', label: 'Profile Viewed' },
  { value: 'viewed Pkg', label: 'Viewed Pkg' },
  { value: 'engaged', label: 'Engaged' },
];

const WALLET_FILTER_FIELDS = [
  // createFilterField.status({
  //   options: STATUS_OPTIONS,
  //   showCounts: true,
  // }),

  createFilterField.select({
    key: 'status',
    label: 'Status',
    options: TIME_PERIOD_OPTIONS,
    defaultValue: 'all',
  }),

  createFilterField.search({
    placeholder: 'Search...',
  }),
];

// Generate default filter values from field definitions
const DEFAULT_FILTERS = WALLET_FILTER_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.defaultValue;
  return acc;
}, {});

// ----------------------------------------------------------------------

// Memoized Table Content Component
const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, onDeleteRow, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => (
        <SupportTableRow key={row._id} row={row} serialNumber={currentPage * itemsPerPage + index + 1} onDeleteRow={() => onDeleteRow(row._id, row.name)} />
      ))}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

// ----------------------------------------------------------------------

export function LeadsListView() {
  const {
    table,
    filters,
    currentPage,
    itemsPerPage,
    searchDisplayValue,
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
    queryHook: useGetWalletsQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: WALLET_FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
  });

  const { confirm, itemToDelete, isDeleting, handleDeleteRow, handleConfirmDelete, handleCancelDelete } = useDeleteConfirmation(useDeleteWalletMutation, {
    successMessage: 'Deleted successfully!',
    errorMessage: 'Failed to delete',
  });

  const { paginatedRows, totalCount } = useClientSideTablePagination({
    rows: DUMMYDATA,
    searchValue: searchDisplayValue,
    searchFields: ['name', 'email', 'phone', 'status'],
    currentPage,
    itemsPerPage,
    onPageChange: handlePageChange,
    orderBy: table.orderBy,
    order: table.order,
  });

  // Calculate status counts for tabs
  const getStatusCount = useCallback(
    (status) => {
      const statusCounts = meta?.counts || {};
      if (status === 'all') {
        return Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
      }
      return statusCounts[status] || 0;
    },
    [meta]
  );

  // Get status filter field for tabs
  const statusFilterField = useMemo(() => WALLET_FILTER_FIELDS.find((f) => f.type === 'status'), []);

  // Get toolbar filter fields (exclude status as it's in tabs)
  const toolbarFilterFields = useMemo(() => WALLET_FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs heading="Leads" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Leads' }]} sx={{ mb: { xs: 3, md: 5 } }} />

        <Card>
          {/* Status Tabs Filter - Conditionally Rendered */}
          {/* <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} /> */}

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
                <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} rowCount={totalCount} onSort={table.onSort} />

                <TableContent
                  isLoading={isLoading}
                  isFetching={isFetching}
                  rows={paginatedRows}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onDeleteRow={handleDeleteRow}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={handleCancelDelete}
        title="Delete Wallet"
        content={
          <>
            Are you sure you want to delete wallet <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </>
  );
}
