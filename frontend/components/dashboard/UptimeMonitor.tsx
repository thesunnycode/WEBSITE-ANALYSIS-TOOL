"use client";

import { motion } from "framer-motion";

interface UptimeStatus {
  url: string;
  responseTime: string;
  status: "up" | "down";
  lastChecked: string;
}

export function UptimeMonitor() {
  const monitors: UptimeStatus[] = [
    {
      url: "api.example.com",
      responseTime: "234ms",
      status: "up",
      lastChecked: "2 mins ago",
    },
    {
      url: "dashboard.example.com",
      responseTime: "156ms",
      status: "up",
      lastChecked: "1 min ago",
    },
    {
      url: "auth.example.com",
      responseTime: "0ms",
      status: "down",
      lastChecked: "5 mins ago",
    },
  ];

  return (
    <div className="space-y-4">
      {monitors.map((monitor, index) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          key={monitor.url}
          className="backdrop-blur-md bg-white/[0.02] rounded-lg p-4 border border-white/[0.05]
                     hover:bg-white/[0.05] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  monitor.status === "up"
                    ? "bg-green-500 shadow-lg shadow-green-500/50"
                    : "bg-red-500 shadow-lg shadow-red-500/50"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-white">{monitor.url}</p>
                <p className="text-xs text-gray-400">{monitor.lastChecked}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-400">
              {monitor.responseTime}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
