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

import { SUPPLEMENT_PLANS } from '../plans-mock';
import { SupplementFormDialog } from './supplement-form-dialog';
import { SupplementPlanCard } from './supplement-plan-card';

// ----------------------------------------------------------------------

export function SupplementTab() {
  const [plans, setPlans] = useState(SUPPLEMENT_PLANS);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'create', data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

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

  const handleDelete = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm({ open: false, id: null, name: '' });
    handleCloseForm();
  };

  const handleRequestDelete = (id) => {
    const plan = plans.find((p) => p.id === id);
    setDeleteConfirm({ open: true, id, name: plan?.name || '' });
  };

  // ----------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Supplement Plans</Typography>
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
          <Iconify icon="solar:pill-bold-duotone" width={56} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No supplement plans yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Create your first supplement plan template to assign to clients.
          </Typography>
          <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenCreate}>
            Create Plan
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {plans.map((plan) => (
            <SupplementPlanCard key={plan.id} plan={plan} onEdit={handleOpenEdit} onDelete={handleRequestDelete} />
          ))}
        </Stack>
      )}

      {/* Form Dialog */}
      <SupplementFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialData={formDialog.data}
        onClose={handleCloseForm}
        onSave={handleSave}
        onDelete={handleRequestDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Supplement Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm.id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
