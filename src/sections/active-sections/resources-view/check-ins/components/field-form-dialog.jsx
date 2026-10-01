import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function FieldFormDialog({ open, mode, fieldForm, onClose, onSave, setFieldForm }) {
  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>{isEdit ? 'Edit Field' : 'Add Field'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Field Name"
            placeholder="e.g. Body Weight (lbs)"
            value={fieldForm.name}
            onChange={(e) => setFieldForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Field Description"
            placeholder="e.g. Required for tracking"
            value={fieldForm.description}
            onChange={(e) => setFieldForm((prev) => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" sx={{ px: 3 }} color="primary" onClick={onSave} disabled={!fieldForm.name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
