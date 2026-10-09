import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { BOOKING_STATUS_LABEL_KEYS } from 'src/utils/schedule-format';
import { BOOKING_STATUS_LABEL_COLOR } from 'src/sections/calendar/utils/map-bookings-to-events';

const CLOSED_STATUSES = ['canceled', 'cancelled', 'expired'];
const MAX_ROWS = 5;

export const isClosedScheduleStatus = (statusKey) => CLOSED_STATUSES.includes(statusKey);

// ----------------------------------------------------------------------

export function AppTodaysSchedule({ appointments = [], onViewCalendar, onRowClick, sx, ...other }) {
  const { t } = useTranslate();
  const list = Array.isArray(appointments) ? appointments : [];

  const active = list.filter((row) => !isClosedScheduleStatus(row.statusKey));
  const closed = list.filter((row) => isClosedScheduleStatus(row.statusKey));

  const shownActive = active.slice(0, MAX_ROWS);
  const shownClosed = closed.slice(0, Math.max(0, MAX_ROWS - shownActive.length));
  const hiddenCount = list.length - shownActive.length - shownClosed.length;

  const renderRow = (row) => {
    const isClosed = isClosedScheduleStatus(row.statusKey);

    return (
      <Stack
        key={row.id}
        direction="row"
        alignItems="center"
        spacing={1.5}
        onClick={onRowClick ? () => onRowClick(row.id) : undefined}
        sx={{
          p: 1.25,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isClosed ? 'transparent' : 'background.paper',
          cursor: onRowClick ? 'pointer' : 'default',
          transition: (theme) => theme.transitions.create(['border-color', 'background-color'], { duration: 180 }),
          ...(onRowClick && { '&:hover': { borderColor: 'primary.main', bgcolor: 'background.neutral' } }),
        }}
      >
        <Box sx={{ minWidth: 52, textAlign: 'center', opacity: isClosed ? 0.55 : 1 }}>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
            {row.time}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.meridiem}
          </Typography>
        </Box>

        <Box sx={{ width: 3.5, borderRadius: 99, bgcolor: row.accent, alignSelf: 'stretch', opacity: isClosed ? 0.5 : 1 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ minWidth: 0, columnGap: 1, rowGap: 0.25 }}>
            <Typography variant="subtitle2" noWrap sx={{ minWidth: 0, maxWidth: 1, color: isClosed ? 'text.secondary' : 'text.primary' }}>
              {row.title}
            </Typography>
            <Label
              variant="soft"
              color={BOOKING_STATUS_LABEL_COLOR[row.statusKey === 'cancelled' ? 'canceled' : row.statusKey] || 'default'}
              sx={{ flexShrink: 0, textTransform: 'capitalize' }}
            >
              {t(BOOKING_STATUS_LABEL_KEYS[row.statusKey] || row.statusKey)}
            </Label>
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
            {row.location} · {row.price}
          </Typography>
        </Box>

        <Avatar
          src={row.avatar}
          sx={{ width: 34, height: 34, fontSize: 12, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', opacity: isClosed ? 0.6 : 1 }}
        >
          {row.initials}
        </Avatar>
      </Stack>
    );
  };

  return (
    <Card {...other} sx={[{ p: 3, height: 1, width: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }, ...(sx ? [sx] : [])]}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 2, gap: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
            {t('todaysSchedule')}
          </Typography>
          {active.length > 0 && (
            <Label variant="soft" color="primary">
              {active.length}
            </Label>
          )}
        </Stack>

        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={onViewCalendar}
          endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
          sx={{ px: 1.25, height: 34, flexShrink: 0, borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
        >
          {t('viewCalendar')}
        </Button>
      </Stack>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:calendar-mark-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noAppointmentsToday')}
          </Typography>
        </Box>
      ) : (
          <Stack spacing={1.2}>
            {active.length === 0 && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1.25, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('nothingActiveToday', { defaultValue: 'Nothing active on today’s schedule.' })}
                </Typography>
              </Stack>
            )}

            {shownActive.map(renderRow)}

            {shownClosed.length > 0 && (
              <Typography variant="overline" sx={{ pt: active.length ? 1 : 0.5, px: 0.5, color: 'text.disabled' }}>
                {t('cancelledOrExpired', { defaultValue: 'Cancelled or expired' })} · {closed.length}
              </Typography>
            )}

            {shownClosed.map(renderRow)}

            {hiddenCount > 0 && (
              <Button
                size="small"
                color="primary"
                onClick={onViewCalendar}
                endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
                sx={{ alignSelf: 'center', textTransform: 'none', fontWeight: 700 }}
              >
                {t('moreInCalendar', { count: hiddenCount, defaultValue: '+{{count}} more in calendar' })}
              </Button>
            )}
          </Stack>
      )}
    </Card>
  );
}
