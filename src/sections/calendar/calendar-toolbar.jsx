import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', labelKey: 'month' },
  { value: 'timeGridWeek', labelKey: 'week' },
  { value: 'timeGridDay', labelKey: 'day' },
];

// ----------------------------------------------------------------------

export function CalendarToolbar({ date, view, loading, onToday, onNextDate, onPrevDate, onChangeView }) {
  const { t } = useTranslate();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      sx={{ px: 2.5, py: 2, gap: 1.5, position: 'relative' }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
        <IconButton size="small" onClick={onPrevDate} aria-label={t('previous')}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <IconButton size="small" onClick={onNextDate} aria-label={t('next')}>
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>

        <Typography variant="h6" noWrap sx={{ pl: 0.5 }}>
          {date}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, newView) => {
            if (newView) onChangeView(newView);
          }}
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontWeight: 600,
              textTransform: 'none',
              '&.Mui-selected': {
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          {VIEW_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {t(option.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button size="small" color="primary" variant="outlined" onClick={onToday}>
          {t('today')}
        </Button>
      </Stack>

      {loading && (
        <LinearProgress
          color="inherit"
          sx={{ left: 0, width: 1, height: 2, bottom: 0, borderRadius: 0, position: 'absolute' }}
        />
      )}
    </Stack>
  );
}
