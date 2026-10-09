import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useNavigate } from 'react-router-dom';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { getInitials } from 'src/utils/schedule-format';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { useGetBusinessRevenueQuery } from 'src/store/Reducer/auth';

import { RevenueBoostBanner } from './components/revenue-boost-banner';
import { RevenueClientList } from './components/revenue-client-list';
import { AnalyticsMetricCard } from '../analytics-view/components/analytics-metric-card';

function toMajor(amountMinor) {
  return (amountMinor ?? 0) / 100;
}

function formatMoney(amountMinor, currency) {
  return fCurrency(toMajor(amountMinor), { currency: (currency || 'usd').toUpperCase() });
}

function formatChangePercent(changePercent, current) {
  if (changePercent == null || !Number(current)) return '';
  const rounded = Math.round(changePercent);
  return rounded >= 0 ? `▲ ${rounded}%` : `▼ ${Math.abs(rounded)}%`;
}

// The API returns individual booking transactions (perClient), not pre-aggregated totals —
// group them by customer so each row reflects one client's overall contribution, matching what
// this "Per Customer" list is meant to show.
function aggregateClients(perClient = []) {
  const byCustomer = new Map();

  perClient.forEach((entry) => {
    const customerId = entry.customer?.id;
    if (!customerId) return;

    const existing = byCustomer.get(customerId);
    const amountMajor = toMajor(entry.amountMinor);

    if (!existing) {
      byCustomer.set(customerId, {
        id: customerId,
        name: entry.customer?.name || '',
        avatar: normalizeImageUrl(entry.customer?.profileImage),
        lastService: entry.target?.name || '',
        lastServiceDate: entry.date,
        totalMajor: amountMajor,
        currency: entry.currency,
      });
      return;
    }

    existing.totalMajor += amountMajor;
    if (entry.date && (!existing.lastServiceDate || new Date(entry.date) > new Date(existing.lastServiceDate))) {
      existing.lastService = entry.target?.name || existing.lastService;
      existing.lastServiceDate = entry.date;
    }
  });

  return [...byCustomer.values()]
    .sort((a, b) => b.totalMajor - a.totalMajor)
    .slice(0, 5)
    .map((client) => ({
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      initials: getInitials(client.name),
      lastService: client.lastService,
      amount: `+${fCurrency(client.totalMajor, { currency: (client.currency || 'usd').toUpperCase() })}`,
    }));
}

export function RevenueView() {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [period, setPeriod] = useState('90d');

  const { data, isLoading, isFetching } = useGetBusinessRevenueQuery(period);
  const revenue = data?.data;
  const loading = isLoading || isFetching;

  const revenuePeriodOptions = [
    { value: '7d', label: t('days7Label'), days: 7 },
    { value: '30d', label: t('days30Label'), days: 30 },
    { value: '90d', label: t('days90Label'), days: 90 },
    { value: '1y', label: t('year1Label') },
  ];
  const periodDays = revenuePeriodOptions.find((option) => option.value === period)?.days;
  const compareLabel = periodDays
    ? t('vsPreviousDays', { count: periodDays, defaultValue: 'vs previous {{count}} days' })
    : t('vsPreviousYear', { defaultValue: 'vs previous year' });

  const revenueMetrics = useMemo(() => {
    if (!revenue) return [];

    const grossMinor = revenue.grossRevenue?.amountMinor ?? 0;
    const netMinor = revenue.netEarned?.amountMinor ?? 0;
    const payoutStatus = revenue.pendingPayout?.status;

    return [
      {
        id: 'grossRevenue',
        label: t('grossRevenue'),
        compareLabel,
        value: formatMoney(grossMinor, revenue.grossRevenue?.currency),
        change: formatChangePercent(revenue.grossRevenue?.changePercent, grossMinor),
        trend: (revenue.grossRevenue?.changePercent ?? 0) >= 0 ? 'up' : 'down',
        icon: 'solar:chart-2-bold',
        color: 'info',
      },
      {
        id: 'netEarned',
        label: t('netEarned'),
        compareLabel,
        value: formatMoney(netMinor, revenue.netEarned?.currency),
        change: formatChangePercent(revenue.netEarned?.changePercent, netMinor),
        trend: (revenue.netEarned?.changePercent ?? 0) >= 0 ? 'up' : 'down',
        icon: 'solar:wallet-money-bold',
        color: 'success',
      },
      {
        id: 'availableToWithdraw',
        label: t('availableToWithdraw', { defaultValue: 'Available to withdraw' }),
        value: formatMoney(revenue.availableToWithdraw?.amountMinor, revenue.availableToWithdraw?.currency),
        trend: 'neutral',
        icon: 'solar:hand-money-bold',
        color: 'primary',
      },
      {
        id: 'pendingPayout',
        label: t('pendingPayout'),
        compareLabel: payoutStatus ? t(payoutStatus, { defaultValue: payoutStatus.charAt(0).toUpperCase() + payoutStatus.slice(1) }) : undefined,
        value: formatMoney(revenue.pendingPayout?.amountMinor, revenue.pendingPayout?.currency),
        change: revenue.pendingPayout?.etaBusinessDays ? t('businessDaysEta', { days: revenue.pendingPayout.etaBusinessDays }) : '',
        trend: 'neutral',
        icon: 'solar:clock-circle-bold',
        color: 'warning',
      },
    ];
  }, [revenue, t, compareLabel]);

  const revenueClients = useMemo(() => aggregateClients(revenue?.perClient), [revenue]);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <CustomBreadcrumbs
          heading={t('revenue')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('analytics'), href: paths.dashboard.appSettings.analytics },
            { name: t('revenue') },
          ]}
          sx={{ mb: 0, flex: 1, minWidth: 0 }}
        />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={period}
          onChange={(_, value) => {
            if (value) setPeriod(value);
          }}
          sx={{
            flexShrink: 0,
            bgcolor: 'background.paper',
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontWeight: 700,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&.Mui-selected': { color: 'primary.contrastText', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } },
            },
          }}
        >
          {revenuePeriodOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={2.5}>
        <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} xs={6} md={3}>
                  <Skeleton variant="rounded" height={112} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : revenueMetrics.map((metric) => (
                <Grid key={metric.id} xs={6} md={3}>
                  <AnalyticsMetricCard {...metric} />
                </Grid>
              ))}
        </Grid>

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t('perCustomer')}
            </Typography>
          </Stack>

          {loading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : (
            <RevenueClientList clients={revenueClients} />
          )}
        </Box>

        <RevenueBoostBanner onLearnMore={() => navigate(paths.dashboard.boostVisibility)} />
      </Stack>
    </DashboardContent>
  );
}
