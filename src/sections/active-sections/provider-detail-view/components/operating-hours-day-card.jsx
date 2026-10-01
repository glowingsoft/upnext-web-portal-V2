import dayjs from 'dayjs';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

const DAY_ICONS = {
  monday: 'solar:moon-stars-bold',
  tuesday: 'solar:fire-bold',
  wednesday: 'solar:waterdrop-bold',
  thursday: 'solar:bolt-bold',
  friday: 'solar:star-bold',
  saturday: 'solar:sun-bold',
  sunday: 'solar:sun-2-bold',
};

export function TimeRangeRow({ start, end, error, removable, onStartChange, onEndChange, onRemove, startLabel, endLabel }) {
  const { t } = useTranslate();
  const toTime = (str) => (str ? dayjs(`2000-01-01T${str}`) : null);

  const pickerSlotProps = (hasError) => ({
    textField: {
      size: 'small',
      error: hasError,
      sx: {
        flex: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        },
      },
    },
    desktopPaper: {
      sx: {
        '& .MuiMultiSectionDigitalClockSection-root': {
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      },
    },
  });

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
        }}
      >
        <TimePicker
          label={startLabel || t('open')}
          value={toTime(start)}
          onChange={(val) => val?.isValid() && onStartChange(val.format('HH:mm'))}
          slotProps={pickerSlotProps(!!error)}
        />
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            border: '1px solid',
            borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
          }}
        >
          <Iconify icon="solar:arrow-right-linear" width={16} sx={{ color: 'primary.main' }} />
        </Box>
        <TimePicker
          label={endLabel || t('close')}
          value={toTime(end)}
          onChange={(val) => val?.isValid() && onEndChange(val.format('HH:mm'))}
          slotProps={pickerSlotProps(!!error)}
        />
        {removable && (
          <IconButton
            size="small"
            color="error"
            onClick={onRemove}
            sx={{
              flexShrink: 0,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.06),
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </IconButton>
        )}
      </Stack>

      {error && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, ml: 0.5 }}>
          <Iconify icon="solar:info-circle-bold" width={14} sx={{ color: 'error.main', flexShrink: 0 }} />
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export function DayCard({ day, data, errors, onToggle, onWindowChange, onAddBreak, onBreakChange, onRemoveBreak }) {
  const { t } = useTranslate();
  const isOpen = data.enabled;
  const dayErrors = errors || {};
  const hasError = Boolean(dayErrors.window) || Object.keys(dayErrors.breaks || {}).length > 0;
  const breaks = data.breaks || [];

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: isOpen ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.28) : 'divider',
        bgcolor: 'background.paper',
        boxShadow: isOpen
          ? (theme) => `0 4px 16px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)}`
          : (theme) => `0 2px 8px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.04)}`,
        transition: 'all 0.2s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: isOpen ? 'primary.main' : 'grey.300',
          transition: 'background-color 0.2s ease',
        },
      }}
    >
      <Stack spacing={2} sx={{ p: 2.5, pl: 3 }}>
        {/* Day header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isOpen
                  ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1)
                  : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: '1px solid',
                borderColor: isOpen
                  ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.24)
                  : 'divider',
                transition: 'all 0.2s ease',
              }}
            >
              <Iconify
                icon={DAY_ICONS[day] || 'solar:calendar-minimalistic-bold'}
                width={18}
                sx={{ color: isOpen ? 'primary.main' : 'text.disabled' }}
              />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {t(day)}
                </Typography>
                {hasError && (
                  <Iconify icon="solar:danger-triangle-bold" width={15} sx={{ color: 'error.main' }} />
                )}
              </Stack>
              {!isOpen && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {t('unavailable')}
                </Typography>
              )}
              {isOpen && breaks.length > 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('breaksCount', { count: breaks.length })}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              size="small"
              label={isOpen ? t('open') : t('closed')}
              sx={{
                fontWeight: 700,
                fontSize: 11,
                height: 24,
                pointerEvents: 'none',
                ...(isOpen
                  ? {
                    bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.12),
                    color: 'success.dark',
                    border: '1px solid',
                    borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.28),
                  }
                  : {
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.1),
                    color: 'text.disabled',
                  }),
              }}
            />
            <Switch
              checked={isOpen}
              onChange={onToggle}
              color="primary"
              size="small"
            />
          </Stack>
        </Stack>

        {isOpen && (
          <Stack spacing={2} sx={{ pl: 0.5 }}>
            <TimeRangeRow
              start={data.startTime}
              end={data.endTime}
              error={dayErrors.window}
              removable={false}
              startLabel={t('start')}
              endLabel={t('end')}
              onStartChange={(value) => onWindowChange('startTime', value)}
              onEndChange={(value) => onWindowChange('endTime', value)}
            />

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {t('breaksLabel')}
              </Typography>

              {breaks.map((brk, idx) => (
                <TimeRangeRow
                  key={idx}
                  start={brk.start}
                  end={brk.end}
                  error={dayErrors.breaks?.[idx]}
                  removable
                  startLabel={t('breakStart')}
                  endLabel={t('breakEnd')}
                  onStartChange={(value) => onBreakChange(idx, 'start', value)}
                  onEndChange={(value) => onBreakChange(idx, 'end', value)}
                  onRemove={() => onRemoveBreak(idx)}
                />
              ))}

              <Button
                size="small"
                color="primary"
                variant="outlined"
                startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                onClick={onAddBreak}
                sx={{
                  alignSelf: 'flex-start',
                  borderStyle: 'dashed',
                  borderRadius: 1.5,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {t('addBreak')}
              </Button>
            </Stack>
          </Stack>
        )}

        {!isOpen && (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              py: 2,
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.06),
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Iconify icon="solar:moon-sleep-bold" width={24} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              {t('notAvailableThisDay')}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
