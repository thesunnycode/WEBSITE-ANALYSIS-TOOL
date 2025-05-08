"use client";

import { motion } from "framer-motion";
import { FiZap, FiClock, FiTrendingUp } from "react-icons/fi";
import { InfoIcon } from "lucide-react";
import Tooltip from "../modals/Tooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, DonutChart, Title } from "@tremor/react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface PerformanceData {
  score: number;
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    speedIndex: number;
  };
}

interface Props {
  data: PerformanceData;
  isLoading?: boolean;
}

export default function PerformanceMetrics({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  // Sample performance trend data (you can replace this with real data)
  const performanceTrend = [
    { time: "0s", value: 0 },
    { time: data.metrics.firstContentfulPaint + "s", value: 40 },
    { time: data.metrics.speedIndex + "s", value: 70 },
    { time: data.metrics.loadTime + "s", value: 100 },
  ];

  // Donut chart data
  const performanceBreakdown = [
    {
      name: "Load Time",
      value: data.metrics.loadTime,
    },
    {
      name: "First Paint",
      value: data.metrics.firstContentfulPaint,
    },
    {
      name: "Speed Index",
      value: data.metrics.speedIndex,
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <FiZap className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Performance</h2>
      </div>
      {/* Prominent Score */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-4xl font-extrabold text-blue-400 mb-2">{data.score}%</span>
        <span className="text-sm text-gray-400">Overall Score</span>
      </div>

      {/* Overall Score with Circular Progress */}
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2">Overall Score</div>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-700 stroke-current"
              strokeWidth="10"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${getScoreColor(data.score)} stroke-current`}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              style={{
                strokeDasharray: `${2 * Math.PI * 40}`,
                strokeDashoffset: `${
                  2 * Math.PI * 40 * (1 - data.score / 100)
                }`,
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
              }}
            />
            <text
              x="50"
              y="50"
              className="text-2xl font-bold"
              fill="currentColor"
              textAnchor="middle"
              dy=".3em"
            >
              {data.score}%
            </text>
          </svg>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Loading Performance
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceTrend}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Load Time */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Load Time</span>
            <Tooltip content="The total time taken for the page to fully load, including all resources and scripts. Lower is better.">
              <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
            </Tooltip>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-white">
              {data.metrics.loadTime.toFixed(2)}s
            </div>
            <div className="text-sm text-gray-400 mb-1">
              {data.metrics.loadTime < 2.5
                ? "Excellent"
                : data.metrics.loadTime < 4
                ? "Good"
                : "Needs Improvement"}
            </div>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                data.metrics.loadTime < 2.5
                  ? "bg-green-400"
                  : data.metrics.loadTime < 4
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
              style={{
                width: `${Math.min((data.metrics.loadTime / 5) * 100, 100)}%`,
              }}
            />
          </div>
        </motion.div>

        {/* First Contentful Paint */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">First Paint</span>
            <Tooltip content="The time when the browser first renders any visual content. This is when users first see something on the screen.">
              <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
            </Tooltip>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-white">
              {data.metrics.firstContentfulPaint.toFixed(2)}s
            </div>
            <div className="text-sm text-gray-400 mb-1">
              {data.metrics.firstContentfulPaint < 1.8
                ? "Excellent"
                : data.metrics.firstContentfulPaint < 3
                ? "Good"
                : "Needs Improvement"}
            </div>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                data.metrics.firstContentfulPaint < 1.8
                  ? "bg-green-400"
                  : data.metrics.firstContentfulPaint < 3
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
              style={{
                width: `${Math.min((data.metrics.firstContentfulPaint / 4) * 100, 100)}%`,
              }}
            />
          </div>
        </motion.div>

        {/* Speed Index */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
        >
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Speed Index</span>
            <Tooltip content="Measures how quickly content is visually displayed during page load. Lower values indicate faster visual completion.">
              <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
            </Tooltip>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-white">
              {data.metrics.speedIndex.toFixed(2)}s
            </div>
            <div className="text-sm text-gray-400 mb-1">
              {data.metrics.speedIndex < 3.4
                ? "Excellent"
                : data.metrics.speedIndex < 5.8
                ? "Good"
                : "Needs Improvement"}
            </div>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                data.metrics.speedIndex < 3.4
                  ? "bg-green-400"
                  : data.metrics.speedIndex < 5.8
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
              style={{
                width: `${Math.min((data.metrics.speedIndex / 7) * 100, 100)}%`,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Performance Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Breakdown
        </h3>
        <div className="h-64">
          <DonutChart
            data={performanceBreakdown}
            category="value"
            index="name"
            valueFormatter={(value) => `${value.toFixed(2)}s`}
            colors={["blue", "cyan", "indigo"]}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
