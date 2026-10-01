import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from 'src/store/Reducer/auth';

const SHARED_NOTIFICATION_OPTIONS = [
  {
    key: 'emailNotifications',
    titleKey: 'notificationEmailTitle',
    descriptionKey: 'notificationEmailDescription',
  },
  {
    key: 'pushNotifications',
    titleKey: 'notificationPushTitle',
    descriptionKey: 'notificationPushDescription',
  },
];

const CUSTOMER_NOTIFICATION_OPTIONS = [
  {
    key: 'bookingReminders',
    titleKey: 'notificationBookingRemindersTitle',
    descriptionKey: 'notificationBookingRemindersDescription',
  },
];

const PROVIDER_NOTIFICATION_OPTIONS = [
  {
    key: 'profileViewAlerts',
    titleKey: 'notificationProfileViewTitle',
    descriptionKey: 'notificationProfileViewDescription',
  },
  {
    key: 'messageAlerts',
    titleKey: 'notificationMessageTitle',
    descriptionKey: 'notificationMessageDescription',
  },
];

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: true,
  bookingReminders: true,
  profileViewAlerts: true,
  messageAlerts: true,
};

function getOptionLabel(item, t) {
  return item.titleKey ? t(item.titleKey) : item.title;
}

function getOptionDescription(item, t) {
  if (item.descriptionKey) return t(item.descriptionKey);
  if (item.description) return item.description;
  return null;
}

export default function UserNotification() {
  const { t } = useTranslate();
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isProvider = userType === 'provider' || userType === 'business';
  const isCustomer = userType === 'customer' || userType === 'user';
  
  const canSyncPreferences = isCustomer || isProvider;

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const notificationOptions = useMemo(() => {
    if (isProvider) {
      return [...SHARED_NOTIFICATION_OPTIONS, ...PROVIDER_NOTIFICATION_OPTIONS];
    }
    if (isCustomer) {
      return [...SHARED_NOTIFICATION_OPTIONS, ...CUSTOMER_NOTIFICATION_OPTIONS];
    }
    return SHARED_NOTIFICATION_OPTIONS;
  }, [isProvider, isCustomer]);

  const { data: preferencesData, isFetching: preferencesFetching } = useGetNotificationPreferencesQuery(undefined, {
    skip: !canSyncPreferences,
  });
  const [updateNotificationPreferences] = useUpdateNotificationPreferencesMutation();

  useEffect(() => {
    if (canSyncPreferences && preferencesData?.data) {
      setSettings((prev) => ({ ...prev, ...preferencesData.data }));
    }
  }, [canSyncPreferences, preferencesData]);

  const handleToggle = (item) => async (event) => {
    const enabled = event.target.checked;
    const title = getOptionLabel(item, t);
    const nextSettings = { ...settings, [item.key]: enabled };

    setSettings(nextSettings);

    if (canSyncPreferences) {
      const payload = notificationOptions.reduce((acc, option) => {
        acc[option.key] = nextSettings[option.key];
        return acc;
      }, {});

      try {
        await updateNotificationPreferences(payload).unwrap();
      } catch (error) {
        setSettings(settings);
        toast.error(error?.data?.message || t('somethingWentWrong'));
        return;
      }
    }

    toast.success(t(enabled ? 'notificationSettingEnabled' : 'notificationSettingDisabled', { name: title }));
  };

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('notifications')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('notifications') }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Stack spacing={2} sx={{ pb: 4 }}>
        {notificationOptions.map((item) => {
          const title = getOptionLabel(item, t);
          const description = getOptionDescription(item, t);

          return (
            <Box
              key={item.key}
              component={Card}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                borderRadius: 2,
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                cursor: 'pointer',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>

                {description ? <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{description}</Typography> : null}
              </Box>

              <Switch
                checked={!!settings[item.key]}
                onChange={handleToggle(item)}
                disabled={canSyncPreferences && preferencesFetching}
                inputProps={{ 'aria-label': title }}
              />
            </Box>
          );
        })}
      </Stack>
    </DashboardContent>
  );
}
