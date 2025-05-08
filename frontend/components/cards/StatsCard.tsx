import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  isNegative?: boolean;
}

export default function StatsCard({
  title,
  value,
  trend,
  isNegative = false,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-xl bg-[#0F1629] border border-[#1D2A48] hover:border-[#4F46E5]/50 transition-all"
    >
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <span
        className={`inline-flex items-center text-sm ${
          isNegative ? "text-red-400" : "text-green-400"
        }`}
      >
        {trend}
        <svg
          className={`w-3 h-3 ml-1 ${isNegative ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </span>
    </motion.div>
  );
}
