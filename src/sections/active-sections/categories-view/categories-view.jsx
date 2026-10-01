import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
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
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from 'src/store/Reducer/categories-api';

import { CategoriesDetailDialog } from './categories-detail-dialog';
import { CategoriesFormDialog } from './categories-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = ['Sr', 'Image', 'Name', 'Scope', 'Status', 'Actions'];

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
  createFilterField.search({ placeholder: 'Search categories...' }),
  createFilterField.select({ key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS, defaultValue: 'all' }),
];

// ----------------------------------------------------------------------

export function CategoriesView() {
  const [searchValue, setSearchValue] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);

  const [viewDialog, setViewDialog] = useState({ open: false, category: null });
  const [formDialog, setFormDialog] = useState({ open: false, editData: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: categoriesData, isLoading, isFetching } = useGetCategoriesQuery({
    search: debouncedSearch,
    page,
    limit: rowsPerPage,
    scope: scopeFilter,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = useMemo(() => {
    const raw = categoriesData?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [categoriesData]);

  const totalCount = categoriesData?.meta?.totalRecords || categoriesData?.meta?.total || categories.length;

  const getScopeCount = useCallback(
    (scope) => {
      const key = scope || 'all';
      return categoriesData?.meta?.scopeList?.[key] ?? 0;
    },
    [categoriesData]
  );

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
      setPage(0);
    }
  }, []);

  const handleScopeChange = useCallback((_, newValue) => {
    setScopeFilter(newValue);
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setPage(0);
  }, []);

  const handleOpenView = useCallback((category) => {
    setViewDialog({ open: true, category });
  }, []);

  const handleCloseView = useCallback(() => {
    setViewDialog({ open: false, category: null });
  }, []);

  const handleOpenAdd = useCallback(() => {
    setFormDialog({ open: true, editData: null });
  }, []);

  const handleOpenEdit = useCallback((category) => {
    setFormDialog({ open: true, editData: category });
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormDialog({ open: false, editData: null });
  }, []);

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        if (formDialog.editData) {
          await updateCategory({ id: formDialog.editData._id || formDialog.editData.id, ...data }).unwrap();
          toast.success('Category updated successfully!');
        } else {
          await addCategory(data).unwrap();
          toast.success('Category created successfully!');
        }
        handleCloseForm();
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
      }
    },
    [formDialog.editData, handleCloseForm, addCategory, updateCategory]
  );

  const handleRequestDelete = useCallback((id, name) => {
    setDeleteConfirm({ open: true, id, name });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteConfirm({ open: false, id: null, name: '' });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteCategory(deleteConfirm.id).unwrap();
      toast.success('Category deleted successfully!');
      setViewDialog((prev) => {
        if (!prev.category) return prev;
        const filtered = prev.category.subCategories?.filter(
          (sub) => (sub._id || sub.id) !== deleteConfirm.id
        );
        return {
          ...prev,
          category: { ...prev.category, subCategories: filtered },
        };
      });
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to delete category.');
    } finally {
      handleCloseDelete();
    }
  }, [deleteConfirm.id, deleteCategory, handleCloseDelete]);

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
          heading="Categories"
          links={[{ name: 'Dashboard', href: paths.adminDashboard.root }, { name: 'Categories' }]}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenAdd}
            >
              Add Category
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {/* Scope filter tabs */}
          <StatusTabsFilter value={scopeFilter} options={SCOPE_TABS} onChange={handleScopeChange} getCount={getScopeCount} />

          {/* Search toolbar */}
          <FlexibleTableToolbar
            filterFields={TOOLBAR_FILTER_FIELDS}
            filterValues={{ search: searchValue, status: statusFilter }}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          {/* Table */}
          <Box sx={{ position: 'relative' }}>
            {isFetching && (
              <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />
            )}

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
                    {categories.map((category, index) => (
                      <TableRow key={category._id || category.id} hover>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>

                        <TableCell>
                          <Avatar
                            src={category.icon || ''}
                            alt={category.translations?.en || category.name}
                            variant="rounded"
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: 'grey.400',
                              color: 'primary.dark',
                              fontWeight: 700,
                              fontSize: 16,
                            }}
                          >
                            {(category.translations?.en || category.name || '?').charAt(0).toUpperCase()}
                          </Avatar>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {category.translations?.en || category.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {category.scope ? (
                            <Label variant="soft" color={SCOPE_COLOR[category.scope] || 'default'}>{category.scope}</Label>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Label variant="soft" color={category.status === 'active' ? 'success' : 'error'}>
                            {category.status}
                          </Label>
                        </TableCell>

                        <TableCell>
                          <GenericTableRowActions
                            actions={[
                              { key: 'view', icon: 'solar:eye-bold', tooltip: 'View', onClick: () => handleOpenView(category) },
                              { key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => handleOpenEdit(category) },
                              {
                                key: 'delete',
                                icon: 'solar:trash-bin-trash-bold',
                                tooltip: 'Delete',
                                color: 'error',
                                onClick: () => handleRequestDelete(
                                  category._id || category.id,
                                  category.translations?.en || category.name
                                ),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {!isLoading && categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No categories found
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

      <CategoriesDetailDialog open={viewDialog.open} onClose={handleCloseView} category={viewDialog.category} />

      <CategoriesFormDialog open={formDialog.open} onClose={handleCloseForm} editData={formDialog.editData} onSubmit={handleSubmitForm} />

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDelete}
        title="Delete category"
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
    </>
  );
}
