import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';
import { useTranslate } from 'src/locales/use-locales';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function EcommerceSaleByGender({ title, subheader, total, chart, ...other }) {
  const theme = useTheme();
  const { t } = useTranslate();

  // ApexCharts' own dataLabels formatter doesn't reliably receive the hovered ring's value in
  // sparkline mode, so the center label is rendered ourselves from plain React state driven by
  // the chart's mouse-enter/leave events instead of relying on that formatter.
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rawValues = chart.series.map((item) => item.value);
  const labels = chart.series.map((item) => item.label);
  // radialBar rings are always 0-100 (percentage of the ring filled) — feeding raw counts in
  // would clip/misrender any value over 100, so convert to percentage for the ring fill only.
  const chartSeries = rawValues.map((value) => (total > 0 ? (value / total) * 100 : 0));

  const chartColors = chart.colors ?? [
    [theme.palette.primary.light, theme.palette.primary.main],
    [hexAlpha(theme.palette.warning.light, 0.8), hexAlpha(theme.palette.warning.main, 0.8)],
    [hexAlpha(theme.palette.error.light, 0.8), hexAlpha(theme.palette.error.main, 0.8)],
  ];
  const ringColors = chartColors.map((color) => color[1]);

  const chartOptions = useChart({
    chart: {
      sparkline: { enabled: true },
      events: {
        dataPointMouseEnter: (_event, _chartContext, config) => setHoveredIndex(config.dataPointIndex),
        dataPointMouseLeave: () => setHoveredIndex(null),
      },
    },
    colors: ringColors,
    labels,
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: chartColors.map((color) => [
          { offset: 0, color: color[0], opacity: 1 },
          { offset: 100, color: color[1], opacity: 1 },
        ]),
      },
    },
    grid: { padding: { top: -40, bottom: -40 } },
    plotOptions: {
      radialBar: {
        hollow: { margin: 10, size: '32%' },
        track: { margin: 10, background: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
        dataLabels: {
          total: { show: false },
          value: { show: false },
          name: { show: false },
        },
      },
    },
    ...chart.options,
  });

  const centerLabel = hoveredIndex != null ? labels[hoveredIndex] : t('total');
  const centerValue = hoveredIndex != null ? rawValues[hoveredIndex] : total;
  const centerColor = hoveredIndex != null ? ringColors[hoveredIndex] : theme.vars.palette.text.secondary;

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ position: 'relative', width: { xs: 300, xl: 320 }, height: { xs: 300, xl: 320 }, mx: 'auto', my: 1.5 }}>
        <Chart type="radialBar" series={chartSeries} options={chartOptions} width="100%" height="100%" />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: centerColor }}>
            {centerLabel}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {fNumber(centerValue)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        values={rawValues.map((value) => fNumber(value))}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
