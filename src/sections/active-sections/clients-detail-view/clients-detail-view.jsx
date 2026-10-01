import { Alert, Box, Button, Card, Chip, Container, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { useGetCustomerByIdQuery } from 'src/store/Reducer/customers-api';

import ClientBookingsTab from './components/ClientBookingsTab';
import ClientProfileTab from './components/ClientProfileTab';
import { varAlpha } from 'src/theme/styles';

const STATUS_COLOR = { active: 'success', pending: 'warning', suspended: 'error', inactive: 'default' };

function getAvatarSrc(url) {
  if (!url || typeof url !== 'string') return undefined;
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  const secondHttpIndex = trimmed.indexOf('http', trimmed.indexOf('http') + 1);
  if (secondHttpIndex > 0) {
    trimmed = trimmed.slice(secondHttpIndex);
  }

  if (/\/$/.test(trimmed) || /noimg/i.test(trimmed)) return undefined;
  return trimmed;
}

function mapCustomerApiData(raw) {
  return {
    _id: raw._id,
    name: raw.name,
    email: raw.email,
    phone: raw.phoneNumber,
    avatar: getAvatarSrc(raw.profileIcon),
    status: raw.status,
    totalBookings: raw.totalBookings,
    createdAt: raw.joiningDate,
    location: raw.location,
    preferredCategory: Array.isArray(raw.preferredCategory) ? raw.preferredCategory : raw.preferredCategory ? [raw.preferredCategory] : [],
    preferredServiceType: raw.preferredServiceType,
    importantNote: raw.description,
    preferredBookingTime: raw.preferredBookingTime,
    bookingHabit: raw.bookingStyle,
    travelDistance: raw.travelDistance,
    bookingFrequency: raw.bookingFrequency,
  };
}

function ClientDetailSkeleton() {
  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Skeleton variant="rounded" width={90} height={34} />
        </Box>

        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
          <Box sx={{ position: 'relative', minHeight: 80, px: 3, py: 2, pl: { xs: 18, md: 22 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton
              variant="rounded"
              width={104}
              height={104}
              sx={{ position: 'absolute', left: { xs: 20, md: 40 }, top: { xs: -24, md: -30 }, borderRadius: 2.5, border: 'solid 4px #fff', flexShrink: 0 }}
            />
            <Box>
              <Skeleton variant="text" width={200} height={34} />
              <Skeleton variant="text" width={100} height={20} sx={{ mt: 0.3 }} />
            </Box>
            <Skeleton variant="rounded" width={90} height={28} sx={{ ml: 'auto', borderRadius: 999 }} />
          </Box>
          <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider', py: 1.5 }}>
            <Stack direction="row" spacing={0}>
              {[100, 100].map((w, i) => (
                <Skeleton key={i} variant="text" width={w} height={36} sx={{ mx: 2.5 }} />
              ))}
            </Stack>
          </Box>
        </Card>

        <Card sx={{ borderRadius: 2, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}

export default function ClientsDetailView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('profile');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const { data, isLoading, isFetching, isError } = useGetCustomerByIdQuery(id, { skip: !id });

  const client = useMemo(() => (data?.data ? mapCustomerApiData(data.data) : null), [data]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [client?.avatar]);

  const tabs = [
    { value: 'profile', label: t('profile'), icon: 'solar:user-id-bold' },
    { value: 'booking', label: t('bookings'), icon: 'solar:calendar-bold' },
  ];

  if (isLoading || isFetching) {
    return <ClientDetailSkeleton />;
  }

  if (isError || !client) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="warning">{t('customerNotFound', { defaultValue: 'Customer not found' })}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Button
            startIcon={<Iconify width={16} height={16} sx={{ fontWeight: 800 }} icon="solar:alt-arrow-left-linear" />}
            onClick={() => router.back()}
            sx={{ color: 'text.primary', fontWeight: 800 }}
          >
            {t('back')}
          </Button>
        </Box>

        {/* ── Cover-banner card ── */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {/* Cover — static warm gradient, matches service/package/promotion detail pages */}
          <Box
            sx={{
              height: { xs: 160, md: 200 },
              position: 'relative',
              background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          />

          {/* Info Bar */}
          <Box
            sx={{
              position: 'relative',
              minHeight: 80,
              px: { xs: 2.5, md: 3 },
              py: 2,
              pl: { xs: 18, md: 22 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Rounded rectangle avatar overlapping cover */}
            <Box
              sx={{
                position: 'absolute',
                left: { xs: 20, md: 40 },
                top: { xs: -24, md: -30 },
                zIndex: 5,
                width: { xs: 88, md: 104 },
                height: { xs: 88, md: 104 },
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '4px solid #fff',
                bgcolor: '#eadfc8',
                boxShadow: (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.28)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {client.avatar && !avatarLoadFailed ? (
                <Box
                  component="img"
                  src={client.avatar}
                  alt={client.name}
                  onError={() => setAvatarLoadFailed(true)}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Iconify icon="solar:user-rounded-bold" width={36} sx={{ color: '#b79a73' }} />
              )}
            </Box>

            {/* Name + subtitle */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
                {client.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {t('customer')}
              </Typography>
            </Box>

            {/* Status chip on right */}
            <Chip
              size="small"
              variant="soft"
              color={STATUS_COLOR[client.status] || 'default'}
              label={client.status}
              sx={{ ml: 'auto', flexShrink: 0, fontWeight: 700, textTransform: 'capitalize' }}
            />
          </Box>

          {/* Tabs Bar */}
          <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={currentTab}
              onChange={(_, nextTab) => setCurrentTab(nextTab)}
              sx={{ minHeight: 56, '& .MuiTabs-indicator': { height: 2, borderRadius: 2, bgcolor: 'primary.main' } }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={18} />}
                  iconPosition="start"
                  sx={{
                    minHeight: 56,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 0,
                    mx: 2.5,
                    minWidth: 'auto',
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                    '&.Mui-selected': { color: 'primary.main' },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Card>

        {currentTab === 'profile' && <ClientProfileTab client={client} />}
        {currentTab === 'booking' && <ClientBookingsTab client={client} />}
      </Stack>
    </Container>
  );
}
