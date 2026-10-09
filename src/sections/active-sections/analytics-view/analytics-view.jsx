import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Unstable_Grid2';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { useGetBusinessAnalyticsQuery } from 'src/store/Reducer/auth';

import { AnalyticsMetricCard } from './components/analytics-metric-card';
import { AnalyticsPerformanceChart } from './components/analytics-performance-chart';

function formatChangePercent(changePercent, current) {
  if (changePercent == null || !Number(current)) return '';
  const rounded = Math.round(changePercent);
  return rounded >= 0 ? `▲ ${rounded}%` : `▼ ${Math.abs(rounded)}%`;
}

function getTrend(changePercent) {
  return (changePercent ?? 0) >= 0 ? 'up' : 'down';
}

export function AnalyticsView() {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [period, setPeriod] = useState('90d');

  const { data, isLoading, isFetching } = useGetBusinessAnalyticsQuery(period);
  const analytics = data?.data;
  const loading = isLoading || isFetching;

  const analyticsPeriodOptions = [
    { value: '7d', label: t('days7Label'), days: 7 },
    { value: '30d', label: t('days30Label'), days: 30 },
    { value: '90d', label: t('days90Label'), days: 90 },
  ];
  const periodDays = analyticsPeriodOptions.find((option) => option.value === period)?.days ?? 90;
  const compareLabel = t('vsPreviousDays', { count: periodDays, defaultValue: 'vs previous {{count}} days' });

  const analyticsMetrics = useMemo(() => {
    if (!analytics) return [];

    const revenueMajor = (analytics.revenue?.amountMinor ?? 0) / 100;
    const revenueCurrency = (analytics.revenue?.currency || 'usd').toUpperCase();

    return [
      {
        id: 'profileViews',
        label: t('profileViews'),
        value: String(analytics.profileViews?.count ?? 0),
        change: formatChangePercent(analytics.profileViews?.changePercent, analytics.profileViews?.count),
        trend: getTrend(analytics.profileViews?.changePercent),
        icon: 'solar:eye-bold',
        color: 'info',
      },
      {
        id: 'searchAppears',
        label: t('searchAppears'),
        value: String(analytics.searchAppearances?.count ?? 0),
        change: formatChangePercent(analytics.searchAppearances?.changePercent, analytics.searchAppearances?.count),
        trend: getTrend(analytics.searchAppearances?.changePercent),
        icon: 'eva:search-fill',
        color: 'secondary',
      },
      {
        id: 'bookingRequests',
        label: t('bookingRequests'),
        value: String(analytics.bookingRequests?.count ?? 0),
        change: formatChangePercent(analytics.bookingRequests?.changePercent, analytics.bookingRequests?.count),
        trend: getTrend(analytics.bookingRequests?.changePercent),
        icon: 'solar:calendar-bold',
        color: 'primary',
      },
      {
        id: 'conversions',
        label: t('conversions'),
        value: String(analytics.conversions?.count ?? 0),
        change: formatChangePercent(analytics.conversions?.changePercent, analytics.conversions?.count),
        trend: getTrend(analytics.conversions?.changePercent),
        icon: 'solar:chat-round-dots-bold',
        color: 'success',
      },
      {
        id: 'avgRating',
        label: t('avgRating'),
        value: Number(analytics.avgRating?.average ?? 0).toFixed(1),
        change: formatChangePercent(analytics.avgRating?.changePercent, analytics.avgRating?.average),
        trend: getTrend(analytics.avgRating?.changePercent),
        icon: 'solar:star-bold',
        color: 'warning',
      },
      {
        id: 'revenue',
        label: t('revenue'),
        value: fCurrency(revenueMajor, { currency: revenueCurrency }),
        change: formatChangePercent(analytics.revenue?.changePercent, analytics.revenue?.amountMinor),
        trend: getTrend(analytics.revenue?.changePercent),
        icon: 'solar:wallet-money-bold',
        color: 'primary',
      },
    ];
  }, [analytics, t]);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <CustomBreadcrumbs
          heading={t('analytics')}
          links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('analytics') }]}
          sx={{ mb: 0, flex: 1, minWidth: 0 }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ flexShrink: 0 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={period}
            onChange={(_, value) => {
              if (value) setPeriod(value);
            }}
            sx={{
              bgcolor: 'background.paper',
              '& .MuiToggleButton-root': {
                px: { xs: 1.25, sm: 1.5 },
                py: 0.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                '&.Mui-selected': { color: 'primary.contrastText', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } },
              },
            }}
          >
            {analyticsPeriodOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button variant="contained" color="primary" onClick={() => navigate(paths.dashboard.revenue)} sx={{ px: { xs: 1.5, sm: 2 }, fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}>
            {t('viewRevenueDashboard')}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2.5 }} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} xs={6} md={4}>
                <Skeleton variant="rounded" height={112} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : analyticsMetrics.map((metric) => (
              <Grid key={metric.id} xs={6} md={4}>
                <AnalyticsMetricCard {...metric} compareLabel={compareLabel} />
              </Grid>
            ))}
      </Grid>

      <Box>
        <AnalyticsPerformanceChart data={analytics?.performanceChart} loading={loading} />
      </Box>
    </DashboardContent>
  );
}
