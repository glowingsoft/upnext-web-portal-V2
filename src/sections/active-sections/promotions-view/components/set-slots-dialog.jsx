import { useState } from 'react';
import dayjs from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const buildDefaultHours = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { enabled: true, intervals: [{ start: '06:00', end: '08:00' }] };
    return acc;
  }, {});

// ----------------------------------------------------------------------

export function SetSlotsDialog({ open, onClose, value, onChange }) {
  const [sessionSlotMins, setSessionSlotMins] = useState(value?.sessionSlotMins ?? '');
  const [gapMins, setGapMins] = useState(value?.gapMins ?? '');
  const [operatingHours, setOperatingHours] = useState(value?.operatingHours ?? buildDefaultHours());

  const toggleDay = (day) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateInterval = (day, index, field, dayjsVal) => {
    const formatted = dayjsVal && dayjsVal.isValid() ? dayjsVal.format('HH:mm') : '';
    setOperatingHours((prev) => {
      const intervals = prev[day].intervals.map((iv, i) => (i === index ? { ...iv, [field]: formatted } : iv));
      return { ...prev, [day]: { ...prev[day], intervals } };
    });
  };

  const addInterval = (day) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], intervals: [...prev[day].intervals, { start: '06:00', end: '08:00' }] },
    }));
  };

  const removeInterval = (day, index) => {
    setOperatingHours((prev) => {
      const intervals = prev[day].intervals.filter((_, i) => i !== index);
      return { ...prev, [day]: { ...prev[day], intervals } };
    });
  };

  const handleSave = () => {
    onChange({ sessionSlotMins, gapMins, operatingHours });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle>Set Slots</DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Session slot + gap */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Session Slots (mins)"
                placeholder="e.g 30"
                type="number"
                value={sessionSlotMins}
                onChange={(e) => setSessionSlotMins(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                fullWidth
                label="Gap between slots (mins)"
                placeholder="e.g 30"
                type="number"
                value={gapMins}
                onChange={(e) => setGapMins(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Stack>

            <Divider />

            {/* Operating Hours */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Operating Hours
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Each day can have one or more open intervals
              </Typography>
            </Box>

            {DAYS.map((day) => {
              const dayData = operatingHours[day];
              return (
                <Box key={day}>
                  {/* Day header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                      {day}
                    </Typography>
                    <Switch checked={dayData.enabled} onChange={() => toggleDay(day)} size="small" />
                  </Stack>

                  {dayData.enabled && (
                    <Stack spacing={1.5}>
                      {dayData.intervals.map((interval, idx) => (
                        <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                          <TimePicker
                            ampm={false}
                            label="From"
                            value={interval.start ? dayjs(`2000-01-01T${interval.start}`) : null}
                            onChange={(val) => updateInterval(day, idx, 'start', val)}
                            slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                          />
                          <TimePicker
                            ampm={false}
                            label="To"
                            value={interval.end ? dayjs(`2000-01-01T${interval.end}`) : null}
                            onChange={(val) => updateInterval(day, idx, 'end', val)}
                            slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                          />
                          <IconButton size="small" color="error" onClick={() => removeInterval(day, idx)} disabled={dayData.intervals.length === 1}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Stack>
                      ))}

                      <Button
                        size="small"
                        startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                        onClick={() => addInterval(day)}
                        sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                      >
                        Add Interval
                      </Button>
                    </Stack>
                  )}

                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton variant="contained" color="primary" onClick={handleSave}>
            Save Slots
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
