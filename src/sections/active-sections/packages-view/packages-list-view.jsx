import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { memo, useCallback, useMemo, useState } from 'react';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';

import { toast } from 'src/components/snackbar';

import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';

import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';

import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { useDataTable } from 'src/hooks/use-data-table';
import { useTranslate } from 'src/locales/use-locales';

import { PackagesTableRow } from './packages-table-row';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDeletePackageMutation, useGetPackagesQuery } from 'src/store/Reducer/services-api';

// ----------------------------------------------------------------------

const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, onViewRow, onEditRow, onDeleteRow, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => (
        <PackagesTableRow
          key={row._id}
          row={row}
          serialNumber={currentPage * itemsPerPage + index + 1}
          onViewRow={() => onViewRow(row)}
          onEditRow={() => onEditRow(row)}
          onDeleteRow={() => onDeleteRow(row._id, row.name)}
        />
      ))}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && rows.length === 0} />
  </TableBody>
));

TableContent.displayName = 'TableContent';

// ----------------------------------------------------------------------

export function PackagesListView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;

  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr'), width: 70 },
      { id: 'name', label: t('package'), width: undefined },
      { id: 'services', label: t('services'), width: 260 },
      { id: 'actualPrice', label: t('actualPrice'), width: 140 },
      { id: 'packagePrice', label: t('packagePrice'), width: 140 },
      { id: 'savings', label: t('savings'), width: 120 },
      { id: 'isAvailable', label: t('availability'), width: 120 },
      { id: 'status', label: t('status'), width: 110 },
      { id: 'createdAt', label: t('created'), width: 140 },
      { id: 'actions', label: t('actions'), width: 100, align: 'center' },
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

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'active', label: t('active'), color: 'success' },
      { value: 'inactive', label: t('inactive'), color: 'error' },
    ],
    [t]
  );

  const FILTER_FIELDS = useMemo(
    () => [
      createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: true,
      }),
      createFilterField.search({
        label: t('search'),
        placeholder: t('searchPackagesPlaceholder'),
      }),
      createFilterField.select({
        key: 'availability',
        label: t('availability'),
        options: AVAILABILITY_OPTIONS,
        defaultValue: 'all',
      }),
    ],
    [t, AVAILABILITY_OPTIONS, STATUS_OPTIONS]
  );

  const DEFAULT_FILTERS = useMemo(
    () =>
      FILTER_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [FILTER_FIELDS]
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
    queryHook: useGetPackagesQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, availability, status, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(search ? { keyword: search } : {}),
        ...(availability && availability !== 'all' ? { isAvailable: availability === 'available' } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      };
    },
  });

  const paginatedRows = (dataList || []).map((pkg) => ({
    ...pkg,
    name: pkg.name || pkg.packageName,
    packagePrice: pkg.packagePrice ?? pkg.price,
  }));
  const totalCount = meta?.totalRecords ?? 0;

  const getStatusCount = useCallback(
    (status) => {
      const statusCounts = meta?.statusCounts || {};
      return statusCounts[status] ?? 0;
    },
    [meta]
  );

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), [FILTER_FIELDS]);
  const toolbarFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), [FILTER_FIELDS]);

  // handlers
  const handleOpenAdd = () => router.push(paths.dashboard.packageNew);
  const handleOpenEdit = (row) => router.push(paths.dashboard.packageEdit(row._id), { state: { packageData: row } });

  const handleOpenView = (row) => {
    const detailPath = isAdminRoute ? paths.adminDashboard.packageDetails(row._id) : paths.dashboard.packageDetails(row._id);
    router.push(detailPath, { state: { packageData: row } });
  };

  const handleDeleteRow = (id, name) => setDeleteConfirm({ open: true, id, name });
  const handleCancelDelete = () => setDeleteConfirm({ open: false, id: null, name: '' });
  const handleConfirmDelete = async () => {
    try {
      await deletePackage(deleteConfirm.id).unwrap();
      toast.success(t('packageDeletedSuccess', { name: deleteConfirm.name }));
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (err) {
      toast.error(err?.data?.message || t('failedToDeletePackage'));
    }
  };

  // ----------------------------------------------------------------------

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading={t('packages')}
          links={[
            {
              name: t('dashboard'),
              href: dashboardRoot,
            },
            {
              name: t('packages'),
            },
          ]}
          action={
            <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenAdd}>
              {t('addPackage')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} />

          <FlexibleTableToolbar
            filterFields={toolbarFields}
            filterValues={{
              ...filters.state,
              search: searchDisplayValue,
            }}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            inlineFilters
          />

          {canReset && (
            <FlexibleTableFiltersResult
              activeFilters={activeFilters}
              totalResults={totalCount}
              onResetFilters={handleResetFilters}
              onRemoveFilter={handleRemoveFilter}
              sx={{
                p: 2.5,
                pt: 0,
              }}
            />
          )}

          <Box
            sx={{
              position: 'relative',
            }}
          >
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
              <Table
                size={table.dense ? 'small' : 'medium'}
                sx={{
                  minWidth: 1280,
                }}
              >
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={totalCount} />

                <TableContent
                  isLoading={isLoading}
                  isFetching={isFetching}
                  rows={paginatedRows}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onViewRow={handleOpenView}
                  onEditRow={handleOpenEdit}
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
        open={deleteConfirm.open}
        onClose={handleCancelDelete}
        title={t('deletePackageTitle')}
        content={t('confirmDeletePackageMessage', { name: deleteConfirm.name })}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}>
            {isDeleting ? t('deleting') : t('deleteAction')}
          </Button>
        }
      />
    </>
  );
}
