import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function BookingStatistics({ title, subheader, chart, currentYear, onYearChange, height, ...other }) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(currentYear);

  const chartColors = ['#a58b67', '#e8d2a6'];

  const YEAR_OPTIONS = [
    { value: new Date().getFullYear(), label: new Date().getFullYear() },
    { value: new Date().getFullYear() - 1, label: new Date().getFullYear() - 1 },
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: chart?.series[0]?.categories },
    tooltip: { y: { formatter: (value) => `${value}` } },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue) => {
    setSelectedSeries(newValue);
  }, []);

  const currentSeries = chart.series.find((i) => i.name);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={<ChartSelect options={YEAR_OPTIONS.map((option) => option.value)} value={currentYear} onChange={onYearChange} />}
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(6789), fShortenNumber(1234)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart type="bar" series={currentSeries?.data} options={chartOptions} height={height || 320} sx={{ py: 2.5, pl: 1, pr: 2.5 }} />
    </Card>
  );
}
