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
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
import { useGetAdminTagsQuery, useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation } from 'src/store/Reducer/tags-api';

import { TagsDetailDialog } from './tags-detail-dialog';
import { TagsFormDialog } from './tags-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = ['Sr', 'Name', 'Category', 'Status', 'Sort Order', 'Actions'];

const STATUS_COLOR = { active: 'success', inactive: 'warning', deleted: 'error' };

const TOOLBAR_FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search tags...' })];

function isNotFoundError(error) {
  return error?.status === 404 || /not found/i.test(error?.data?.message || '');
}

// ----------------------------------------------------------------------

export function TagsView() {
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);

  const [viewDialog, setViewDialog] = useState({ open: false, tag: null });
  const [formDialog, setFormDialog] = useState({ open: false, editData: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: tagsData, isLoading, isFetching, refetch: refetchTags } = useGetAdminTagsQuery({
    search: debouncedSearch,
    page,
    limit: rowsPerPage,
  });

  const [addTag] = useAddTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const tags = useMemo(() => {
    const raw = tagsData?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [tagsData]);

  const totalCount = tagsData?.meta?.totalRecords || tagsData?.meta?.total || tags.length;

  const handleFilterChange = useCallback(() => {}, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setPage(0);
  }, []);

  const handleOpenView = useCallback((tag) => {
    setViewDialog({ open: true, tag });
  }, []);

  const handleCloseView = useCallback(() => {
    setViewDialog({ open: false, tag: null });
  }, []);

  const handleOpenAdd = useCallback(() => {
    setFormDialog({ open: true, editData: null });
  }, []);

  const handleOpenEdit = useCallback((tag) => {
    setFormDialog({ open: true, editData: tag });
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormDialog({ open: false, editData: null });
  }, []);

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        if (formDialog.editData) {
          await updateTag(data).unwrap();
          toast.success('Tag updated successfully!');
        } else {
          await addTag(data).unwrap();
          toast.success('Tag created successfully!');
        }
        handleCloseForm();
      } catch (error) {
        if (isNotFoundError(error)) {
          toast.error('This tag no longer exists. Refreshing the list…');
          handleCloseForm();
          refetchTags();
          return;
        }
        toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
      }
    },
    [formDialog.editData, handleCloseForm, addTag, updateTag, refetchTags]
  );

  const handleRequestDelete = useCallback((tag) => {
    setDeleteConfirm({ open: true, id: tag._id || tag.id, name: tag.name });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteConfirm({ open: false, id: null, name: '' });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteTag(deleteConfirm.id).unwrap();
      toast.success('Tag deleted successfully!');
    } catch (error) {
      if (isNotFoundError(error)) {
        toast.success('Tag was already deleted. Refreshing the list…');
      } else {
        toast.error(error?.data?.message || error?.message || 'Failed to delete tag.');
      }
      refetchTags();
    } finally {
      handleCloseDelete();
    }
  }, [deleteConfirm.id, deleteTag, handleCloseDelete, refetchTags]);

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
          heading="Tags"
          links={[{ name: 'Dashboard', href: paths.adminDashboard.root }, { name: 'Tags' }]}
          action={
            <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenAdd}>
              Add Tag
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <FlexibleTableToolbar
            filterFields={TOOLBAR_FILTER_FIELDS}
            filterValues={{ search: searchValue }}
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
                    {tags.map((tag, index) => (
                      <TableRow key={tag._id || tag.id} hover>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{page * rowsPerPage + index + 1}</TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {tag.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {tag.category ? (
                            <Label variant="soft" color="info">
                              {tag.category?.name || tag.category?.translations?.en}
                            </Label>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {tag.status ? (
                            <Label variant="soft" color={STATUS_COLOR[tag.status] || 'default'} sx={{ textTransform: 'capitalize' }}>
                              {tag.status}
                            </Label>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 28,
                              height: 28,
                              px: 1,
                              borderRadius: 999,
                              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                              fontWeight: 700,
                              fontSize: 13,
                              color: 'text.primary',
                            }}
                          >
                            {tag.sortOrder ?? '—'}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <GenericTableRowActions
                            actions={[
                              { key: 'view', icon: 'solar:eye-bold', tooltip: 'View', onClick: () => handleOpenView(tag) },
                              ...(tag.status === 'deleted'
                                ? []
                                : [
                                    { key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => handleOpenEdit(tag) },
                                    {
                                      key: 'delete',
                                      icon: 'solar:trash-bin-trash-bold',
                                      tooltip: 'Delete',
                                      color: 'error',
                                      onClick: () => handleRequestDelete(tag),
                                    },
                                  ]),
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {!isLoading && tags.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No tags found
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

      <TagsDetailDialog open={viewDialog.open} onClose={handleCloseView} tag={viewDialog.tag} />

      <TagsFormDialog open={formDialog.open} onClose={handleCloseForm} editData={formDialog.editData} onSubmit={handleSubmitForm} />

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDelete}
        title="Delete tag"
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
