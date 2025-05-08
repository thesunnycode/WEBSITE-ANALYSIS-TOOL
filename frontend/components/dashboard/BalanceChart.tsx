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

interface BalanceChartProps {
  data: {
    labels: string[];
    actualBalance: number[];
    totalMonthlyBalance: number[];
  };
}

export default function BalanceChart({ data }: BalanceChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Actual Balance",
        data: data.actualBalance,
        borderColor: "#FF6B2C",
        backgroundColor: "rgba(255, 107, 44, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Total Monthly Balance",
        data: data.totalMonthlyBalance,
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
        backgroundColor: "#1F2937",
        titleColor: "#fff",
        bodyColor: "#9CA3AF",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
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
        grid: {
          color: "rgba(75, 85, 99, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          callback: function (value: any) {
            return "$" + value.toLocaleString();
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
    <div className="bg-dark-card rounded-2xl p-6 border border-dark-lighter">
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
