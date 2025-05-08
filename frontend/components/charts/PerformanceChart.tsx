import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

export default function PerformanceChart() {
  const data: PerformanceData[] = [
    { timestamp: "00:00", responseTime: 200, cpuUsage: 45, memoryUsage: 60 },
    { timestamp: "04:00", responseTime: 250, cpuUsage: 50, memoryUsage: 65 },
    { timestamp: "08:00", responseTime: 300, cpuUsage: 55, memoryUsage: 70 },
    { timestamp: "12:00", responseTime: 280, cpuUsage: 48, memoryUsage: 68 },
    { timestamp: "16:00", responseTime: 220, cpuUsage: 42, memoryUsage: 62 },
    { timestamp: "20:00", responseTime: 230, cpuUsage: 46, memoryUsage: 64 },
    { timestamp: "24:00", responseTime: 210, cpuUsage: 44, memoryUsage: 61 },
  ];

  return (
    <motion.div
      className="p-6 rounded-xl bg-[#0F1629] border border-[#1D2A48] hover:border-[#4F46E5]/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#E114E5] bg-clip-text text-transparent mb-6">
        Performance Trends
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D2A48" />
            <XAxis
              dataKey="timestamp"
              stroke="#4F46E5"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis stroke="#4F46E5" tick={{ fill: "#9CA3AF" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1629",
                border: "1px solid #1D2A48",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cpuUsage"
              stroke="#E114E5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="memoryUsage"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4F46E5] mr-2" />
          <span className="text-sm text-gray-400">Response Time</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#E114E5] mr-2" />
          <span className="text-sm text-gray-400">CPU Usage</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#60A5FA] mr-2" />
          <span className="text-sm text-gray-400">Memory Usage</span>
        </div>
      </div>
    </motion.div>
  );
}
