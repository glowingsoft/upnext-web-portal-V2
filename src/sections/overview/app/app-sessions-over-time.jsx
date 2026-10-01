import { useState } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function AppSessionsOverTime({
  title,
  subheader,
  chart,
  seriesName = 'Bookings',
  height = 320,
  ...other
}) {
  const theme = useTheme();

  const years = Object.keys(chart).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(years[0] ?? '');

  const currentData = chart[selectedYear] ?? { categories: [], data: [] };
  const lineColor = currentData.lineColor ?? theme.palette.primary.main;

  const chartOptions = useChart({
    colors: [lineColor],
    stroke: { width: 3, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.45,
        opacityTo: 0.04,
        stops: [0, 90, 100],
      },
    },
    xaxis: { categories: currentData.categories },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      floating: false,
      offsetY: -4,
    },
    yaxis: {
      labels: {
        style: { colors: theme.vars.palette.text.disabled },
      },
    },
    tooltip: {
      y: { formatter: (value) => `${value}` },
    },
    ...currentData?.options,
  });

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 1 }}
        action={
          <Select
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ mr: 1, minWidth: 90 }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        }
      />

      <Chart
        key={selectedYear}
        type="area"
        series={[{ name: seriesName, data: currentData.data }]}
        options={chartOptions}
        height={height}
        sx={{ py: 1, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
