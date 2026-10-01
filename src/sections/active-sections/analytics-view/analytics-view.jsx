import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
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

function formatChangePercent(changePercent) {
  if (changePercent == null) return '';
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
    { value: '7d', label: t('days7Label') },
    { value: '30d', label: t('days30Label') },
    { value: '90d', label: t('days90Label') },
  ];

  const analyticsMetrics = useMemo(() => {
    if (!analytics) return [];

    const revenueMajor = (analytics.revenue?.amountMinor ?? 0) / 100;
    const revenueCurrency = (analytics.revenue?.currency || 'usd').toUpperCase();

    return [
      {
        id: 'profileViews',
        label: t('profileViews'),
        value: String(analytics.profileViews?.count ?? 0),
        change: formatChangePercent(analytics.profileViews?.changePercent),
        trend: getTrend(analytics.profileViews?.changePercent),
        icon: 'solar:eye-bold',
      },
      {
        id: 'searchAppears',
        label: t('searchAppears'),
        value: String(analytics.searchAppearances?.count ?? 0),
        change: formatChangePercent(analytics.searchAppearances?.changePercent),
        trend: getTrend(analytics.searchAppearances?.changePercent),
        icon: 'eva:search-fill',
      },
      {
        id: 'bookingRequests',
        label: t('bookingRequests'),
        value: String(analytics.bookingRequests?.count ?? 0),
        change: formatChangePercent(analytics.bookingRequests?.changePercent),
        trend: getTrend(analytics.bookingRequests?.changePercent),
        icon: 'solar:calendar-bold',
      },
      {
        id: 'conversions',
        label: t('conversions'),
        value: String(analytics.conversions?.count ?? 0),
        change: formatChangePercent(analytics.conversions?.changePercent),
        trend: getTrend(analytics.conversions?.changePercent),
        icon: 'solar:chat-round-dots-bold',
      },
      {
        id: 'avgRating',
        label: t('avgRating'),
        value: Number(analytics.avgRating?.average ?? 0).toFixed(1),
        change: formatChangePercent(analytics.avgRating?.changePercent),
        trend: getTrend(analytics.avgRating?.changePercent),
        icon: 'solar:star-bold',
      },
      {
        id: 'revenue',
        label: t('revenue'),
        value: fCurrency(revenueMajor, { currency: revenueCurrency }),
        change: formatChangePercent(analytics.revenue?.changePercent),
        trend: getTrend(analytics.revenue?.changePercent),
        icon: 'solar:wallet-money-bold',
      },
    ];
  }, [analytics, t]);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Stack spacing={1.5} sx={{ mb: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <CustomBreadcrumbs
            heading={t('analytics')}
            links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('analytics') }]}
            sx={{ mb: 0, flex: 1, minWidth: 0 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(paths.dashboard.revenue)}
            sx={{
              py: 1.25,
              px: 2,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('viewRevenueDashboard')}
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            size="small"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            sx={{
              minWidth: 88,
              fontWeight: 700,
              bgcolor: 'background.paper',
              borderRadius: 1.5,
            }}
            renderValue={(val) => analyticsPeriodOptions.find((option) => option.value === val)?.label ?? val}
          >
            {analyticsPeriodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} xs={12} sm={6}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : analyticsMetrics.map((metric) => (
              <Grid key={metric.id} xs={12} sm={6}>
                <AnalyticsMetricCard {...metric} />
              </Grid>
            ))}
      </Grid>

      <Box>
        <AnalyticsPerformanceChart data={analytics?.performanceChart} loading={loading} />
      </Box>
    </DashboardContent>
  );
}
