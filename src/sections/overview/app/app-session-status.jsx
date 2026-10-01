import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { useTranslate } from 'src/locales/use-locales';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function AppSessionStatus({ title, subheader, chart, height = 250, ...other }) {
  const theme = useTheme();
  const { t } = useTranslate();

  const chartSeries = chart.series.map((item) => item.value);
  const hasData = chartSeries.some((value) => value > 0);

  const chartColors = chart.colors ?? [theme.palette.warning.main, theme.palette.info.main, theme.palette.primary.main, theme.palette.success.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { offsetY: -8 },
            value: { offsetY: 12 },
            total: {
              show: true,
              label: chart.totalLabel ?? t('total'),
              formatter: (w) => fNumber(chart.total ?? w?.globals?.seriesTotals?.reduce?.((a, b) => a + b, 0) ?? chartSeries.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => fNumber(value),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      {!hasData ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, textAlign: 'center' }}>
          <Iconify icon="solar:pie-chart-2-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noBookingsYet')}
          </Typography>
        </Box>
      ) : (
        <>
          <Chart type="donut" series={chartSeries} options={chartOptions} width={{ xs: 240, xl: 260 }} height={{ xs: height, xl: height }} sx={{ my: 4, mx: 'auto' }} />

          <Divider sx={{ borderStyle: 'dashed' }} />

          <ChartLegends labels={chartOptions?.labels} colors={chartOptions?.colors} sx={{ p: 3, justifyContent: 'center', flexWrap: 'wrap' }} />
        </>
      )}
    </Card>
  );
}
