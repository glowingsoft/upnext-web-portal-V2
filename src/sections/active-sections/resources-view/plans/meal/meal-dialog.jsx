import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { UploadAvatar } from 'src/components/upload';

// ----------------------------------------------------------------------

const EMPTY_MEAL = { image: null, foodItems: '', kcal: '', protein: '', carbs: '', fat: '', time: '' };

// ----------------------------------------------------------------------

export function MealDialog({ open, mode, initialData, onClose, onSave }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(EMPTY_MEAL);

  useEffect(() => {
    if (open) {
      setForm(isEdit && initialData ? { ...EMPTY_MEAL, ...initialData } : EMPTY_MEAL);
    }
  }, [open, isEdit, initialData]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({ ...form });
  };

  const isValid = form.foodItems.trim() !== '';

  // Convert HH:mm string ↔ dayjs for TimePicker
  const timeValue = form.time ? dayjs(`2000-01-01T${form.time}`) : null;
  const handleTimeChange = (newVal) => {
    handleChange('time', newVal && newVal.isValid() ? newVal.format('HH:mm') : '');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>{isEdit ? 'Edit Meal' : 'Add Meal'}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5}>
            {/* Image Upload */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <UploadAvatar
                value={form.image}
                onDrop={(acceptedFiles) => handleChange('image', Object.assign(acceptedFiles[0], { preview: URL.createObjectURL(acceptedFiles[0]) }))}
              />
            </Box>

            {/* Food Items */}
            <TextField
              fullWidth
              label="Food Items"
              placeholder="e.g. 8oz chicken - 1 cup rice - vegetables"
              value={form.foodItems}
              onChange={(e) => handleChange('foodItems', e.target.value)}
            />

            {/* KCAL + PROTEIN */}
            <Stack direction="row" spacing={1.5}>
              <TextField
                fullWidth
                label="KCAL"
                placeholder="e.g 500"
                type="number"
                inputProps={{ min: 0 }}
                value={form.kcal}
                onChange={(e) => handleChange('kcal', e.target.value)}
              />
              <TextField
                fullWidth
                label="PROTEIN g"
                placeholder="e.g 40"
                type="number"
                inputProps={{ min: 0 }}
                value={form.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
              />
            </Stack>

            {/* CARBS + FAT */}
            <Stack direction="row" spacing={1.5}>
              <TextField
                fullWidth
                label="CARBS g"
                placeholder="e.g 50"
                type="number"
                inputProps={{ min: 0 }}
                value={form.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
              />
              <TextField
                fullWidth
                label="FAT g"
                placeholder="e.g 15"
                type="number"
                inputProps={{ min: 0 }}
                value={form.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
              />
            </Stack>

            {/* Time — 24hr */}
            <TimePicker label="Time" ampm={false} value={timeValue} onChange={handleTimeChange} slotProps={{ textField: { fullWidth: true } }} />
          </Stack>
        </DialogContent>

        {/* Actions */}
        <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 2, px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!isValid} fullWidth>
            Save Meal
          </Button>
        </Stack>
      </Dialog>
    </LocalizationProvider>
  );
}
