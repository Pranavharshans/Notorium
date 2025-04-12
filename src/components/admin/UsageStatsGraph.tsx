'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Scale,
  CoreScaleOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UsageData {
  labels: string[];
  recordingTime: number[];
  aiActions: number[];
}

interface UsageStatsGraphProps {
  data: UsageData;
  title: string;
}

export default function UsageStatsGraph({ data, title }: UsageStatsGraphProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(
            this: Scale<CoreScaleOptions>,
            value: number | string
          ): string {
            const numValue = Number(value);
            if (this.chart.data.datasets[0].label?.includes('Recording')) {
              return numValue >= 60 
                ? `${Math.round(numValue / 60)}h` 
                : `${numValue}m`;
            }
            return String(value);
          }
        }
      }
    }
  };

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: [
      {
        label: 'Recording Time (minutes)',
        data: data.recordingTime,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'AI Actions',
        data: data.aiActions,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar options={options} data={chartData} />
    </div>
  );
}