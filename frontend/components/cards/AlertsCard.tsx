"use client";

import { motion } from "framer-motion";

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  source: string;
}

export default function AlertsCard() {
  const alerts: Alert[] = [
    {
      id: "1",
      type: "error",
      message: "High latency detected on api.example.com",
      timestamp: "5 mins ago",
      source: "Server Monitor",
    },
    {
      id: "2",
      type: "warning",
      message: "CPU usage above 80% threshold",
      timestamp: "10 mins ago",
      source: "Server Monitor",
    },
    {
      id: "3",
      type: "info",
      message: "New security update available",
      timestamp: "1 hour ago",
      source: "Security Scanner",
    },
  ];

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      className="p-6 rounded-xl bg-[#0F1629] border border-[#1D2A48] hover:border-[#4F46E5]/50 transition-all"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#E114E5] bg-clip-text text-transparent">
          Recent Alerts
        </h2>
        <button className="px-4 py-2 text-sm text-white bg-[#4F46E5] rounded-lg hover:bg-[#4F46E5]/80 transition-all">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
          >
            <div
              className={`w-2 h-2 mt-2 rounded-full ${getAlertColor(
                alert.type
              )}`}
            />
            <div className="flex-1">
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
