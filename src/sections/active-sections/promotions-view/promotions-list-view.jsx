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

import { useDeletePromotionMutation, useGetPromotionsQuery } from 'src/store/Reducer/services-api';
import { useTranslate } from 'src/locales/use-locales';

import { PromotionsTableRow } from './promotions-table-row';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

const TableContent = memo(({ isLoading, isFetching, rows, currentPage, itemsPerPage, onViewRow, onEditRow, onDeleteRow, table }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      rows.map((row, index) => (
        <PromotionsTableRow
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

export function PromotionsListView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    name: '',
  });

  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'sr', label: t('sr') },
      { id: 'name', label: t('promotion') },
      { id: 'type', label: t('discountType') },
      { id: 'value', label: t('discount') },
      { id: 'used', label: t('used') },
      { id: 'status', label: t('status') },
      { id: 'expiresAt', label: t('expiresAtColumn') },
      { id: 'actions', label: t('actions'), align: 'center' },
    ],
    [t]
  );

  const FILTER_FIELDS = useMemo(
    () => [
      createFilterField.status({
        key: 'discountType',
        options: [
          { value: 'all', label: t('all'), color: 'default' },
          { value: 'percentage', label: t('percentage'), color: 'info' },
          { value: 'fixed', label: t('fixed'), color: 'warning' },
        ],
        showCounts: true,
      }),

      createFilterField.search({
        placeholder: t('searchPromotionsPlaceholder'),
      }),
    ],
    [t]
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
    queryHook: useGetPromotionsQuery,
    defaultFilters: DEFAULT_FILTERS,
    filterFields: FILTER_FIELDS,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, discountType, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(search ? { keyword: search } : {}),
        ...(discountType && discountType !== 'all' ? { discountType } : {}),
      };
    },
  });

  const totalCount = meta?.totalRecords ?? dataList.length;

  const getDiscountTypeCount = useCallback(
    (discountType) => {
      const counts = meta?.discountTypeCounts || {};
      return counts[discountType] || 0;
    },
    [meta]
  );

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), [FILTER_FIELDS]);

  const toolbarFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), [FILTER_FIELDS]);

  // handlers
  const handleOpenAdd = () => router.push(paths.dashboard.promotionNew);
  const handleOpenEdit = (row) => router.push(paths.dashboard.promotionEdit(row._id));

  const handleOpenView = (row) => {
    router.push(paths.dashboard.promotionDetails(row._id));
  };

  const handleDeleteRow = (id, name) =>
    setDeleteConfirm({
      open: true,
      id,
      name,
    });

  const handleCancelDelete = () =>
    setDeleteConfirm({
      open: false,
      id: null,
      name: '',
    });

  const handleConfirmDelete = async () => {
    try {
      await deletePromotion(deleteConfirm.id).unwrap();
      toast.success(t('promotionDeletedSuccess', { name: deleteConfirm.name }));
      setDeleteConfirm({
        open: false,
        id: null,
        name: '',
      });
    } catch (err) {
      toast.error(err?.data?.message || t('failedToDeletePromotion'));
    }
  };

  // ----------------------------------------------------------------------

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>

        <CustomBreadcrumbs
          heading={t('promotions')}
          links={[
            {
              name: t('dashboard'),
              href: dashboardRoot,
            },
            {
              name: t('promotions'),
            },
          ]}
          action={
            <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenAdd}>
              {t('addPromotion')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={filters.state.discountType}
            onChange={handleFilterChange}
            getCount={getDiscountTypeCount}
          />

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
                  minWidth: 1050,
                }}
              >
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={totalCount} />

                <TableContent
                  isLoading={isLoading}
                  isFetching={isFetching}
                  rows={dataList}
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
        title={t('deletePromotionTitle')}
        content={t('confirmDeletePromotionMessage', { name: deleteConfirm.name })}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}>
            {isDeleting ? t('deleting') : t('deleteAction')}
          </Button>
        }
      />
    </>
  );
}
