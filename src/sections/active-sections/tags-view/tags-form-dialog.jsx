import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useGetCategoriesQuery } from 'src/store/Reducer/categories-api';

// ----------------------------------------------------------------------

const SCOPE_COLOR = { user: 'info', business: 'warning', both: 'secondary' };

const tagSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'Name is required!' }),
  category: zod.string().min(1, { message: 'Category is required!' }),
  sortOrder: zod
    .string()
    .trim()
    .min(1, { message: 'Sort order is required!' })
    .refine((value) => !Number.isNaN(Number(value)), { message: 'Sort order must be a number!' }),
  status: zod.string().optional(),
});

const DEFAULT_VALUES = { name: '', category: '', sortOrder: '', status: 'active' };

export function TagsFormDialog({ open, onClose, editData, onSubmit }) {
  const isEdit = Boolean(editData);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data?.docs || categoriesData?.data?.data || (Array.isArray(categoriesData?.data) ? categoriesData.data : []);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(tagSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;

    if (editData) {
      reset({
        name: editData.name || '',
        category: editData.category?._id || (typeof editData.category === 'string' ? editData.category : ''),
        sortOrder: editData.sortOrder != null ? String(editData.sortOrder) : '',
        status: editData.status || 'active',
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [open, editData, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      sortOrder: Number(data.sortOrder),
    };

    if (isEdit) {
      await onSubmit({ id: editData._id || editData.id, ...payload, status: data.status });
      return;
    }

    await onSubmit(payload);
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Typography variant="h6">{isEdit ? 'Edit Tag' : 'Add Tag'}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="name" label="Name" placeholder="e.g. Featured" />

            <Field.Select name="category" label="Category" disabled={categoriesLoading}>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{cat.name || cat.translations?.en || cat._id}</span>
                    {cat.scope && (
                      <Label
                        variant="soft"
                        color={SCOPE_COLOR[cat.scope] || 'default'}
                        sx={{ textTransform: 'capitalize', flexShrink: 0, height: 18, fontSize: 10, px: 0.75 }}
                      >
                        {cat.scope}
                      </Label>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text name="sortOrder" label="Sort Order" placeholder="e.g. 1" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />

            {isEdit && (
              <Field.Select name="status" label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Field.Select>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {isEdit ? 'Update Tag' : 'Add Tag'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
