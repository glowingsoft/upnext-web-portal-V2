import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { formatOperatingTime, getOperatingHours, OPERATING_DAYS } from 'src/utils/operating-hours';
import { useGetBusinessOperatingHoursQuery, useGetBusinessOperatingHoursPublicQuery } from 'src/store/Reducer/businesses-api';
import ProviderOperatingHoursEditDialog from './ProviderOperatingHoursEditDialog';

const CREAM = '#ffffff';
const CREAM_DEEP = '#ffffff';
const ACCENT = '#b79a73';
const ACCENT_DARK = '#8a6b47';
const INK = '#1f120a';

const DAY_ICON = 'solar:calendar-minimalistic-bold';
const PROVIDER_USER_TYPES = new Set(['provider', 'business']);
const DAY_SHORT_TO_KEY = { Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday', Fri: 'friday', Sat: 'saturday', Sun: 'sunday' };

function getTodayKey() {
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return keys[new Date().getDay()];
}

function mapApiOperatingHours(raw) {
  const list = Array.isArray(raw) ? raw : raw?.operatingHours || raw?.slots || [];
  return list.reduce((acc, day) => {
    const key = DAY_SHORT_TO_KEY[day.dayOfWeek];
    if (!key) return acc;
    acc[key] = {
      enabled: Boolean(day.isOpen),
      startTime: day.isOpen ? day.startTime : null,
      endTime: day.isOpen ? day.endTime : null,
      breaks: day.isOpen ? day.breaks || [] : [],
    };
    return acc;
  }, {});
}

function TimePill({ label, value, variant = 'start' }) {
  const isStart = variant === 'start';

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: CREAM,
        border: '1px solid',
        borderColor: varAlpha('183 154 115', 0.28),
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
        <Iconify
          icon={isStart ? 'solar:clock-circle-bold' : 'solar:history-bold'}
          width={14}
          sx={{ color: ACCENT }}
        />
        <Typography
          variant="caption"
          sx={{
            color: ACCENT_DARK,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            fontSize: 10.5,
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="h6"
        sx={{
          color: INK,
          fontWeight: 800,
          fontSize: { xs: '1.15rem', md: '1.25rem' },
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

TimePill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['start', 'end']),
};

function WindowRow({ startLabel, endLabel, startTime, endTime }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <TimePill label={startLabel} value={formatOperatingTime(startTime)} variant="start" />
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: CREAM_DEEP,
          border: '1px solid',
          borderColor: varAlpha('183 154 115', 0.35),
        }}
      >
        <Iconify icon="solar:arrow-right-linear" width={18} sx={{ color: ACCENT_DARK }} />
      </Box>
      <TimePill label={endLabel} value={formatOperatingTime(endTime)} variant="end" />
    </Stack>
  );
}

WindowRow.propTypes = {
  startLabel: PropTypes.string.isRequired,
  endLabel: PropTypes.string.isRequired,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
};

function DayScheduleCard({ dayKey, dayLabel, startTime, endTime, breaks, closedLabel, startLabel, endLabel, isToday }) {
  const { t } = useTranslate();
  const isOpen = Boolean(startTime && endTime);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: isToday ? varAlpha('183 154 115', 0.55) : 'divider',
        bgcolor: 'background.paper',
        boxShadow: isToday
          ? (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.1)}`
          : (theme) => `0 4px 16px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.04)}`,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 14px 32px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.1)}`,
          borderColor: varAlpha('183 154 115', 0.4),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: isToday ? 'primary.main' : isOpen ? ACCENT : 'grey.400',
          opacity: isToday ? 1 : isOpen ? 0.85 : 0.35,
        },
      }}
    >
      <Stack spacing={2} sx={{ p: { xs: 2, md: 2.25 }, pl: { xs: 2.5, md: 2.75 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: CREAM,
                border: '1px solid',
                borderColor: varAlpha('183 154 115', 0.22),
              }}
            >
              <Iconify icon={DAY_ICON} width={20} sx={{ color: ACCENT_DARK }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: INK, lineHeight: 1.2 }}>
                {dayLabel}
              </Typography>
            </Box>
          </Stack>

          <Chip
            size="small"
            label={isOpen ? t('open') : closedLabel}
            sx={{
              fontWeight: 700,
              fontSize: 11,
              height: 26,
              flexShrink: 0,
              pointerEvents: 'none',
              ...(isOpen
                ? {
                  bgcolor: varAlpha('34 197 94', 0.12),
                  color: '#15803d',
                  border: '1px solid',
                  borderColor: varAlpha('34 197 94', 0.28),
                }
                : {
                  bgcolor: 'grey.100',
                  color: 'text.disabled',
                }),
            }}
          />
        </Stack>

        {!isOpen ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              py: 2.5,
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.06),
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Iconify icon="solar:moon-sleep-bold" width={28} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              {closedLabel}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <WindowRow startLabel={startLabel} endLabel={endLabel} startTime={startTime} endTime={endTime} />

            {breaks?.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {breaks.map((brk, index) => (
                  <Chip
                    key={`${brk.start}-${brk.end}-${index}`}
                    size="small"
                    icon={<Iconify icon="solar:cup-hot-bold" width={14} />}
                    label={`${formatOperatingTime(brk.start)} – ${formatOperatingTime(brk.end)}`}
                    sx={{
                      fontWeight: 600,
                      fontSize: 11,
                      pointerEvents: 'none',
                      bgcolor: varAlpha('183 154 115', 0.1),
                      color: ACCENT_DARK,
                      border: '1px solid',
                      borderColor: varAlpha('183 154 115', 0.24),
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

DayScheduleCard.propTypes = {
  dayKey: PropTypes.string.isRequired,
  dayLabel: PropTypes.string.isRequired,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  breaks: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    })
  ),
  closedLabel: PropTypes.string.isRequired,
  startLabel: PropTypes.string.isRequired,
  endLabel: PropTypes.string.isRequired,
  isToday: PropTypes.bool,
};

// ----------------------------------------------------------------------

export default function ProviderOperatingHoursTab({ provider, isPublicView = false }) {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const canEditHours = PROVIDER_USER_TYPES.has(userType);
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const businessId = provider?._id || provider?.businessProfileId;
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: hoursData, isFetching: hoursFetching } = useGetBusinessOperatingHoursQuery(businessId, {
    skip: !businessId || !isAdminRoute,
  });
  const { data: publicHoursData, isFetching: publicHoursFetching } = useGetBusinessOperatingHoursPublicQuery(businessId, {
    skip: !businessId || !isPublicView,
  });

  const apiOperatingHours = useMemo(() => mapApiOperatingHours(hoursData?.data), [hoursData]);
  const publicOperatingHours = useMemo(() => mapApiOperatingHours(publicHoursData?.data), [publicHoursData]);
  const operatingHours = isAdminRoute ? apiOperatingHours : isPublicView ? publicOperatingHours : getOperatingHours(provider);
  const todayKey = getTodayKey();

  if ((isAdminRoute && hoursFetching) || (isPublicView && publicHoursFetching)) {
    return (
      <Card sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Grid container spacing={2}>
            {OPERATING_DAYS.map((day) => (
              <Grid item key={day} xs={12} md={6}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2.5 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    );
  }

  const startLabel = t('startTime');
  const endLabel = t('endTime');
  const closedLabel = t('closed');

  const openDaysCount = OPERATING_DAYS.filter((day) => operatingHours?.[day]?.enabled).length;

  return (
    <Card
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => `0 8px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.06)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 }, pb: 1 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('weeklySchedule')}
        </Typography>
        {(canEditHours || isAdminRoute) && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-bold" width={16} />}
            onClick={() => (isAdminRoute ? setEditDialogOpen(true) : router.push(paths.dashboard.operatingHoursEdit))}
          >
            {t('editHours')}
          </Button>
        )}
      </Stack>

      <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04) }}>
        <Grid container spacing={2}>
          {OPERATING_DAYS.map((day) => {
            const dayData = operatingHours?.[day];

            return (
              <Grid item key={day} xs={12} md={6}>
                <DayScheduleCard
                  dayKey={day}
                  dayLabel={t(day)}
                  startTime={dayData?.enabled ? dayData.startTime : null}
                  endTime={dayData?.enabled ? dayData.endTime : null}
                  breaks={dayData?.enabled ? dayData.breaks : []}
                  closedLabel={closedLabel}
                  startLabel={startLabel}
                  endLabel={endLabel}
                  isToday={day === todayKey}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {isAdminRoute && (
        <ProviderOperatingHoursEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          businessId={businessId}
          initialHours={operatingHours}
        />
      )}
    </Card>
  );
}

ProviderOperatingHoursTab.propTypes = {
  provider: PropTypes.object.isRequired,
  isPublicView: PropTypes.bool,
};
