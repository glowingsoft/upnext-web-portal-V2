import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
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
import { RevenueMetricCard } from './components/revenue-metric-card';

function toMajor(amountMinor) {
  return (amountMinor ?? 0) / 100;
}

function formatMoney(amountMinor, currency) {
  return fCurrency(toMajor(amountMinor), { currency: (currency || 'usd').toUpperCase() });
}

function formatChangePercent(changePercent) {
  const rounded = Math.round(changePercent ?? 0);
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
    { value: '7d', label: t('days7Label') },
    { value: '30d', label: t('days30Label') },
    { value: '90d', label: t('days90Label') },
    { value: '1y', label: t('year1Label') },
  ];

  const revenueMetrics = useMemo(() => {
    if (!revenue) return [];

    const grossMinor = revenue.grossRevenue?.amountMinor ?? 0;
    const netMinor = revenue.netEarned?.amountMinor ?? 0;
    const platformFeeMinor = Math.max(0, grossMinor - netMinor);
    const platformFeePercent = grossMinor > 0 ? Math.round((platformFeeMinor / grossMinor) * 100) : 0;

    return [
      {
        id: 'grossRevenue',
        title: t('grossRevenue'),
        subtitle: t('lastMonth'),
        value: formatMoney(grossMinor, revenue.grossRevenue?.currency),
        change: formatChangePercent(revenue.grossRevenue?.changePercent),
        trend: (revenue.grossRevenue?.changePercent ?? 0) >= 0 ? 'up' : 'down',
        icon: 'solar:chart-2-bold',
      },
      {
        id: 'platformFee',
        title: t('platformFee'),
        subtitle: t('perTransaction'),
        value: `-${formatMoney(platformFeeMinor, revenue.grossRevenue?.currency)}`,
        change: `${platformFeePercent}%`,
        trend: 'neutral',
        icon: 'solar:hand-money-bold',
        valueColor: 'error.main',
      },
      {
        id: 'netEarned',
        title: t('netEarned'),
        subtitle: t('lastMonth'),
        value: formatMoney(netMinor, revenue.netEarned?.currency),
        change: formatChangePercent(revenue.netEarned?.changePercent),
        trend: (revenue.netEarned?.changePercent ?? 0) >= 0 ? 'up' : 'down',
        icon: 'solar:wallet-money-bold',
      },
      {
        id: 'pendingPayout',
        title: t('pendingPayout'),
        subtitle: t('processing'),
        value: formatMoney(revenue.pendingPayout?.amountMinor, revenue.pendingPayout?.currency),
        change: revenue.pendingPayout?.etaBusinessDays ? t('businessDaysEta', { days: revenue.pendingPayout.etaBusinessDays }) : '-',
        trend: 'neutral',
        icon: 'solar:hand-money-bold',
      },
    ];
  }, [revenue, t]);

  const revenueClients = useMemo(() => aggregateClients(revenue?.perClient), [revenue]);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Stack spacing={1.5} sx={{ mb: { xs: 2, md: 3 } }}>
        <CustomBreadcrumbs
          heading={t('revenue')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('analytics'), href: paths.dashboard.appSettings.analytics },
            { name: t('revenue') },
          ]}
          sx={{ mb: 0 }}
        />

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
            renderValue={(val) => revenuePeriodOptions.find((option) => option.value === val)?.label ?? val}
          >
            {revenuePeriodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Stack>

      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} xs={12} sm={6}>
                  <Skeleton variant="rounded" height={148} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : revenueMetrics.map((metric) => (
                <Grid key={metric.id} xs={12} sm={6}>
                  <RevenueMetricCard {...metric} />
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
