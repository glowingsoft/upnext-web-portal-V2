import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function EcommerceYearlySales({ title, subheader, chart, currentYear, onYearChange, ...other }) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(String(currentYear ?? chart?.series?.[0]?.name ?? ''));

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const YEAR_OPTIONS = [new Date().getFullYear(), new Date().getFullYear() - 1];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      setSelectedSeries(String(newValue));
      onYearChange?.(Number(newValue));
    },
    [onYearChange]
  );

  const activeSeriesName = String(currentYear ?? selectedSeries);
  const currentSeries = chart.series.find((i) => String(i.name) === activeSeriesName) ?? chart.series[0];
  const legendValues = currentSeries?.data?.map((item) => fShortenNumber(item.data?.reduce((a, b) => a + b, 0) ?? 0)) ?? [];

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={<ChartSelect options={YEAR_OPTIONS} value={Number(currentYear ?? selectedSeries)} onChange={handleChangeSeries} />}
        sx={{ mb: 3 }}
      />

      <ChartLegends colors={chartOptions?.colors} labels={currentSeries?.data?.map((item) => item.name) ?? []} sx={{ px: 3, gap: 3 }} />

      <Chart type="area" series={currentSeries?.data} options={chartOptions} height={320} sx={{ py: 2.5, pl: 1, pr: 2.5 }} />
    </Card>
  );
}
