import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter, useSearchParams } from 'src/routes/hooks';

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
import {
  useAcceptBookingMutation,
  useGetAdminBookingsQuery,
  useGetBusinessBookingsQuery,
  useGetCustomerBookingsQuery,
  useGetMyBookingsQuery,
  useRejectBookingMutation,
} from 'src/store/Reducer/bookings-api';
import { useGetBusinessBookingsByAdminQuery, useGetBusinessBookingsPublicQuery } from 'src/store/Reducer/businesses-api';

import { SessionTableRow } from './sessions-table-row';
import { normalizeBooking } from './utils/booking-normalizer';

// ----------------------------------------------------------------------

const TableContent = memo(
  ({ isLoading, isFetching, currentPage, itemsPerPage, onViewRow, onAcceptRow, onRejectRow, table, readOnly, data, showClientColumn, showProviderColumn }) => (
    <TableBody>
      {!isLoading &&
        !isFetching &&
        data.map((row, index) => (
          <SessionTableRow
            key={row._id}
            row={row}
            serialNumber={currentPage * itemsPerPage + index + 1}
            onViewRow={() => onViewRow(row)}
            onAcceptRow={() => onAcceptRow(row)}
            onRejectRow={() => onRejectRow(row)}
            readOnly={readOnly}
            showClientColumn={showClientColumn}
            showProviderColumn={showProviderColumn}
          />
        ))}

      {(isLoading || isFetching) && <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={itemsPerPage} />}

      <TableNoData notFound={!isLoading && !isFetching && data.length === 0} />
    </TableBody>
  )
);

TableContent.displayName = 'BookingsTableContent';

// ----------------------------------------------------------------------

export function BookingsListContent({ provider = null, client = null, isPublicView = false, sx }) {
  const { t, i18n } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const readOnly = pathname.includes('/admin-dashboard');
  // A business's booking list is only ever browsed, never actioned, from the provider detail
  // page (admin looking in, or a customer looking in) — unlike `readOnly` this doesn't affect
  // which route prefix "view booking" links use, only whether accept/reject controls render.
  const hideActions = readOnly || Boolean(provider);
  const appliedStatusRef = useRef(null);

  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isProvider = userType === 'provider' || userType === 'business';
  const isCustomer = userType === 'customer' || userType === 'user';
  const isAdmin = userType === 'admin';
  // - "admin": admin viewing the full bookings list (admin/bookings)
  // - "adminBusiness": admin viewing one business's bookings (admin/businesses/:id/bookings)
  // - "publicBusiness": customer viewing one business's bookings (app/businesses/:id/bookings)
  const apiMode = provider
    ? (isAdmin ? 'adminBusiness' : isPublicView ? 'publicBusiness' : isProvider ? 'business' : 'none')
    : client
      ? (isProvider ? 'business' : 'customer')
      : isProvider
        ? 'business'
        : isCustomer
          ? 'user'
          : isAdmin
            ? 'admin'
            : 'none';

  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, session: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptBooking] = useAcceptBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();

  // On top of the "browsing a specific client/provider's bookings" props, hide whichever column
  // is just "you" on your own bookings list — a customer's own name on their own list (and vice
  // versa for a provider) is redundant, and for customers the API doesn't even populate it.
  const showClientColumn = !client && !isCustomer;
  const showProviderColumn = !provider && !isProvider;

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'requested', label: t('requested'), color: 'warning' },
      { value: 'scheduled', label: t('scheduled'), color: 'info' },
      { value: 'ongoing', label: t('ongoing'), color: 'primary' },
      { value: 'completed', label: t('completed'), color: 'success' },
      { value: 'expired', label: t('expired'), color: 'default' },
      { value: 'canceled', label: t('cancelled'), color: 'error' },
    ],
    [t]
  );

  const scopeOptions = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'service', label: t('service') },
      { value: 'package', label: t('package') },
    ],
    [t]
  );

  const selectedStatus = useMemo(() => {
    const status = searchParams.get('status');
    return statusOptions.some((option) => option.value === status) ? status : 'all';
  }, [searchParams, statusOptions]);

  const tableHead = useMemo(() => {
    const columns = [{ id: 'sr', label: t('sr'), width: 70 }];

    if (showClientColumn) {
      columns.push({ id: 'client', label: t('clients') });
    }

    if (showProviderColumn) {
      columns.push({ id: 'providerName', label: t('providers'), width: 160 });
    }

    columns.push(
      { id: 'serviceName', label: t('services') },
      { id: 'price', label: t('price'), width: 100 },
      { id: 'requestedAt', label: t('requestedAt'), minWidth: 150 },
      { id: 'slot', label: t('daySlot'), width: 180 },
      { id: 'status', label: t('status'), width: 120 },
      { id: 'paymentStatus', label: t('payment'), width: 110 }
    );

    columns.push({ id: 'actions', label: t('actions'), width: 120, align: 'center' });

    return columns;
  }, [showClientColumn, showProviderColumn, t]);

  const sessionFilterFields = useMemo(
    () => [
      createFilterField.status({
        options: statusOptions,
        showCounts: true,
      }),
      createFilterField.search({
        placeholder: t('searchBookingsPlaceholder'),
      }),
      createFilterField.select({
        key: 'scope',
        label: t('type'),
        options: scopeOptions,
        defaultValue: 'all',
      }),
      createFilterField.date({
        key: 'date',
        label: t('date'),
      }),
    ],
    [statusOptions, scopeOptions, t]
  );

  const defaultFilters = useMemo(
    () =>
      sessionFilterFields.reduce((acc, field) => {
        acc[field.key] = field.defaultValue;
        return acc;
      }, {}),
    [sessionFilterFields]
  );

  function useBookingsQuery(params, options) {
    const businessResult = useGetBusinessBookingsQuery(
      { ...params, userId: client?._id },
      { ...options, skip: apiMode !== 'business' }
    );
    const myResult = useGetMyBookingsQuery(params, { ...options, skip: apiMode !== 'user' });
    const customerResult = useGetCustomerBookingsQuery(
      { ...params, id: client?._id },
      { ...options, skip: apiMode !== 'customer' }
    );
    const adminResult = useGetAdminBookingsQuery(params, { ...options, skip: apiMode !== 'admin' });
    const adminBusinessResult = useGetBusinessBookingsByAdminQuery(
      { ...params, businessId: provider?._id },
      { ...options, skip: apiMode !== 'adminBusiness' }
    );
    const publicBusinessResult = useGetBusinessBookingsPublicQuery(
      { ...params, businessId: provider?._id },
      { ...options, skip: apiMode !== 'publicBusiness' }
    );

    if (apiMode === 'business') return businessResult;
    if (apiMode === 'user') return myResult;
    if (apiMode === 'customer') return customerResult;
    if (apiMode === 'admin') return adminResult;
    if (apiMode === 'adminBusiness') return adminBusinessResult;
    if (apiMode === 'publicBusiness') return publicBusinessResult;
    return { data: null, isLoading: false, isFetching: false, error: null, refetch: () => {} };
  }

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
    queryHook: useBookingsQuery,
    defaultFilters,
    filterFields: sessionFilterFields,
    defaultRowsPerPage: 10,
    debounceMs: 500,
    transformFilters: (params) => {
      const { search, status, scope, date, page, ...rest } = params;
      return {
        ...rest,
        page: (page ?? 0) + 1,
        ...(status ? { status } : {}),
        ...(scope ? { scope } : {}),
        ...(date ? { date } : {}),
        ...(search ? { keyword: search } : {}),
      };
    },
  });

  useEffect(() => {
    if (appliedStatusRef.current === selectedStatus) return;
    appliedStatusRef.current = selectedStatus;
    if (filters.state.status !== selectedStatus) {
      handleFilterChange('status', selectedStatus);
    }
  }, [filters.state.status, handleFilterChange, selectedStatus]);
  const apiRows = useMemo(() => dataList.map(normalizeBooking), [dataList, i18n.resolvedLanguage]);

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        return meta?.counts?.all ?? meta?.statuses?.all ?? meta?.totalRecords ?? meta?.total ?? dataList.length ?? 0;
      }
      return meta?.counts?.[status] ?? meta?.statuses?.[status] ?? 0;
    },
    [dataList.length, meta]
  );

  const rows = apiRows;
  const totalCount = meta?.totalRecords ?? meta?.total ?? apiRows.length;

  const statusFilterField = useMemo(() => sessionFilterFields.find((f) => f.type === 'status'), [sessionFilterFields]);
  const toolbarFilterFields = useMemo(() => sessionFilterFields.filter((f) => f.type !== 'status'), [sessionFilterFields]);

  const handleOpenView = (row) => {
    const detailPath = readOnly ? paths.adminDashboard.bookingDetails(row._id) : paths.dashboard.bookingDetails(row._id);
    router.push(detailPath);
  };

  const handleAcceptRow = (row) => {
    setConfirmDialog({ open: true, type: 'accept', session: row });
  };

  const handleRejectRow = (row) => {
    setConfirmDialog({ open: true, type: 'reject', session: row });
  };

  const handleCancelConfirm = () => setConfirmDialog({ open: false, type: null, session: null });

  const handleConfirmAction = async () => {
    const sessionId = confirmDialog.session?._id;
    if (!sessionId) {
      setConfirmDialog({ open: false, type: null, session: null });
      return;
    }

    setIsProcessing(true);
    try {
      if (confirmDialog.type === 'accept') {
        await acceptBooking(sessionId).unwrap();
        toast.success(t('bookingAcceptedSuccess'));
      } else {
        await rejectBooking({ id: sessionId }).unwrap();
        toast.success(t('bookingRejectedSuccess'));
      }
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, type: null, session: null });
    }
  };

  const isAccept = confirmDialog.type === 'accept';

  return (
    <>
      <Card sx={sx}>
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: showClientColumn && showProviderColumn ? 1060 : showClientColumn || showProviderColumn ? 980 : 900 }}>
              <TableHeadCustom headLabel={tableHead} sx={{ '& th': { fontWeight: 700 } }} />
              <TableContent
                isLoading={isLoading}
                isFetching={isFetching}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onViewRow={handleOpenView}
                onAcceptRow={handleAcceptRow}
                onRejectRow={handleRejectRow}
                table={table}
                readOnly={hideActions}
                data={rows}
                showClientColumn={showClientColumn}
                showProviderColumn={showProviderColumn}
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
        title={isAccept ? t('acceptSession') : t('rejectSession')}
        content={t('confirmSessionAction', {
          action: isAccept ? t('accept') : t('reject'),
          name: confirmDialog.session?.client?.name || '',
        })}
        action={
          <Box
            component="button"
            onClick={handleConfirmAction}
            disabled={isProcessing}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 1,
              border: 'none',
              cursor: 'pointer',
              bgcolor: isAccept ? 'success.main' : 'error.main',
              color: 'common.white',
              fontWeight: 600,
              fontSize: 14,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? t('processing') : isAccept ? t('accept') : t('reject')}
          </Box>
        }
      />
    </>
  );
}

BookingsListContent.propTypes = {
  provider: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  client: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  isPublicView: PropTypes.bool,
  sx: PropTypes.object,
};
