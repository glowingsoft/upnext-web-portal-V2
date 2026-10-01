import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RHFDatePicker, RHFSelect, RHFTextField } from 'src/components/hook-form';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function TaskModal({ open, onClose, onSubmit, onDelete, initialData, mode }) {
  const methods = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      priority: 'low',
      status: 'incomplete',
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset(
        initialData || {
          name: '',
          description: '',
          date: dayjs().format('YYYY-MM-DD'),
          priority: 'low',
          status: 'incomplete',
        }
      );
    }
    // eslint-disable-next-line
  }, [open, initialData]);

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(data);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>{mode === 'edit' ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <RHFTextField name="name" label="Task Name" placeholder="e.g. review jake's check-in" />
              <RHFTextField name="description" label="Task Description" placeholder="Write Task Description..." multiline minRows={3} />
              <RHFDatePicker name="date" label="Date" slotProps={{ textField: { fullWidth: true } }} />
              <RHFSelect name="priority" label="Priority">
                {PRIORITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ pb: 2, px: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
              {mode === 'edit' && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    if (onDelete) onDelete();
                    onClose();
                  }}
                >
                  Delete Task
                </Button>
              )}

              {mode === 'edit' && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={() => {
                    methods.setValue('status', 'completed');
                    handleSubmit();
                  }}
                >
                  Mark As Completed
                </Button>
              )}

              <Button fullWidth variant="contained" type="submit" color="primary">
                {mode === 'edit' ? 'Save Changes' : 'Add Task'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}

export default TaskModal;
