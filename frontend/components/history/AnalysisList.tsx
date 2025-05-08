"use client";

import { motion } from "framer-motion";
import { Trash2, CheckSquare, Square, ExternalLink } from "lucide-react";
import Link from "next/link";

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
    ai_insights?: {
      score: number;
      summary: string;
      recommendations: Array<{
        category: string;
        description: string;
        priority: "high" | "medium" | "low";
      }>;
      insights: Array<{
        aspect: string;
        analysis: string;
        suggestions: string[];
      }>;
    };
  };
}

interface AnalysisListProps {
  analyses: Analysis[];
  selectedAnalyses: Set<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AnalysisList({
  analyses,
  selectedAnalyses,
  onSelect,
  onDelete,
}: AnalysisListProps) {
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

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analyses found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {analyses.map((analysis) => (
        <motion.div
          key={analysis.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative bg-dark-card/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-glass overflow-hidden group transition-all duration-300 hover:shadow-glass-hover"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-orange-gradient opacity-20 transition-opacity group-hover:opacity-30" />
          <div className="absolute inset-0 bg-glass-gradient" />
          <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-dark-gradient opacity-50" />

          {/* Content */}
          <div className="relative">
            {/* Selection Checkbox */}
            <button
              onClick={() => onSelect(analysis.id)}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
            >
              {selectedAnalyses.has(analysis.id) ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>

            {/* URL and Date */}
            <div className="pr-8">
              <Link
                href={`/analysis/${analysis.id}`}
                className="text-white font-medium hover:text-primary transition-colors line-clamp-1"
              >
                {analysis.url}
                <ExternalLink className="inline-block w-4 h-4 ml-2" />
              </Link>
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(analysis.createdAt)}
              </p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.entries(analysis.results || {}).map(
                ([type, result]) =>
                  result && (
                    <div
                      key={type}
                      className="bg-dark-lighter/30 backdrop-blur-sm rounded-lg p-3 border border-white/5"
                    >
                      <div className="text-sm text-gray-400 capitalize">
                        {type}
                      </div>
                      <div
                        className={`text-lg font-semibold ${getScoreColor(
                          result.score
                        )}`}
                      >
                        {result.score}%
                      </div>
                    </div>
                  )
              )}
            </div>

            {/* Average Score */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Average Score</div>
                <div
                  className={`text-xl font-semibold ${getScoreColor(
                    getAverageScore(analysis)
                  )}`}
                >
                  {getAverageScore(analysis)}%
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(analysis.id)}
                className="p-2 text-gray-400 hover:text-accent-red transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
