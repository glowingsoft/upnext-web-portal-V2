import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import dayjs from 'dayjs';

import LoadingButton from '@mui/lab/LoadingButton';
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

// ----------------------------------------------------------------------

export const EVENT_CATEGORIES = ['Hair Drying', 'Makeup', 'Hair Coloring', 'Facial Treatment', 'Nail Art', 'Spa & Wellness', 'Salon Business', 'Other'];

const eventSchema = zod.object({
  image: zod.any().nullable().optional(),
  title: zod.string().trim().min(1, { message: 'Title is required!' }),
  category: zod.string().min(1, { message: 'Category is required!' }),
  startDate: zod.string().min(1, { message: 'Start date is required!' }),
  endDate: zod.string().min(1, { message: 'End date is required!' }),
  link: zod.string().trim(),
});

const DEFAULT_VALUES = {
  image: null,
  title: '',
  category: '',
  startDate: '',
  endDate: '',
  link: '',
};

// ----------------------------------------------------------------------

export function EventsFormDialog({ open, onClose, editData, onSubmit }) {
  const isEdit = Boolean(editData);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(eventSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              image: editData.image ?? null,
              title: editData.title,
              category: editData.category,
              startDate: editData.startDate,
              endDate: editData.endDate,
              link: editData.link ?? '',
            }
          : DEFAULT_VALUES
      );
    }
  }, [open, editData, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : data.startDate,
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : data.endDate,
    });
    reset(DEFAULT_VALUES);
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">{isEdit ? 'Edit Event' : 'Add Event'}</Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close dialog">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Avatar/image upload */}
            <Stack alignItems="center">
              <Field.UploadAvatar
                name="image"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    *.jpeg, *.jpg, *.png, *.gif — max 3.1 MB
                  </Typography>
                }
              />
            </Stack>

            <Field.Text name="title" label="Title" />

            <Field.Select name="category" label="Category">
              {EVENT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.DatePicker name="startDate" label="Start Date" />

            <Field.DatePicker name="endDate" label="End Date" />

            <Field.Text name="link" label="Link" placeholder="https://..." />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={(theme) => ({
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            })}
          >
            {isEdit ? 'Update Event' : 'Add Event'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
