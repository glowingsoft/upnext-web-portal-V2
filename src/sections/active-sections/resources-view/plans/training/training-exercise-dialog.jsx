import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TrainingExerciseDialog({ open, mode, exerciseForm, onChange, onClose, onSave }) {
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
          <Iconify icon="solar:dumbbell-large-bold-duotone" width={36} sx={{ color: 'text.secondary' }} />
        </Box>
        {isEdit ? 'Edit Exercise' : 'Add Exercise'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField label="Exercise Name" placeholder="e.g. Incline DB Press" value={exerciseForm.name} onChange={(e) => onChange('name', e.target.value)} fullWidth autoFocus />
          <TextField label="Sets" placeholder="e.g. 5" value={exerciseForm.sets} onChange={(e) => onChange('sets', e.target.value)} fullWidth />
          <TextField label="Reps" placeholder="e.g. 5" value={exerciseForm.reps} onChange={(e) => onChange('reps', e.target.value)} fullWidth />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" sx={{ px: 3 }} onClick={onSave} disabled={!exerciseForm.name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
