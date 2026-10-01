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

import { DAYS_PER_WEEK_OPTIONS, DURATION_OPTIONS, PHASE_OPTIONS } from '../plans-mock';
import { TrainingDayDialog } from './training-day-dialog';
import { TrainingExerciseDialog } from './training-exercise-dialog';

// ----------------------------------------------------------------------

const EMPTY_FORM = { name: '', phase: '', duration: '', daysPerWeek: '', days: [] };
const EMPTY_EXERCISE = { name: '', sets: '', reps: '' };

// ----------------------------------------------------------------------

export function TrainingPlanFormDialog({ open, mode, initialData, onClose, onSave, onDelete }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(EMPTY_FORM);

  // Day dialog state
  const [dayDialog, setDayDialog] = useState({ open: false, mode: 'add', index: null });
  const [dayTitleInput, setDayTitleInput] = useState('');

  // Exercise dialog state
  const [exerciseDialog, setExerciseDialog] = useState({ open: false, mode: 'add', dayIndex: null, exIndex: null });
  const [exerciseInput, setExerciseInput] = useState(EMPTY_EXERCISE);

  // Reset form whenever dialog opens
  useEffect(() => {
    if (open) {
      setForm(
        isEdit && initialData
          ? {
              name: initialData.name,
              phase: initialData.phase,
              duration: initialData.duration,
              daysPerWeek: initialData.daysPerWeek,
              days: initialData.days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e })) })),
            }
          : EMPTY_FORM
      );
      setDayDialog({ open: false, mode: 'add', index: null });
      setDayTitleInput('');
      setExerciseDialog({ open: false, mode: 'add', dayIndex: null, exIndex: null });
      setExerciseInput(EMPTY_EXERCISE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ----------------------------------------------------------------------
  // Day handlers

  const handleOpenAddDay = () => {
    setDayTitleInput('');
    setDayDialog({ open: true, mode: 'add', index: null });
  };

  const handleOpenEditDay = (index) => {
    setDayTitleInput(form.days[index].title);
    setDayDialog({ open: true, mode: 'edit', index });
  };

  const handleCloseDay = () => setDayDialog((prev) => ({ ...prev, open: false }));

  const handleSaveDay = () => {
    if (!dayTitleInput.trim()) return;
    setForm((prev) => {
      const days = [...prev.days];
      if (dayDialog.mode === 'add') {
        days.push({ id: uuidv4(), title: dayTitleInput.trim(), exercises: [] });
      } else {
        days[dayDialog.index] = { ...days[dayDialog.index], title: dayTitleInput.trim() };
      }
      return { ...prev, days };
    });
    handleCloseDay();
  };

  const handleDeleteDay = (index) => setForm((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== index) }));

  // ----------------------------------------------------------------------
  // Exercise handlers

  const handleOpenAddExercise = (dayIndex) => {
    setExerciseInput(EMPTY_EXERCISE);
    setExerciseDialog({ open: true, mode: 'add', dayIndex, exIndex: null });
  };

  const handleOpenEditExercise = (dayIndex, exIndex) => {
    const ex = form.days[dayIndex].exercises[exIndex];
    setExerciseInput({ name: ex.name, sets: ex.sets, reps: ex.reps });
    setExerciseDialog({ open: true, mode: 'edit', dayIndex, exIndex });
  };

  const handleCloseExercise = () => setExerciseDialog((prev) => ({ ...prev, open: false }));

  const handleSaveExercise = () => {
    if (!exerciseInput.name.trim()) return;
    const { dayIndex, exIndex, mode: exMode } = exerciseDialog;
    const newExercise = {
      id: exMode === 'edit' ? form.days[dayIndex].exercises[exIndex].id : uuidv4(),
      name: exerciseInput.name.trim(),
      sets: exerciseInput.sets,
      reps: exerciseInput.reps,
    };
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        const exercises = [...d.exercises];
        if (exMode === 'add') {
          exercises.push(newExercise);
        } else {
          exercises[exIndex] = newExercise;
        }
        return { ...d, exercises };
      }),
    }));
    handleCloseExercise();
  };

  const handleDeleteExercise = (dayIndex, exIndex) =>
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        return { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIndex) };
      }),
    }));

  // ----------------------------------------------------------------------
  // Save

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      ...(isEdit && initialData ? { id: initialData.id, assignedClients: initialData.assignedClients } : { id: uuidv4(), assignedClients: 0 }),
      name: form.name.trim(),
      phase: form.phase,
      duration: form.duration,
      daysPerWeek: form.daysPerWeek,
      days: form.days,
    });
  };

  // ----------------------------------------------------------------------

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle sx={{ pb: 1 }}>{isEdit ? 'Edit Training Plan Template' : 'Create Training Plan Template'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Plan Name */}
            <TextField
              label="Plan Name"
              placeholder="e.g. Strength Block — Phase 2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            {/* Phase / Mesocycle */}
            <FormControl fullWidth>
              <InputLabel>Phase / Mesocycle</InputLabel>
              <Select value={form.phase} label="Phase / Mesocycle" onChange={(e) => setForm((prev) => ({ ...prev, phase: e.target.value }))}>
                {PHASE_OPTIONS.map((opt, idx) => (
                  <MenuItem key={idx} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Duration + Days Per Week side by side */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Duration (weeks)</InputLabel>
                <Select value={form.duration} label="Duration (weeks)" onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}>
                  {DURATION_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Days Per Week</InputLabel>
                <Select value={form.daysPerWeek} label="Days Per Week" onChange={(e) => setForm((prev) => ({ ...prev, daysPerWeek: e.target.value }))}>
                  {DAYS_PER_WEEK_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Days & Exercises */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Days &amp; Exercises
              </Typography>

              {form.days.length === 0 && (
                <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                  No days added yet. Click &quot;Add Day&quot; below.
                </Typography>
              )}

              <Stack spacing={2}>
                {form.days.map((day, dayIndex) => (
                  <Box
                    key={day.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Day header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.25,
                        bgcolor: 'grey.50',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ flex: 1 }}>
                        Day {dayIndex + 1} — {day.title}
                      </Typography>
                      <IconButton size="small" onClick={() => handleOpenEditDay(dayIndex)} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="solar:pen-bold" width={15} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteDay(dayIndex)} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={15} />
                      </IconButton>
                    </Box>

                    {/* Exercise rows */}
                    <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
                      {day.exercises.length === 0 ? (
                        <Typography variant="caption" color="text.disabled">
                          No exercises added yet.
                        </Typography>
                      ) : (
                        <Box sx={{ mb: 1 }}>
                          {/* Table-like header */}
                          <Stack
                            direction="row"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Typography variant="caption" color="text.disabled" sx={{ flex: 1 }}>
                              Exercise Name
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ width: 44, textAlign: 'center' }}>
                              Sets
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ width: 44, textAlign: 'center' }}>
                              Reps
                            </Typography>
                            <Box sx={{ width: 56 }} />
                          </Stack>

                          {day.exercises.map((exercise, exIndex) => (
                            <Stack
                              key={exercise.id}
                              direction="row"
                              alignItems="center"
                              sx={{
                                px: 1,
                                py: 0.75,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' },
                              }}
                            >
                              <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                {exercise.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ width: 44, textAlign: 'center' }}>
                                {exercise.sets}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ width: 44, textAlign: 'center' }}>
                                {exercise.reps}
                              </Typography>
                              <Stack direction="row" sx={{ width: 56, justifyContent: 'flex-end' }}>
                                <IconButton size="small" onClick={() => handleOpenEditExercise(dayIndex, exIndex)} sx={{ color: 'text.secondary' }}>
                                  <Iconify icon="solar:pen-bold" width={14} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteExercise(dayIndex, exIndex)} sx={{ color: 'error.main' }}>
                                  <Iconify icon="solar:trash-bin-trash-bold" width={14} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          ))}
                        </Box>
                      )}

                      <Button variant="text" onClick={() => handleOpenAddExercise(dayIndex)} sx={{ mt: 0.5 }} fullWidth>
                        Add Exercise
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {form.days.length > 0 && <Divider sx={{ my: 2 }} />}

              <Button variant="outlined" onClick={handleOpenAddDay} fullWidth>
                Add Day
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {isEdit && (
            <Button variant="outlined" color="error" onClick={() => onDelete(initialData.id)} sx={{ mr: 'auto' }}>
              Delete Template
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!form.name.trim()}>
            {isEdit ? 'Save Changes' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Day Dialog ── */}
      <TrainingDayDialog open={dayDialog.open} mode={dayDialog.mode} titleValue={dayTitleInput} onTitleChange={setDayTitleInput} onClose={handleCloseDay} onSave={handleSaveDay} />

      {/* ── Exercise Dialog ── */}
      <TrainingExerciseDialog
        open={exerciseDialog.open}
        mode={exerciseDialog.mode}
        exerciseForm={exerciseInput}
        onChange={(key, value) => setExerciseInput((prev) => ({ ...prev, [key]: value }))}
        onClose={handleCloseExercise}
        onSave={handleSaveExercise}
      />
    </>
  );
}
