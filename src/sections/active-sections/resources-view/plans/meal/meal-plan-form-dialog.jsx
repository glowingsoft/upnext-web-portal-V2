import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

import { MEAL_PHASE_OPTIONS } from '../plans-mock';
import { MealDialog } from './meal-dialog';

// ----------------------------------------------------------------------

const EMPTY_FORM = {
  name: '',
  phase: '',
  targets: { kcal: '', protein: '', carbs: '', fat: '' },
  meals: [],
};

// ----------------------------------------------------------------------

export function MealPlanFormDialog({ open, mode, initialData, onClose, onSave, onDelete }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(EMPTY_FORM);
  const [mealDialog, setMealDialog] = useState({ open: false, mode: 'add', index: null });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(
        isEdit && initialData
          ? {
              name: initialData.name,
              phase: initialData.phase,
              targets: { ...initialData.targets },
              meals: initialData.meals.map((m) => ({ ...m })),
            }
          : EMPTY_FORM
      );
      setMealDialog({ open: false, mode: 'add', index: null });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------------------------------------------------
  // Computed: totals from meals

  const totals = form.meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + Number(m.kcal || 0),
      protein: acc.protein + Number(m.protein || 0),
      carbs: acc.carbs + Number(m.carbs || 0),
      fat: acc.fat + Number(m.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ----------------------------------------------------------------------
  // Meal dialog handlers

  const handleOpenAddMeal = () => setMealDialog({ open: true, mode: 'add', index: null });

  const handleOpenEditMeal = (index) => setMealDialog({ open: true, mode: 'edit', index });

  const handleCloseMeal = () => setMealDialog((prev) => ({ ...prev, open: false }));

  const handleSaveMeal = (mealData) => {
    setForm((prev) => {
      const meals = [...prev.meals];
      if (mealDialog.mode === 'add') {
        meals.push({ ...mealData, id: uuidv4() });
      } else {
        meals[mealDialog.index] = { ...meals[mealDialog.index], ...mealData };
      }
      return { ...prev, meals };
    });
    handleCloseMeal();
  };

  const handleDeleteMeal = (index) => {
    setForm((prev) => {
      const meals = prev.meals.filter((_, i) => i !== index);
      return { ...prev, meals };
    });
  };

  // ----------------------------------------------------------------------
  // Save / Delete

  const handleSave = () => {
    onSave({
      id: isEdit && initialData ? initialData.id : uuidv4(),
      assignedClients: isEdit && initialData ? initialData.assignedClients : 0,
      name: form.name,
      phase: form.phase,
      targets: { ...form.targets },
      meals: form.meals,
    });
  };

  // ----------------------------------------------------------------------

  const currentMealData = mealDialog.index !== null ? form.meals[mealDialog.index] : null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>{isEdit ? 'Edit Meal Plan Template' : 'Meal Plan Template'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Plan Name */}
            <TextField
              fullWidth
              label="Plan Name"
              placeholder="e.g. cutting phase — week 4"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            {/* Phase */}
            <FormControl fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select label="Phase" value={form.phase} onChange={(e) => setForm((prev) => ({ ...prev, phase: e.target.value }))}>
                {MEAL_PHASE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Daily Macro Targets */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Daily Macro Targets
              </Typography>

              {/* Target inputs */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                  mb: 1,
                }}
              >
                {[
                  { label: 'KCAL', key: 'kcal' },
                  { label: 'PROTEIN g', key: 'protein' },
                  { label: 'CARBS g', key: 'carbs' },
                  { label: 'FAT g', key: 'fat' },
                ].map(({ label, key }) => (
                  <TextField
                    key={key}
                    label={label}
                    placeholder="—"
                    type="number"
                    inputProps={{ min: 0 }}
                    size="small"
                    value={form.targets[key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        targets: { ...prev.targets, [key]: e.target.value },
                      }))
                    }
                  />
                ))}
              </Box>

              {/* FROM MEALS calculated row */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                  mb: 1,
                }}
              >
                {[
                  { label: 'FROM MEALS', value: totals.kcal },
                  { label: 'PROTEIN', value: `${totals.protein}g` },
                  { label: 'CARBS', value: `${totals.carbs}g` },
                  { label: 'FAT', value: `${totals.fat}g` },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.disabled" display="block">
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.primary">
                      {value || '0'}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Formula note */}
              <Typography variant="caption" color="text.disabled">
                (P×4)+(C×4)+(F×9) = total kcal · add meals below to build toward target
              </Typography>
            </Box>

            <Divider />

            {/* Meals Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Meals
              </Typography>

              {form.meals.length > 0 && (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {form.meals.map((meal, index) => (
                    <Box
                      key={meal.id}
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {/* Row 1: time, name, actions */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            {meal.time || '—'}
                          </Typography>
                          <Typography variant="subtitle2">Meal {String(index + 1).padStart(2, '0')}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleOpenEditMeal(index)} sx={{ color: 'text.secondary' }}>
                            <Iconify icon="solar:pen-bold" width={16} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteMeal(index)} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* Row 2: food items */}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {meal.foodItems}
                      </Typography>

                      {/* Row 3: macros */}
                      {(meal.kcal || meal.protein || meal.carbs || meal.fat) && (
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                          {meal.kcal ? `${meal.kcal} kcal` : ''}
                          {meal.protein ? ` · P: ${meal.protein}g` : ''}
                          {meal.carbs ? ` · C: ${meal.carbs}g` : ''}
                          {meal.fat ? ` · F: ${meal.fat}g` : ''}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Add Meal button */}
              <Button fullWidth variant="outlined" color="inherit" onClick={handleOpenAddMeal}>
                Add Meal
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
              onClick={() => onDelete(initialData.id)}
              sx={{ mr: 'auto' }}
            >
              Delete Template
            </Button>
          )}
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!form.name.trim()}>
            {isEdit ? 'Save Changes' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meal add/edit sub-dialog */}
      <MealDialog open={mealDialog.open} mode={mealDialog.mode} initialData={currentMealData} onClose={handleCloseMeal} onSave={handleSaveMeal} />
    </>
  );
}
