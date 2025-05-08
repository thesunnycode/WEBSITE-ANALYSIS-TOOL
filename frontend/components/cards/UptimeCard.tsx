import { motion } from "framer-motion";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { FiActivity } from "react-icons/fi";

interface UptimeData {
  score: number;
  metrics: {
    availability: number;
    responseTime: number;
    statusCode: number;
    error?: string;
  };
}

interface Props {
  isLoading?: boolean;
  data?: UptimeData;
  url?: string;
}

export default function UptimeCard({ isLoading, data, url }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <FiActivity className="w-8 h-8 mb-2" />
        <span>No uptime data available.</span>
      </div>
    );
  }

  const isUp = data.score === 100;
  return (
    <motion.div
      className="p-6 rounded-xl bg-[#0F1629] border border-[#1D2A48] flex flex-col items-center"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUp ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
          <FiActivity className={`w-5 h-5 ${isUp ? "text-emerald-400" : "text-red-400"}`} />
        </div>
        <h2 className="text-2xl font-bold text-white">Uptime</h2>
      </div>
      <div className="flex flex-col items-center mb-4">
        <span className={`text-4xl font-extrabold ${isUp ? "text-emerald-400" : "text-red-400"} mb-2`}>{data.score}%</span>
        <span className="text-sm text-gray-400">Availability</span>
      </div>
      <div className="flex flex-col items-center gap-1 w-full">
        <span className="text-white text-lg font-medium">
          {url || "Analyzed Site"}
        </span>
        <span className={`text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>{isUp ? "Online" : "Offline"}</span>
        <span className="text-xs text-gray-400">Response: {data.metrics.responseTime}ms</span>
        <span className="text-xs text-gray-400">Status: {data.metrics.statusCode}</span>
        {data.metrics.error && (
          <span className="text-xs text-red-400 mt-1">{data.metrics.error}</span>
        )}
      </div>
    </motion.div>
  );
}
