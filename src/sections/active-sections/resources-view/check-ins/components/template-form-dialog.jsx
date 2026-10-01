import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { FREQUENCY_OPTIONS } from '../check-ins-mock';

// ----------------------------------------------------------------------

export function TemplateFormDialog({ open, mode, form, onClose, onSave, onAddField, onEditField, onDeleteField, onDeleteTemplate, setForm }) {
  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>{isEdit ? 'Edit Check-In Template' : 'Create Check-In Template'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* Template Name */}
          <TextField
            label="Template Name"
            placeholder="e.g. Weekly Check-In (Standard)"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
          />

          {/* Frequency */}
          <FormControl fullWidth>
            <InputLabel>Frequency (Every)</InputLabel>
            <Select value={form.frequency} label="Frequency (Every)" onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Fields To Include */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Fields To Include
            </Typography>

            <Stack spacing={1.5}>
              {form.fields.length === 0 && (
                <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                  No fields added yet. Click &quot;Add Field&quot; below.
                </Typography>
              )}

              {form.fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {field.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {field.description}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => onEditField(field, index)} sx={{ color: 'text.secondary' }}>
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDeleteField(index)} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Button variant="outlined" onClick={onAddField} sx={{ mt: 2 }} fullWidth>
              Add Field
            </Button>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 0 }}>
        {isEdit && (
          <Button variant="outlined" color="error" onClick={onDeleteTemplate} sx={{ mr: 'auto', px: 3 }}>
            Delete Template
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={onSave} disabled={!form.name.trim()}>
          {isEdit ? 'Save Changes' : 'Save Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
