import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { ServiceForm } from './service-form';

// ----------------------------------------------------------------------

/** @deprecated Use ServiceFormView page routes instead. */
export function ServiceFormDialog({ open, onClose, editData, onSubmit }) {
  const isEdit = Boolean(editData);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>{isEdit ? 'Edit Service' : 'Add Service'}</DialogTitle>
      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        <ServiceForm editData={editData} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
