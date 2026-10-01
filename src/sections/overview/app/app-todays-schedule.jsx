import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslate } from 'src/locales/use-locales';
import { BOOKING_STATUS_LABEL_KEYS } from 'src/utils/schedule-format';

const STATUS_CHIP_SX = {
  completed: { bgcolor: 'rgba(59, 130, 246, 0.14)', color: '#1e40af', fontWeight: 600 },
  ongoing: { bgcolor: 'rgba(245, 158, 11, 0.18)', color: '#c2410c', fontWeight: 600 },
  scheduled: { bgcolor: 'rgba(139, 92, 246, 0.14)', color: '#5b21b6', fontWeight: 600 },
};

// ----------------------------------------------------------------------

export function AppTodaysSchedule({ appointments = [], onViewCalendar, sx, ...other }) {
  const { t } = useTranslate();
  const list = Array.isArray(appointments) ? appointments : [];

  return (
    <Card {...other} sx={[{ p: 3, height: 1, width: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }, ...(sx ? [sx] : [])]}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, flexShrink: 0 }}>
        <Box>
          <Typography variant="h6">{t('todaysSchedule')}</Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onViewCalendar}
          endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
          sx={{
            px: 1.25,
            height: 34,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            color: '#a58b67',
            borderColor: 'rgba(165, 139, 103, 0.35)',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: 'rgba(165, 139, 103, 0.55)',
              bgcolor: 'rgba(165, 139, 103, 0.06)',
            },
          }}
        >
          {t('viewCalendar')}
        </Button>
      </Stack>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:calendar-mark-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noAppointmentsToday')}
          </Typography>
        </Box>
      ) : (
        <Scrollbar
          sx={{ flex: 1, minHeight: 0 }}
          slotProps={{
            content: { paddingBottom: '8px' },
          }}
        >
          <Stack spacing={1.2}>
            {list.map((row) => (
            <Stack key={row.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Box sx={{ minWidth: 48 }}>
                <Typography variant="subtitle2">{row.time}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.meridiem}
                </Typography>
              </Box>

              <Box sx={{ width: 3.5, borderRadius: 99, bgcolor: row.accent, alignSelf: 'stretch' }} />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: '100%' }}>
                    {row.title}
                  </Typography>
                  <Chip
                    label={t(BOOKING_STATUS_LABEL_KEYS[row.statusKey] || row.statusKey)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      ...(STATUS_CHIP_SX[row.statusKey] || { fontWeight: 600 }),
                      cursor: 'default',
                      '&:hover': {
                        ...(STATUS_CHIP_SX[row.statusKey] || { fontWeight: 600 }),
                      },
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  {row.location} · {row.price}
                </Typography>
              </Box>

              <Avatar src={row.avatar} sx={{ width: 32, height: 32, bgcolor: row.accent, fontSize: 12, flexShrink: 0 }}>{row.initials}</Avatar>
            </Stack>
            ))}
          </Stack>
        </Scrollbar>
      )}
    </Card>
  );
}
