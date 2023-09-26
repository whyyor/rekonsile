// @mui
import { useTheme } from '@mui/material/styles';

import React from 'react';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function RevenueChart({ chartData }) {
  console.log(chartData);
  console.log(typeof chartData);
  const theme = useTheme();
  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    labels: chartData.map((b) => b.brand),
    stroke: {
      show: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      fillSeriesColor: true,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '90%',
        },
      },
    },
  });

  return (
    <Chart
      dir="ltr"
      type="donut"
      series={chartData.map((b) => b.revenue)}
      options={chartOptions}
      width={400}
    />
  );
}
