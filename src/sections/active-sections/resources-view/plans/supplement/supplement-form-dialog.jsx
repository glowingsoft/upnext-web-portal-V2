import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { SUPPLEMENT_SLOT_OPTIONS } from '../plans-mock';

// ----------------------------------------------------------------------

const EMPTY_FORM = { name: '', slots: [] };

const EMPTY_SUPPLEMENT = { name: '', dosage: '' };

// ----------------------------------------------------------------------

export function SupplementFormDialog({ open, mode, initialData, onClose, onSave, onDelete }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(EMPTY_FORM);

  // Per-slot "add supplement" mini-dialogs: { [slotId]: { open, supplement } }
  const [supDialog, setSupDialog] = useState({});

  // Add-slot selector
  const [slotSelector, setSlotSelector] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        isEdit && initialData ? { name: initialData.name, slots: initialData.slots.map((s) => ({ ...s, supplements: s.supplements.map((sup) => ({ ...sup })) })) } : EMPTY_FORM
      );
      setSupDialog({});
      setSlotSelector('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------------------------------------------------

  const handleAddSlot = () => {
    if (!slotSelector) return;
    setForm((prev) => ({
      ...prev,
      slots: [...prev.slots, { id: uuidv4(), label: slotSelector, supplements: [] }],
    }));
    setSlotSelector('');
  };

  const handleRemoveSlot = (slotId) => {
    setForm((prev) => ({ ...prev, slots: prev.slots.filter((s) => s.id !== slotId) }));
  };

  const openSupDialog = (slotId) => setSupDialog((prev) => ({ ...prev, [slotId]: { open: true, supplement: { ...EMPTY_SUPPLEMENT } } }));

  const closeSupDialog = (slotId) => setSupDialog((prev) => ({ ...prev, [slotId]: { ...prev[slotId], open: false } }));

  const handleSupChange = (slotId, key, value) =>
    setSupDialog((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], supplement: { ...prev[slotId].supplement, [key]: value } },
    }));

  const handleSaveSupplement = (slotId) => {
    const sup = supDialog[slotId]?.supplement;
    if (!sup?.name?.trim()) return;
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === slotId ? { ...s, supplements: [...s.supplements, { id: uuidv4(), ...sup }] } : s)),
    }));
    closeSupDialog(slotId);
  };

  const handleRemoveSupplement = (slotId, supId) => {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === slotId ? { ...s, supplements: s.supplements.filter((sup) => sup.id !== supId) } : s)),
    }));
  };

  // ----------------------------------------------------------------------

  const handleSave = () => {
    const payload = {
      ...(isEdit ? { id: initialData.id, assignedClients: initialData.assignedClients } : { id: uuidv4(), assignedClients: 0 }),
      name: form.name,
      slots: form.slots,
    };
    onSave(payload);
  };

  const isValid = form.name.trim() !== '';

  // Slots already added (to exclude from selector)
  const usedLabels = form.slots.map((s) => s.label);
  const availableSlots = SUPPLEMENT_SLOT_OPTIONS.filter((o) => !usedLabels.includes(o));

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Supplement Plan' : 'Create Supplement Plan'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Plan Name */}
            <TextField
              fullWidth
              label="Plan Name"
              placeholder="e.g. Cutting phase — week 4"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            {/* Supplement Schedule */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Supplement Schedule
              </Typography>

              <Stack spacing={2}>
                {form.slots.map((slot) => {
                  const dialog = supDialog[slot.id] || { open: false, supplement: EMPTY_SUPPLEMENT };
                  return (
                    <Box key={slot.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                      {/* Slot header */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
                          {slot.label}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveSlot(slot.id)} sx={{ color: 'error.main' }}>
                          <Iconify icon="mingcute:close-line" width={16} />
                        </IconButton>
                      </Stack>

                      {/* Supplements chips */}
                      {slot.supplements.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                          {slot.supplements.map((sup) => (
                            <Chip key={sup.id} label={`${sup.name}  ·  ${sup.dosage}`} size="small" onDelete={() => handleRemoveSupplement(slot.id, sup.id)} />
                          ))}
                        </Stack>
                      )}

                      {/* Add supplement button */}
                      <Button size="small" startIcon={<Iconify icon="mingcute:add-line" width={16} />} onClick={() => openSupDialog(slot.id)} sx={{ color: 'text.secondary' }}>
                        Add Supplement
                      </Button>

                      {/* Inline mini-dialog */}
                      <Dialog open={dialog.open} onClose={() => closeSupDialog(slot.id)} maxWidth="xs" fullWidth sx={{ gap: 0 }}>
                        <DialogTitle sx={{ pb: 1.5 }}>Add Supplement</DialogTitle>
                        <DialogContent>
                          <Stack spacing={2.5} sx={{ pt: 1 }}>
                            <TextField
                              fullWidth
                              label="Supplement Name"
                              placeholder="e.g. Vitamin D3"
                              value={dialog.supplement.name}
                              onChange={(e) => handleSupChange(slot.id, 'name', e.target.value)}
                            />
                            <TextField
                              fullWidth
                              label="Dosage"
                              placeholder="e.g. 2 capsules"
                              value={dialog.supplement.dosage}
                              onChange={(e) => handleSupChange(slot.id, 'dosage', e.target.value)}
                            />
                          </Stack>
                        </DialogContent>
                        <Stack direction="row" spacing={1.5} sx={{ px: 3, pb: 3, mt: 2 }}>
                          <Button fullWidth variant="outlined" color="inherit" onClick={() => closeSupDialog(slot.id)}>
                            Cancel
                          </Button>
                          <Button fullWidth variant="contained" color="primary" disabled={!dialog.supplement.name.trim()} onClick={() => handleSaveSupplement(slot.id)}>
                            Save Supplement
                          </Button>
                        </Stack>
                      </Dialog>
                    </Box>
                  );
                })}
              </Stack>

              {/* Add time slot row */}
              {availableSlots.length > 0 && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Add Time Slot</InputLabel>
                    <Select value={slotSelector} label="Add Time Slot" onChange={(e) => setSlotSelector(e.target.value)}>
                      {availableSlots.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button variant="outlined" color="primary" disabled={!slotSelector} onClick={handleAddSlot} sx={{ whiteSpace: 'nowrap', minWidth: 120 }}>
                    Add Slot
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {isEdit && onDelete && (
            <Button variant="soft" color="error" onClick={() => onDelete(initialData.id)} sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" disabled={!isValid} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
