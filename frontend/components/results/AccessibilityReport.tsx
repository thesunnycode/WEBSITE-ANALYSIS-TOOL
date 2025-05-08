"use client";

import { motion } from "framer-motion";
import { FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { InfoIcon } from "lucide-react";
import Tooltip from "../modals/Tooltip";

interface AccessibilityData {
  score: number;
  issues: Array<{
    impact: string;
    description: string;
    solution: string;
  }>;
}

interface Props {
  data: AccessibilityData;
  isLoading?: boolean;
}

export default function AccessibilityReport({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "critical":
      case "serious":
        return <FiAlertCircle className="w-5 h-5 text-red-400" />;
      case "moderate":
        return <FiAlertCircle className="w-5 h-5 text-yellow-400" />;
      case "minor":
        return <FiCheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  // Calculate issue counts by impact level
  const impactCounts = data.issues.reduce((acc, issue) => {
    const impact = issue.impact.toLowerCase();
    acc[impact] = (acc[impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = [
    {
      name: "Critical",
      value: impactCounts.critical || 0,
      color: "#EF4444",
    },
    {
      name: "Serious",
      value: impactCounts.serious || 0,
      color: "#F59E0B",
    },
    {
      name: "Moderate",
      value: impactCounts.moderate || 0,
      color: "#3B82F6",
    },
    {
      name: "Minor",
      value: impactCounts.minor || 0,
      color: "#10B981",
    },
  ];

  const radialData = [
    {
      name: "Score",
      value: data.score,
      fill:
        data.score >= 90 ? "#10B981" : data.score >= 70 ? "#F59E0B" : "#EF4444",
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
          <FiUsers className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Accessibility</h2>
      </div>

      {/* Score Visualization */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          Overall Score
          <Tooltip content="A score reflecting your website's accessibility based on WCAG guidelines and detected issues. Higher is better.">
            <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
          </Tooltip>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              barSize={10}
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background={{ fill: "rgba(255, 255, 255, 0.1)" }}
                dataKey="value"
                cornerRadius={30}
                label={{
                  position: "center",
                  fill: "#fff",
                  fontSize: 24,
                  formatter: (value: number) => `${value}%`,
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issues Distribution */}
      {data.issues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Issues by Impact Level
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <ul className="flex justify-center gap-4 text-sm">
                      {payload?.map((entry: any, index) => (
                        <li
                          key={`legend-${index}`}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-gray-400">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Detailed Issues
        </h3>
        {data.issues.map((issue, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
          >
            <div className="flex items-center gap-2 mb-2">
              {getImpactIcon(issue.impact)}
              <span
                className={`text-sm font-medium ${
                  issue.impact.toLowerCase() === "critical" ||
                  issue.impact.toLowerCase() === "serious"
                    ? "text-red-400"
                    : issue.impact.toLowerCase() === "moderate"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {issue.impact.charAt(0).toUpperCase() + issue.impact.slice(1)}{" "}
                Impact
                <Tooltip content={
                  issue.impact.toLowerCase() === "critical"
                    ? "Critical accessibility issues that severely impact users with disabilities. Should be fixed immediately."
                    : issue.impact.toLowerCase() === "serious"
                    ? "Serious issues that significantly affect accessibility. Should be addressed soon."
                    : issue.impact.toLowerCase() === "moderate"
                    ? "Moderate issues that have a noticeable impact but are less severe."
                    : "Minor issues with limited impact on accessibility."
                }>
                  <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors ml-1" />
                </Tooltip>
              </span>
            </div>
            <p className="text-white mb-2">{issue.description}</p>
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <FiCheckCircle className="w-4 h-4 mt-0.5 text-green-400" />
              <p>{issue.solution}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {data.score < 100 && data.issues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <FiAlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-white font-medium">Accessibility issues detected, but no details were provided.</p>
          <p className="text-sm text-gray-400 mt-2">
            Please check your analysis configuration or try again.
          </p>
        </motion.div>
      )}
      {data.issues.length === 0 && data.score === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-white font-medium">Perfect Accessibility Score!</p>
          <p className="text-sm text-gray-400 mt-2">
            Your website follows all accessibility best practices.
          </p>
        </motion.div>
      )}
    </div>
  );
}
