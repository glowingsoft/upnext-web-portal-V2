import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';
import {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} from 'src/store/Reducer/portfolio-api';

import { PortfolioAddTile } from './portfolio/portfolio-add-tile';
import { PortfolioCard } from './portfolio/portfolio-card';
import { PortfolioEmptyState } from './portfolio/portfolio-empty-state';
import { PortfolioFormDialog } from './portfolio/portfolio-form-dialog';
import { PortfolioSkeleton } from './portfolio/portfolio-skeleton';
import { ALLOWED_FILE_TYPES, EMPTY_FORM, getKindFromMime, resolveMediaDisplay } from './portfolio/portfolio-utils';
import { PortfolioViewDialog } from './portfolio/portfolio-view-dialog';

export default function ProviderPortfolioTab({ isPublicView = false, showEdit = false }) {
  const { t } = useTranslate();
  const canManage = showEdit && !isPublicView;
  const { data, isFetching } = useGetPortfoliosQuery(undefined, { skip: !showEdit });
  const items = data?.data?.docs || data?.data?.data || (Array.isArray(data?.data) ? data.data : []);

  const [createPortfolio, { isLoading: isCreating }] = useCreatePortfolioMutation();
  const [updatePortfolio, { isLoading: isUpdating }] = useUpdatePortfolioMutation();
  const [deletePortfolio, { isLoading: isDeleting }] = useDeletePortfolioMutation();
  const [uploadS3, { isLoading: isUploading }] = useUploadS3Mutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const isSaving = isCreating || isUpdating || isUploading;

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    const mediaItem = item.media?.[0];
    const display = resolveMediaDisplay(mediaItem);
    setViewItem(null);
    setEditingId(item._id || item.id);
    setForm({
      name: item.name || '',
      businessName: item.businessName || '',
      description: item.description || '',
      file: mediaItem
        ? { previewUrl: display?.imageUrl, sourceUrl: mediaItem.url, kind: display?.kind, name: display?.name, isExisting: true }
        : null,
    });
    setDialogOpen(true);
  };

  const handleClose = () => setDialogOpen(false);

  const handleRequestDelete = (item) => {
    setViewItem(null);
    setDeleteTarget(item);
  };

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleUploadFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PNG, JPG, PDF, or MP4.');
      return;
    }

    setForm((prev) => ({
      ...prev,
      file: { raw: file, previewUrl: URL.createObjectURL(file), kind: getKindFromMime(file.type), name: file.name },
    }));
  };

  const handleRemoveFile = () => setForm((prev) => ({ ...prev, file: null }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.businessName.trim() || !form.description.trim()) {
      toast.error('Full name, business name, and description are required');
      return;
    }

    try {
      let mediaUrl = form.file?.isExisting ? form.file.sourceUrl : null;

      if (form.file?.raw) {
        const formData = new FormData();
        formData.append('files', form.file.raw);
        const res = await uploadS3(formData).unwrap();
        mediaUrl = res?.data?.file || null;
      }

      const payload = {
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        description: form.description.trim(),
        media: mediaUrl ? [mediaUrl] : [],
      };

      if (editingId) {
        await updatePortfolio({ id: editingId, ...payload }).unwrap();
        toast.success('Portfolio item updated');
      } else {
        await createPortfolio(payload).unwrap();
        toast.success('Portfolio item added');
      }

      setDialogOpen(false);
    } catch (submitError) {
      toast.error(submitError?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePortfolio(deleteTarget._id || deleteTarget.id).unwrap();
      toast.success('Portfolio item removed');
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(deleteError?.data?.message || t('somethingWentWrong'));
    }
  };

  return (
    <Box>
      {!canManage ? (
        <PortfolioEmptyState />
      ) : isFetching ? (
        <PortfolioSkeleton />
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <Grid key={item._id || item.id} item xs={12} sm={6} md={4}>
              <PortfolioCard
                item={item}
                canManage={canManage}
                onEdit={handleOpenEdit}
                onRequestDelete={handleRequestDelete}
                onView={setViewItem}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={4}>
            <PortfolioAddTile onAdd={handleOpenAdd} />
          </Grid>
        </Grid>
      )}

      <PortfolioFormDialog
        open={dialogOpen}
        editingId={editingId}
        form={form}
        isSaving={isSaving}
        onChange={handleFormChange}
        onUploadFile={handleUploadFile}
        onRemoveFile={handleRemoveFile}
        onSave={handleSave}
        onClose={handleClose}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Portfolio Item"
        content="Are you sure you want to delete this portfolio item?"
        action={
          <LoadingButton variant="contained" color="error" loading={isDeleting} onClick={handleConfirmDelete}>
            {t('deleteAction')}
          </LoadingButton>
        }
      />

      <PortfolioViewDialog
        item={viewItem}
        canManage={canManage}
        onClose={() => setViewItem(null)}
        onEdit={handleOpenEdit}
        onRequestDelete={handleRequestDelete}
      />
    </Box>
  );
}
