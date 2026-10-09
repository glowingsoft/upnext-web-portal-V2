import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';
import { MONTH_LABELS } from 'src/utils/schedule-format';

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function AnalyticsPerformanceChart({ data = [], loading = false }) {
  const theme = useTheme();
  const { t } = useTranslate();

  const sortedPoints = useMemo(
    () => [...(data || [])].sort((a, b) => a.year - b.year || a.month - b.month),
    [data]
  );

  const categories = sortedPoints.map((point) => MONTH_LABELS[MONTH_KEYS[point.month - 1]] || point.month);
  const series = [{ name: t('revenue'), data: sortedPoints.map((point) => point.total ?? 0) }];

  const chartOptions = useChart({
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.primary.main],
    stroke: { show: false },
    fill: { type: 'solid', opacity: 1 },
    plotOptions: { bar: { borderRadius: 6, columnWidth: sortedPoints.length <= 4 ? '28%' : '55%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        // Values here are dollars over a narrow range, so rounding to whole numbers can make
        // several auto-generated ticks collapse onto the same displayed integer.
        formatter: (val) => fCurrency(val),
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
    },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    tooltip: {
      y: {
        formatter: (val) => fCurrency(val),
      },
    },
  });

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {t('revenueByMonth', { defaultValue: 'Revenue by month' })}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        {t('revenueByMonthSubheader', { defaultValue: 'Total earned in each month with bookings' })}
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
      ) : sortedPoints.length > 0 ? (
        <Chart type="bar" series={series} options={chartOptions} height={280} />
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
          {t('noDataAvailable')}
        </Typography>
      )}
    </Card>
  );
}
