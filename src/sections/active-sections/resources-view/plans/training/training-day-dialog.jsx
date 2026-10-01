import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TrainingDayDialog({ open, mode, titleValue, onTitleChange, onClose, onSave }) {
  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Iconify icon="solar:calendar-add-bold-duotone" width={36} sx={{ color: 'text.secondary' }} />
        </Box>
        {isEdit ? 'Edit Day' : 'Add Day'}
      </DialogTitle>

      <DialogContent>
        <TextField label="Name" placeholder="Enter Day Title" value={titleValue} onChange={(e) => onTitleChange(e.target.value)} fullWidth autoFocus sx={{ mt: 1 }} />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" sx={{ px: 3 }} onClick={onSave} disabled={!titleValue.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
