import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StatusTabsFilter from 'src/components/filters/status-tabs-filter';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TablePaginationCustom } from 'src/components/table';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetAdminBadgesQuery,
  useAddBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
  useDeleteBadgeOptionMutation,
} from 'src/store/Reducer/badges-api';

import { BadgesDetailDialog } from './badges-detail-dialog';
import { BadgesFormDialog } from './badges-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = ['Sr', 'Name', 'Scope', 'Status', 'Options', 'Actions'];

const SCOPE_COLOR = { user: 'info', business: 'warning', both: 'secondary' };

const SCOPE_TABS = [
  { value: '', label: 'All', color: 'default' },
  { value: 'user', label: 'User', color: 'info' },
  { value: 'business', label: 'Business', color: 'warning' },
  { value: 'both', label: 'Both', color: 'secondary' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const TOOLBAR_FILTER_FIELDS = [
  createFilterField.search({ placeholder: 'Search badges...' }),
  createFilterField.select({ key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS, defaultValue: 'all' }),
];
function isNotFoundError(error) {
  return error?.status === 404 || /not found/i.test(error?.data?.message || '');
}

// ----------------------------------------------------------------------

export function BadgesView() {
  const [searchValue, setSearchValue] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);

  const [viewDialog, setViewDialog] = useState({ open: false, badge: null });
  const [formDialog, setFormDialog] = useState({ open: false, editData: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleteOptionConfirm, setDeleteOptionConfirm] = useState({ open: false, badge: null, optionId: null, name: '' });

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: badgesData, isLoading, isFetching, refetch: refetchBadges } = useGetAdminBadgesQuery({
    search: debouncedSearch,
    page,
    limit: rowsPerPage,
    scope: scopeFilter,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [addBadge] = useAddBadgeMutation();
  const [updateBadge] = useUpdateBadgeMutation();
  const [deleteBadge] = useDeleteBadgeMutation();
  const [deleteBadgeOption] = useDeleteBadgeOptionMutation();

  const badges = useMemo(() => {
    const raw = badgesData?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [badgesData]);

  const totalCount = badgesData?.meta?.totalRecords || badgesData?.meta?.total || badges.length;

  const getScopeCount = useCallback(
    (scope) => {
      const key = scope || 'all';
      return badgesData?.meta?.scopeList?.[key] ?? 0;
    },
    [badgesData]
  );

  const handleScopeChange = useCallback((_, newValue) => {
    setScopeFilter(newValue);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
      setPage(0);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setPage(0);
  }, []);

  const handleOpenView = useCallback((badge) => {
    setViewDialog({ open: true, badge });
  }, []);

  const handleCloseView = useCallback(() => {
    setViewDialog({ open: false, badge: null });
  }, []);

  const handleOpenAdd = useCallback(() => {
    setFormDialog({ open: true, editData: null });
  }, []);

  const handleOpenEdit = useCallback((badge) => {
    setFormDialog({ open: true, editData: badge });
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormDialog({ open: false, editData: null });
  }, []);

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        if (formDialog.editData) {
          await updateBadge(data).unwrap();
          toast.success('Badge updated successfully!');
        } else {
          await addBadge(data).unwrap();
          toast.success('Badge created successfully!');
        }
        handleCloseForm();
      } catch (error) {
        if (isNotFoundError(error)) {
          toast.error('This badge no longer exists. Refreshing the list…');
          handleCloseForm();
          refetchBadges();
          return;
        }
        toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
      }
    },
    [formDialog.editData, handleCloseForm, addBadge, updateBadge, refetchBadges]
  );

  const handleRequestDelete = useCallback((badge) => {
    setDeleteConfirm({ open: true, id: badge._id || badge.id, name: badge.translations?.en || badge.name });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteConfirm({ open: false, id: null, name: '' });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteBadge(deleteConfirm.id).unwrap();
      toast.success('Badge deleted successfully!');
    } catch (error) {
      if (isNotFoundError(error)) {
        toast.success('Badge was already deleted. Refreshing the list…');
      } else {
        toast.error(error?.data?.message || error?.message || 'Failed to delete badge.');
      }
      refetchBadges();
    } finally {
      handleCloseDelete();
    }
  }, [deleteConfirm.id, deleteBadge, handleCloseDelete, refetchBadges]);

  const handleRequestDeleteOption = useCallback((badge, optionId, name) => {
    setDeleteOptionConfirm({ open: true, badge, optionId, name });
  }, []);

  const handleCloseDeleteOption = useCallback(() => {
    setDeleteOptionConfirm({ open: false, badge: null, optionId: null, name: '' });
  }, []);

  const handleConfirmDeleteOption = useCallback(async () => {
    try {
      const badgeId = deleteOptionConfirm.badge?._id || deleteOptionConfirm.badge?.id;
      await deleteBadgeOption({ id: badgeId, optionId: deleteOptionConfirm.optionId }).unwrap();
      toast.success('Option deleted successfully!');
      setViewDialog((prev) => {
        if (!prev.badge) return prev;
        return {
          ...prev,
          badge: {
            ...prev.badge,
            options: prev.badge.options?.filter((opt) => (opt._id || opt.id) !== deleteOptionConfirm.optionId),
          },
        };
      });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete option.');
    } finally {
      handleCloseDeleteOption();
    }
  }, [deleteOptionConfirm, deleteBadgeOption, handleCloseDeleteOption]);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleChangeDense = useCallback((event) => {
    setDense(event.target.checked);
  }, []);

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Badges"
          links={[{ name: 'Dashboard', href: paths.adminDashboard.root }, { name: 'Badges' }]}
          action={
            <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenAdd}>
              Add Badge
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <StatusTabsFilter value={scopeFilter} options={SCOPE_TABS} onChange={handleScopeChange} getCount={getScopeCount} />

          <FlexibleTableToolbar
            filterFields={TOOLBAR_FILTER_FIELDS}
            filterValues={{ search: searchValue, status: statusFilter }}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          <Box sx={{ position: 'relative' }}>
            {isFetching && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />}

            <Scrollbar>
              <TableContainer>
                <Table size={dense ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEAD.map((col) => (
                        <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'text.primary' }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {badges.map((badge, index) => (
                      <TableRow key={badge._id || badge.id} hover>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{page * rowsPerPage + index + 1}</TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {badge.translations?.en || badge.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {badge.scope ? (
                            <Label variant="soft" color={SCOPE_COLOR[badge.scope] || 'default'}>{badge.scope}</Label>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {badge.status ? (
                            <Label variant="soft" color={badge.status === 'active' ? 'success' : 'error'}>{badge.status}</Label>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {badge.options?.length ?? 0}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <GenericTableRowActions
                            actions={[
                              { key: 'view', icon: 'solar:eye-bold', tooltip: 'View', onClick: () => handleOpenView(badge) },
                              ...(badge.status === 'deleted'
                                ? []
                                : [
                                    { key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => handleOpenEdit(badge) },
                                    {
                                      key: 'delete',
                                      icon: 'solar:trash-bin-trash-bold',
                                      tooltip: 'Delete',
                                      color: 'error',
                                      onClick: () => handleRequestDelete(badge),
                                    },
                                  ]),
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {!isLoading && badges.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No badges found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            dense={dense}
            onChangeDense={handleChangeDense}
            page={page}
            count={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      </DashboardContent>

      <BadgesDetailDialog open={viewDialog.open} onClose={handleCloseView} badge={viewDialog.badge} onDeleteOption={handleRequestDeleteOption} />

      <BadgesFormDialog open={formDialog.open} onClose={handleCloseForm} editData={formDialog.editData} onSubmit={handleSubmitForm} />

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDelete}
        title="Delete badge"
        content={
          <>
            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={deleteOptionConfirm.open}
        onClose={handleCloseDeleteOption}
        title="Delete option"
        content={
          <>
            Are you sure you want to delete <strong>{deleteOptionConfirm.name}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDeleteOption}>
            Delete
          </Button>
        }
      />
    </>
  );
}
