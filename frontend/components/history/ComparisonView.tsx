"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Analysis {
  id: string;
  url: string;
  createdAt: string;
  completedAt?: string;
  status: "pending" | "completed" | "failed";
  results?: {
    performance?: {
      score: number;
      metrics: {
        loadTime: number;
        firstContentfulPaint: number;
        speedIndex: number;
      };
    };
    seo?: {
      score: number;
      issues: Array<{
        severity: "high" | "medium" | "low";
        description: string;
        recommendation: string;
      }>;
    };
    security?: {
      score: number;
      issues: Array<{
        severity: "high" | "medium" | "low";
        description: string;
        recommendation: string;
      }>;
    };
    uptime?: {
      score: number;
      availability: number;
      responseTime: number;
      status: "up" | "down";
      lastCheck: string;
    };
  };
}

interface ComparisonViewProps {
  analyses: Analysis[];
  onClose: () => void;
}

export function ComparisonView({ analyses, onClose }: ComparisonViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent-green";
    if (score >= 70) return "text-primary";
    return "text-accent-red";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getAverageScore = (analysis: Analysis) => {
    if (!analysis.results) return 0;
    const scores = Object.values(analysis.results).map(
      (result) => result?.score || 0
    );
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-glass overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-orange-gradient opacity-20" />
      <div className="absolute inset-0 bg-glass-gradient" />
      <div className="absolute inset-0 bg-dark-gradient opacity-50" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Comparing {analyses.length} Analyses
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-dark-lighter/30 backdrop-blur-sm rounded-xl p-4 border border-white/5"
            >
              {/* URL and Date */}
              <div className="mb-4">
                <h3 className="text-white font-medium line-clamp-1">
                  {analysis.url}
                </h3>
                <p className="text-sm text-gray-400">
                  {formatDate(analysis.createdAt)}
                </p>
              </div>

              {/* Scores */}
              <div className="space-y-4">
                {Object.entries(analysis.results || {}).map(
                  ([type, result]) =>
                    result && (
                      <div key={type}>
                        <div className="text-sm text-gray-400 mb-1 capitalize">
                          {type}
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`text-lg font-semibold ${getScoreColor(
                              result.score
                            )}`}
                          >
                            {result.score}%
                          </div>
                          {type === "performance" && (
                            <div className="text-sm text-gray-400">
                              Load: {result.metrics.loadTime.toFixed(2)}s
                            </div>
                          )}
                          {type === "uptime" && (
                            <div className="text-sm text-gray-400">
                              Availability: {result.availability}%
                            </div>
                          )}
                        </div>

                        {/* Additional Metrics */}
                        {type === "performance" && (
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="text-gray-400">
                              FCP:{" "}
                              {result.metrics.firstContentfulPaint.toFixed(2)}s
                            </div>
                            <div className="text-gray-400">
                              SI: {result.metrics.speedIndex.toFixed(2)}s
                            </div>
                          </div>
                        )}
                        {(type === "seo" || type === "security") && (
                          <div className="text-sm text-gray-400 mt-1">
                            {result.issues.length} issues found
                          </div>
                        )}
                      </div>
                    )
                )}

                {/* Average Score */}
                <div className="pt-4 border-t border-white/5">
                  <div className="text-sm text-gray-400">Average Score</div>
                  <div
                    className={`text-xl font-semibold ${getScoreColor(
                      getAverageScore(analysis)
                    )}`}
                  >
                    {getAverageScore(analysis)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
