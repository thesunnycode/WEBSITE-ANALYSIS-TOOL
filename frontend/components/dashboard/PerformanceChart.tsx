"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface PerformanceChartProps {
  data: {
    labels: string[];
    scores: number[];
    averages: number[];
  };
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Your Score",
        data: data.scores,
        borderColor: "#FF6B2C",
        backgroundColor: "rgba(255, 107, 44, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Average Score",
        data: data.averages,
        borderColor: "#10B981",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#9CA3AF",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(26,26,26,0.95)",
        titleColor: "#fff",
        bodyColor: "#9CA3AF",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + "%";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(75, 85, 99, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          callback: function (value: any) {
            return value + "%";
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
