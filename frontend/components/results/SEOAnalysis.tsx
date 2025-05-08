"use client";

import { motion } from "framer-motion";
import { FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { InfoIcon } from "lucide-react";
import Tooltip from "../modals/Tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface SEOData {
  score: number;
  issues: Array<{
    severity: string;
    description: string;
    recommendation: string;
  }>;
}

interface Props {
  data: SEOData;
  isLoading?: boolean;
}

export default function SEOAnalysis({ data, isLoading }: Props) {
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

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <FiAlertCircle className="w-5 h-5 text-red-400" />;
      case "medium":
        return <FiAlertCircle className="w-5 h-5 text-yellow-400" />;
      case "low":
        return <FiCheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  // Calculate issue counts by severity
  const issueCounts = data.issues.reduce((acc, issue) => {
    const severity = issue.severity.toLowerCase();
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const issueChartData = [
    { name: "High", value: issueCounts.high || 0, color: "#EF4444" },
    { name: "Medium", value: issueCounts.medium || 0, color: "#F59E0B" },
    { name: "Low", value: issueCounts.low || 0, color: "#10B981" },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
          <FiSearch className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">SEO Analysis</h2>
      </div>
      {/* Prominent Score */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-4xl font-extrabold text-purple-400 mb-2">{data.score}%</span>
        <span className="text-sm text-gray-400">Overall Score</span>
      </div>

      {/* Issues Distribution Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Issues by Severity
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issueChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
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
              <Bar
                dataKey="value"
                fill="currentColor"
                className="fill-current text-purple-400"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
              {getSeverityIcon(issue.severity)}
              <span
                className={`text-sm font-medium ${
                  issue.severity.toLowerCase() === "high"
                    ? "text-red-400"
                    : issue.severity.toLowerCase() === "medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {issue.severity.charAt(0).toUpperCase() +
                  issue.severity.slice(1)}{" "}
                Priority
              </span>
              <Tooltip content={
                issue.severity.toLowerCase() === "high"
                  ? "Critical issues that significantly impact search rankings and user experience. Should be addressed immediately."
                  : issue.severity.toLowerCase() === "medium"
                  ? "Important issues that affect SEO performance. Should be addressed in the near future."
                  : "Minor issues that have a smaller impact on SEO. Can be addressed as part of regular maintenance."
              }>
                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </Tooltip>
            </div>
            <p className="text-white mb-2">{issue.description}</p>
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-400" />
              <p>{issue.recommendation}</p>
            </div>
          </motion.div>
        ))}

        {data.issues.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8"
          >
            <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white font-medium">No SEO issues found!</p>
            <p className="text-sm text-gray-400 mt-2">
              Your website follows SEO best practices.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
