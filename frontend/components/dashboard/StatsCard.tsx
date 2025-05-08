"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string | number;
  trend: "up" | "down";
  gradient: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  gradient,
}: StatsCardProps) {
  const isPositive = trend === "up";
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
  const changeColor = isPositive ? "text-accent-green" : "text-accent-red";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-glass overflow-hidden group transition-all duration-300 hover:shadow-glass-hover"
    >
      <div className="absolute inset-0 bg-orange-gradient opacity-20 transition-opacity group-hover:opacity-30" />
      <div className="absolute inset-0 bg-glass-gradient" />
      <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-dark-gradient opacity-50" />

      <div className="relative space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-400 text-sm font-medium">{title}</h2>
          <div
            className={`flex items-center gap-1 text-sm ${changeColor} font-medium`}
          >
            <span>
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <Arrow className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
      </div>

      <div
        className={`h-1 mt-4 rounded-full bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-40 transition-all duration-300`}
      />
    </motion.div>
  );
}
