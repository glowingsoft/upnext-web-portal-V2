import { useLayoutEffect, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const buildDefaultHours = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { enabled: true, intervals: [{ start: '09:00', end: '10:00' }] };
    return acc;
  }, {});

const toMins = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const minsToTime = (mins) => {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

function validateIntervals(hours, sessionSlotMins, t) {
  const errors = {};
  const sessionMins = Number(sessionSlotMins) || 0;

  Object.entries(hours).forEach(([day, { enabled, intervals }]) => {
    if (!enabled) return;

    intervals.forEach((iv, idx) => {
      const start = toMins(iv.start);
      const end = toMins(iv.end);

      if (start === null || end === null) {
        errors[day] = errors[day] || {};
        errors[day][idx] = t('startEndTimesRequired');
        return;
      }

      if (end <= start) {
        errors[day] = errors[day] || {};
        errors[day][idx] = t('endTimeAfterStart');
        return;
      }

      if (sessionMins > 0 && end - start < sessionMins) {
        errors[day] = errors[day] || {};
        errors[day][idx] = t('intervalTooShort', { mins: sessionMins });
        return;
      }

      // Overlap check against all other intervals on the same day
      intervals.forEach((other, otherIdx) => {
        if (otherIdx <= idx) return;
        const oStart = toMins(other.start);
        const oEnd = toMins(other.end);
        if (oStart === null || oEnd === null) return;
        if (start < oEnd && oStart < end) {
          errors[day] = errors[day] || {};
          errors[day][idx] = t('overlapsWithInterval', { index: otherIdx + 1 });
          errors[day][otherIdx] = t('overlapsWithInterval', { index: idx + 1 });
        }
      });
    });
  });

  return errors;
}

// ----------------------------------------------------------------------

export function SetSlotsDialog({ open, onClose, value, onChange }) {
  const { t } = useTranslate();
  const [sessionSlotMins, setSessionSlotMins] = useState(value?.sessionSlotMins ?? '');
  const [gapMins, setGapMins] = useState(value?.gapMins ?? '');
  const [sessionSlotError, setSessionSlotError] = useState('');
  const [gapMinsError, setGapMinsError] = useState('');
  const [useSameAsBusinessHours, setUseSameAsBusinessHours] = useState(value?.useSameAsBusinessHours ?? false);
  const [operatingHoursEnabled] = useState(value?.operatingHoursEnabled ?? true);
  const [operatingHours, setOperatingHours] = useState(value?.operatingHours ?? buildDefaultHours());
  const [intervalErrors, setIntervalErrors] = useState({});

  useLayoutEffect(() => {
    if (!open) return;
    setSessionSlotMins(value?.sessionSlotMins ?? '');
    setGapMins(value?.gapMins ?? '');
    setUseSameAsBusinessHours(value?.useSameAsBusinessHours ?? false);
    setOperatingHours(value?.operatingHours ?? buildDefaultHours());
    setSessionSlotError('');
    setGapMinsError('');
    setIntervalErrors({});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearIntervalError = (day, idx) => {
    setIntervalErrors((prev) => {
      if (!prev[day]) return prev;
      const dayErrors = { ...prev[day] };
      delete dayErrors[idx];
      const next = { ...prev };
      if (Object.keys(dayErrors).length === 0) delete next[day];
      else next[day] = dayErrors;
      return next;
    });
  };

  const toggleDay = (day) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    // Clear errors for the toggled day
    setIntervalErrors((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const updateInterval = (day, index, field, dayjsVal) => {
    const formatted = dayjsVal && dayjsVal.isValid() ? dayjsVal.format('HH:mm') : '';
    setOperatingHours((prev) => {
      const intervals = prev[day].intervals.map((iv, i) => (i === index ? { ...iv, [field]: formatted } : iv));
      return { ...prev, [day]: { ...prev[day], intervals } };
    });
    clearIntervalError(day, index);
  };

  const addInterval = (day) => {
    setOperatingHours((prev) => {
      const intervals = prev[day].intervals;
      const lastEnd = toMins(intervals[intervals.length - 1]?.end);
      const start = lastEnd != null ? lastEnd + 60 : 9 * 60;
      const end = start + 60;

      return {
        ...prev,
        [day]: { ...prev[day], intervals: [...intervals, { start: minsToTime(start), end: minsToTime(end) }] },
      };
    });
  };

  const removeInterval = (day, index) => {
    setOperatingHours((prev) => {
      const intervals = prev[day].intervals.filter((_, i) => i !== index);
      return { ...prev, [day]: { ...prev[day], intervals } };
    });
    // Re-index errors after removal
    setIntervalErrors((prev) => {
      if (!prev[day]) return prev;
      const dayErrors = {};
      Object.entries(prev[day]).forEach(([i, msg]) => {
        const num = Number(i);
        if (num < index) dayErrors[num] = msg;
        else if (num > index) dayErrors[num - 1] = msg;
        // drop the removed index
      });
      const next = { ...prev };
      if (Object.keys(dayErrors).length === 0) delete next[day];
      else next[day] = dayErrors;
      return next;
    });
  };

  const handleSave = () => {
    if (useSameAsBusinessHours) {
      const nextSessionSlotError = sessionSlotMins ? '' : t('sessionSlotsRequired');
      const nextGapMinsError = gapMins !== '' && gapMins !== undefined ? '' : t('gapBetweenSlotsRequired');

      setSessionSlotError(nextSessionSlotError);
      setGapMinsError(nextGapMinsError);
      if (nextSessionSlotError || nextGapMinsError) return;

      setIntervalErrors({});
    } else {
      setSessionSlotError('');
      setGapMinsError('');

      if (operatingHoursEnabled) {
        const errors = validateIntervals(operatingHours, 0, t);
        if (Object.keys(errors).length > 0) {
          setIntervalErrors(errors);
          return;
        }
      }
      setIntervalErrors({});
    }

    onChange({ sessionSlotMins, gapMins, useSameAsBusinessHours, operatingHoursEnabled, operatingHours });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle>{t('configureSlots')}</DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Use Same As Business Hours */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.75}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                  color: 'primary.main',
                }}
              >
                <Iconify icon="solar:clock-circle-bold" width={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('useSameAsBusinessHours')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('useSameAsBusinessHoursHint')}
                </Typography>
              </Box>
              <Switch
                checked={useSameAsBusinessHours}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseSameAsBusinessHours(checked);
                  if (!checked) {
                    setOperatingHours(buildDefaultHours());
                    setIntervalErrors({});
                  }
                }}
              />
            </Stack>

            {useSameAsBusinessHours ? (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={t('sessionSlotsMinsLabel')}
                  placeholder={t('egThirty')}
                  type="number"
                  value={sessionSlotMins}
                  onChange={(e) => {
                    setSessionSlotMins(e.target.value);
                    setSessionSlotError('');
                  }}
                  error={!!sessionSlotError}
                  helperText={sessionSlotError}
                  inputProps={{ min: 1 }}
                />

                <TextField
                  fullWidth
                  label={t('gapBetweenSlotsMinsLabel')}
                  placeholder={t('egZero')}
                  type="number"
                  value={gapMins}
                  onChange={(e) => {
                    setGapMins(e.target.value);
                    setGapMinsError('');
                  }}
                  error={!!gapMinsError}
                  helperText={gapMinsError}
                  inputProps={{ min: 0 }}
                />
              </Stack>
            ) : (
              operatingHoursEnabled && (
                <Stack spacing={1.5}>
                  {DAYS.map((day) => {
                    const dayData = operatingHours[day];
                    const dayErrors = intervalErrors[day] || {};
                    const hasError = Object.keys(dayErrors).length > 0;

                    return (
                      <Box
                        key={day}
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: hasError
                            ? 'error.main'
                            : dayData.enabled
                              ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.2)
                              : 'divider',
                          bgcolor: dayData.enabled ? 'background.paper' : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        {/* Day header */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: dayData.enabled ? 1.25 : 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                              {t(day)}
                            </Typography>
                            {hasError && (
                              <Tooltip title={t('dayHasIntervalErrors')} arrow>
                                <Box component="span" sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                                  <Iconify icon="solar:danger-triangle-bold" width={16} />
                                </Box>
                              </Tooltip>
                            )}
                          </Stack>
                          <Switch checked={dayData.enabled} onChange={() => toggleDay(day)} size="small" />
                        </Stack>

                        {dayData.enabled && (
                          <Stack spacing={1}>
                            {dayData.intervals.map((interval, idx) => (
                              <Box key={idx}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <TimePicker
                                    ampm={false}
                                    label={t('from')}
                                    value={interval.start ? dayjs(`2000-01-01T${interval.start}`) : null}
                                    onChange={(val) => updateInterval(day, idx, 'start', val)}
                                    slotProps={{
                                      textField: {
                                        size: 'small',
                                        sx: { flex: 1 },
                                        error: !!dayErrors[idx],
                                      },
                                    }}
                                  />
                                  <TimePicker
                                    ampm={false}
                                    label={t('to')}
                                    value={interval.end ? dayjs(`2000-01-01T${interval.end}`) : null}
                                    onChange={(val) => updateInterval(day, idx, 'end', val)}
                                    slotProps={{
                                      textField: {
                                        size: 'small',
                                        sx: { flex: 1 },
                                        error: !!dayErrors[idx],
                                      },
                                    }}
                                  />
                                  <Tooltip title={t('removeInterval')} arrow>
                                    <span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeInterval(day, idx)}
                                        disabled={dayData.intervals.length === 1}
                                      >
                                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>

                                {dayErrors[idx] && (
                                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, ml: 0.5 }}>
                                    <Iconify icon="solar:info-circle-bold" width={14} sx={{ color: 'error.main', flexShrink: 0 }} />
                                    <Typography variant="caption" color="error">
                                      {dayErrors[idx]}
                                    </Typography>
                                  </Stack>
                                )}
                              </Box>
                            ))}

                            <Button
                              size="small"
                              startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                              onClick={() => addInterval(day)}
                              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                            >
                              {t('addInterval')}
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('cancel')}
          </Button>
          <LoadingButton variant="contained" color="primary" onClick={handleSave}>
            {t('saveSlots')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
