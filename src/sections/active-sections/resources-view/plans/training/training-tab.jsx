import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { TRAINING_PLANS } from '../plans-mock';
import { TrainingPlanCard } from './training-plan-card';
import { TrainingPlanFormDialog } from './training-plan-form-dialog';

// ----------------------------------------------------------------------

export function TrainingTab() {
  const [plans, setPlans] = useState(TRAINING_PLANS);

  const [formDialog, setFormDialog] = useState({ open: false, mode: 'create', data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // ----------------------------------------------------------------------

  const handleOpenCreate = () => setFormDialog({ open: true, mode: 'create', data: null });

  const handleOpenEdit = (plan) => setFormDialog({ open: true, mode: 'edit', data: plan });

  const handleCloseForm = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const handleSave = (planData) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === planData.id);
      return exists ? prev.map((p) => (p.id === planData.id ? planData : p)) : [...prev, planData];
    });
    handleCloseForm();
  };

  const handleRequestDelete = (id) => {
    setDeleteDialog({ open: true, id });
    handleCloseForm();
  };

  const handleConfirmDelete = () => {
    setPlans((prev) => prev.filter((p) => p.id !== deleteDialog.id));
    setDeleteDialog({ open: false, id: null });
  };

  // ----------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Training Plans</Typography>
        <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenCreate}>
          Create Plan
        </Button>
      </Stack>

      {/* Plan List */}
      {plans.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            border: '1.5px dashed',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Iconify icon="solar:dumbbell-large-bold-duotone" width={56} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No training plans yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Create your first training plan template to assign to clients.
          </Typography>
          <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenCreate}>
            Create Plan
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {plans.map((plan) => (
            <TrainingPlanCard key={plan.id} plan={plan} onEdit={handleOpenEdit} onDelete={(id) => setDeleteDialog({ open: true, id })} />
          ))}
        </Stack>
      )}

      {/* Form Dialog */}
      <TrainingPlanFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialData={formDialog.data}
        onClose={handleCloseForm}
        onSave={handleSave}
        onDelete={handleRequestDelete}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Training Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this training plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
