import { ArrowUpRight } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InvestmentsChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  totalInvestment: number;
  percentageChange: number;
}

export default function InvestmentsChart({
  data,
  totalInvestment,
  percentageChange,
}: InvestmentsChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: "#10B981",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#fff",
        bodyColor: "#9CA3AF",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(context.raw);
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
            return "$" + value;
          },
        },
      },
    },
  };

  return (
    <div className="bg-dark-card rounded-2xl p-6 border border-dark-lighter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-400 text-sm">Investments</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold text-white">
              ${totalInvestment.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-sm text-accent-green">
              <span>+{percentageChange.toFixed(2)}%</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <select className="bg-dark-lighter text-gray-400 text-sm rounded-lg px-3 py-1.5 border border-dark-lighter focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option>Sort ↑↓</option>
            <option>Highest</option>
            <option>Lowest</option>
          </select>
          <select className="bg-dark-lighter text-gray-400 text-sm rounded-lg px-3 py-1.5 border border-dark-lighter focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option>Month</option>
            <option>Year</option>
            <option>All Time</option>
          </select>
        </div>
      </div>
      <div className="h-[200px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
