import { useEffect, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { useGetUserProfileQuery, useUpdateBusinessOperatingHoursMutation } from 'src/store/Reducer/auth';
import { OPERATING_DAYS, validateOperatingHoursWindows } from 'src/utils/operating-hours';

import { DayCard } from './components/operating-hours-day-card';

// ----------------------------------------------------------------------

const DAY_SHORT_TO_KEY = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday',
  Thu: 'thursday', Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};

const DAY_KEY_TO_SHORT = Object.fromEntries(Object.entries(DAY_SHORT_TO_KEY).map(([k, v]) => [v, k]));

function buildDefaultHours() {
  return OPERATING_DAYS.reduce((acc, day) => {
    acc[day] = { enabled: true, startTime: '09:00', endTime: '22:00', breaks: [] };
    return acc;
  }, {});
}

// ----------------------------------------------------------------------

export function OperatingHoursEditView() {
  const { t } = useTranslate();
  const router = useRouter();
  const { data: profileData, isLoading } = useGetUserProfileQuery();
  const [updateOperatingHours, { isLoading: isSaving }] = useUpdateBusinessOperatingHoursMutation();

  const [hours, setHours] = useState(buildDefaultHours());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors(validateOperatingHoursWindows(hours));
  }, [hours]);

  useEffect(() => {
    const apiHours = profileData?.data?.profile?.operatingHours;
    if (!apiHours?.length) return;

    const mapped = apiHours.reduce((acc, day) => {
      const key = DAY_SHORT_TO_KEY[day.dayOfWeek];
      if (!key) return acc;
      acc[key] = {
        enabled: day.isOpen,
        startTime: day.isOpen ? day.startTime || '09:00' : '09:00',
        endTime: day.isOpen ? day.endTime || '22:00' : '22:00',
        breaks: day.isOpen ? day.breaks || [] : [],
      };
      return acc;
    }, {});

    setHours((prev) => ({ ...prev, ...mapped }));
  }, [profileData]);

  const handleToggle = (day) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  };

  const handleWindowChange = (day, field, value) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleAddBreak = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], breaks: [...(prev[day].breaks || []), { start: '13:00', end: '14:00' }] },
    }));
  };

  const handleBreakChange = (day, index, field, value) => {
    setHours((prev) => {
      const breaks = (prev[day].breaks || []).map((brk, i) => (i === index ? { ...brk, [field]: value } : brk));
      return { ...prev, [day]: { ...prev[day], breaks } };
    });
  };

  const handleRemoveBreak = (day, index) => {
    setHours((prev) => {
      const breaks = (prev[day].breaks || []).filter((_, i) => i !== index);
      return { ...prev, [day]: { ...prev[day], breaks } };
    });
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    try {
      const operatingHours = OPERATING_DAYS.map((day) => {
        const dayData = hours[day];
        if (!dayData.enabled) {
          return { dayOfWeek: DAY_KEY_TO_SHORT[day], isOpen: false, breaks: [] };
        }
        return {
          dayOfWeek: DAY_KEY_TO_SHORT[day],
          isOpen: true,
          startTime: dayData.startTime,
          endTime: dayData.endTime,
          breaks: dayData.breaks || [],
        };
      });

      await updateOperatingHours({ operatingHours }).unwrap();
      toast.success(t('operatingHoursUpdatedSuccessfully'));
      router.push(paths.dashboard.businessProfile);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('somethingWentWrongTryAgain'));
    }
  };

  const openDaysCount = OPERATING_DAYS.filter((d) => hours[d]?.enabled).length;

  if (isLoading) {
    return (
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={320} height={24} sx={{ mb: 5 }} />

        <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%' }}>
          {/* Summary banner skeleton */}
          <Skeleton variant="rounded" width="100%" height={72} sx={{ borderRadius: 2.5, mb: 3 }} />

          {/* Day cards grid skeleton */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={130} sx={{ borderRadius: 2.5 }} />
            ))}
          </Box>

          {/* Action bar skeleton */}
          <Skeleton variant="rounded" width="100%" height={64} sx={{ borderRadius: 2.5 }} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('editOperatingHours')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('businessProfile'), href: paths.dashboard.businessProfile },
          { name: t('operatingHours') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%' }}>
        {/* Summary banner */}
        <Card
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
            border: '1px solid',
            borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.2),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:clock-circle-bold" width={22} sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {t('weeklySchedule')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('operatingHoursSummary', { open: openDaysCount, total: OPERATING_DAYS.length })}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Day cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {OPERATING_DAYS.map((day) => (
            <DayCard
              key={day}
              day={day}
              data={hours[day]}
              errors={errors[day]}
              onToggle={() => handleToggle(day)}
              onWindowChange={(field, val) => handleWindowChange(day, field, val)}
              onAddBreak={() => handleAddBreak(day)}
              onBreakChange={(idx, field, val) => handleBreakChange(day, idx, field, val)}
              onRemoveBreak={(idx) => handleRemoveBreak(day, idx)}
            />
          ))}
        </Box>

        {/* Actions */}
        <Card sx={{ p: 2.5, borderRadius: 2.5 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push(paths.dashboard.businessProfile)}
            >
              {t('cancel')}
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isSaving}
              disabled={Object.keys(errors).length > 0}
              onClick={handleSave}
              startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
            >
              {t('saveChanges')}
            </LoadingButton>
          </Stack>
        </Card>
      </Box>
    </DashboardContent>
  );
}
