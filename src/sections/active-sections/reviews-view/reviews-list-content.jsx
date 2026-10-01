import { memo, useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useDataTable } from 'src/hooks/use-data-table';
import { useTranslate } from 'src/locales/use-locales';
import { useDeleteReviewMutation, useGetAdminReviewsQuery, useUpdateReviewStatusMutation } from 'src/store/Reducer/businesses-api';
import { normalizeReview } from 'src/utils/reviews';

import { ReviewTableRow } from './reviews-table-row';
import { ReviewsStatsCard } from './reviews-stats-card';

// ----------------------------------------------------------------------

const TableContent = memo(({ isLoading, isFetching, currentPage, itemsPerPage, onViewBooking, onApprove, onReject, onDelete, table, data }) => (
  <TableBody>
    {!isLoading &&
      !isFetching &&
      data.map((row, index) => (
        <ReviewTableRow
          key={row._id}
          row={row}
          serialNumber={currentPage * itemsPerPage + index + 1}
          onViewBooking={() => onViewBooking(row)}
          onApprove={() => onApprove(row)}
          onReject={() => onReject(row)}
          onDelete={() => onDelete(row)}
        />
      ))}

    {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

    <TableNoData notFound={!isLoading && !isFetching && data.length === 0} />
  </TableBody>
));

TableContent.displayName = 'ReviewsTableContent';

// ----------------------------------------------------------------------

const TABLE_HEAD = (t) => [
  { id: 'sr', label: t('sr'), width: 60 },
  { id: 'reviewer', label: t('reviewer') },
  { id: 'business', label: t('business') },
  { id: 'item', label: t('reviewedItem') },
  { id: 'rating', label: t('rating'), width: 140 },
  { id: 'comment', label: t('comment', { defaultValue: 'Comment' }) },
  { id: 'status', label: t('status'), width: 110 },
  { id: 'date', label: t('date'), width: 120 },
  { id: 'actions', label: t('actions'), width: 90, align: 'center' },
];

export function ReviewsListContent({ sx }) {
  const { t } = useTranslate();
  const router = useRouter();


  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, review: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateReviewStatus] = useUpdateReviewStatusMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'pending', label: t('pending'), color: 'warning' },
      { value: 'approved', label: t('approved'), color: 'success' },
      { value: 'rejected', label: t('rejected'), color: 'error' },
    ],
    [t]
  );

  const ratingOptions = useMemo(
    () => [
      { value: 'all', label: t('allRatings') },
      { value: '5', label: t('fiveStars') },
      { value: '4', label: t('fourStars') },
      { value: '3', label: t('threeStars') },
      { value: '2', label: t('twoStars') },
      { value: '1', label: t('oneStar') },
    ],
    [t]
  );

  const reviewFilterFields = useMemo(
    () => [
      createFilterField.status({
        options: statusOptions,
        showCounts: true,
      }),
      createFilterField.search({
        placeholder: t('searchReviewsPlaceholder'),
      }),
      createFilterField.select({
        key: 'rating',
        label: t('rating'),
        options: ratingOptions,
        defaultValue: 'all',
      }),
    ],
    [statusOptions, ratingOptions, t]
  );

  const defaultFilters = useMemo(
    () =>
      reviewFilterFields.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [reviewFilterFields]
  );

  function useReviewsQuery(params, options) {
    return useGetAdminReviewsQuery(params, options);
  }

  const {
    table,
    filters,
    currentPage,
    itemsPerPage,
    dataList,
    meta,
    isLoading,
    isFetching,
    searchDisplayValue,
    canReset,
    activeFilters,
    handleFilterChange,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRemoveFilter,
    handleResetFilters,
  } = useDataTable({
    queryHook: useReviewsQuery,
    defaultFilters,
    filterFields: reviewFilterFields,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { status, rating, search, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(status ? { status } : {}),
        ...(rating ? { rating } : {}),
        ...(search ? { keyword: search } : {}),
      };
    },
  });

  const rows = useMemo(() => dataList.map(normalizeReview), [dataList]);
  const totalCount = meta?.total ?? rows.length;

  const getStatusCount = useCallback(
    (status) => {
      const counts = meta?.statusCounts || {};
      if (status === 'all') {
        return (counts.pending ?? 0) + (counts.approved ?? 0) + (counts.rejected ?? 0);
      }
      return counts[status] ?? 0;
    },
    [meta]
  );

  const statusFilterField = useMemo(() => reviewFilterFields.find((f) => f.type === 'status'), [reviewFilterFields]);
  const toolbarFilterFields = useMemo(() => reviewFilterFields.filter((f) => f.type !== 'status'), [reviewFilterFields]);

  const handleViewBooking = (row) => {
    if (row.booking?._id) {
      router.push(paths.adminDashboard.bookingDetails(row.booking._id));
    }
  };

  const handleApproveRow = (row) => setConfirmDialog({ open: true, type: 'approve', review: row });

  const handleRejectRow = (row) => {
    setRejectionReason('');
    setConfirmDialog({ open: true, type: 'reject', review: row });
  };

  const handleDeleteRow = (row) => setConfirmDialog({ open: true, type: 'delete', review: row });

  const handleCancelConfirm = () => setConfirmDialog({ open: false, type: null, review: null });

  const handleConfirmAction = async () => {
    const review = confirmDialog.review;
    if (!review?._id || !review?.business) {
      setConfirmDialog({ open: false, type: null, review: null });
      return;
    }

    setIsProcessing(true);
    try {
      if (confirmDialog.type === 'delete') {
        await deleteReview({ businessId: review.business, reviewId: review._id }).unwrap();
        toast.success(t('reviewDeleted'));
      } else {
        const isApprove = confirmDialog.type === 'approve';
        await updateReviewStatus({
          businessId: review.business,
          reviewId: review._id,
          status: isApprove ? 'approved' : 'rejected',
          ...(!isApprove && rejectionReason ? { reason: rejectionReason } : {}),
        }).unwrap();
        toast.success(isApprove ? t('reviewApproved') : t('reviewRejectedSuccess'));
      }
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, type: null, review: null });
    }
  };

  const isApprove = confirmDialog.type === 'approve';
  const isDelete = confirmDialog.type === 'delete';

  const tableHead = useMemo(() => TABLE_HEAD(t), [t]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, ...sx }}>
      <ReviewsStatsCard stats={meta?.stats} />

      <Card>
        <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={{ ...filters.state, search: searchDisplayValue }}
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
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          {isFetching && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />}

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1050 }}>
              <TableHeadCustom headLabel={tableHead} sx={{ '& th': { fontWeight: 700 } }} />
              <TableContent
                isLoading={isLoading}
                isFetching={isFetching}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onViewBooking={handleViewBooking}
                onApprove={handleApproveRow}
                onReject={handleRejectRow}
                onDelete={handleDeleteRow}
                table={table}
                data={rows}
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

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCancelConfirm}
        title={isApprove ? t('approveReviewTitle') : isDelete ? t('deleteReviewTitle') : t('rejectReviewTitle')}
        content={
          <>
            {t(isApprove ? 'approveReviewMessage' : isDelete ? 'deleteReviewMessage' : 'rejectReviewMessage', {
              name: confirmDialog.review?.reviewer || '',
            })}
            {!isApprove && !isDelete && (
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('reviewRejectionReason')}
                placeholder={t('reviewRejectionReasonPlaceholder')}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                sx={{ mt: 2 }}
              />
            )}
          </>
        }
        action={
          <Button variant="contained" color={isApprove ? 'success' : 'error'} onClick={handleConfirmAction} disabled={isProcessing}>
            {isProcessing ? t('processing') : isApprove ? t('approve') : isDelete ? t('deleteAction') : t('reject')}
          </Button>
        }
      />
    </Box>
  );
}
