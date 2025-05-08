"use client";

import { motion } from "framer-motion";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface AIInsightsProps {
  data: {
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
  isLoading?: boolean;
}

export default function AIInsights({ data, isLoading }: AIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 shadow-lg"
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {data.score}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white mb-2">
                Overall Score
              </h3>
              <p className="text-gray-400">{data.summary}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Key Recommendations
            </h3>
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(
                        rec.priority
                      )}`}
                    >
                      {rec.priority}
                    </span>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {rec.category}
                      </h4>
                      <p className="text-gray-400">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Insights */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Detailed Insights
            </h3>
            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <h4 className="text-white font-medium mb-2">
                    {insight.aspect}
                  </h4>
                  <p className="text-gray-400 mb-3">{insight.analysis}</p>
                  {insight.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-primary">
                        Suggestions:
                      </h5>
                      <ul className="list-disc list-inside text-gray-400">
                        {insight.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
