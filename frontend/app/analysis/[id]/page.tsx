"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AIInsights from "@/components/results/AIInsights";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import AccessibilityReport from "@/components/results/AccessibilityReport";
import UptimeCard from "@/components/cards/UptimeCard";
import Tooltip from "@/components/modals/Tooltip";
import { InfoIcon } from "lucide-react";
import { FiShield } from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import ExportOptions from "@/components/results/ExportOptions";

interface Issue {
  severity: "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

interface AnalysisResult {
  _id: string;
  url: string;
  user: string;
  status: string;
  selectedOptions: string[];
  results: {
    performance?: {
      score: number;
      metrics: {
        loadTime: number;
        firstContentfulPaint: number;
        largestContentfulPaint: number;
        timeToInteractive: number;
        domContentLoaded: number;
        firstPaint: number;
        speedIndex: number;
      };
      resourceMetrics: {
        totalRequests: number;
        totalResourceSize: string;
        htmlSize: number;
      };
      memoryMetrics: {
        jsHeapUsed: number;
        jsHeapTotal: number;
      };
      recommendations: Issue[];
    };
    seo?: {
      score: number;
      issues: Issue[];
    };
    security?: {
      score: number;
      issues: Issue[];
    };
    accessibility?: {
      score: number;
      wcagCompliance: {
        level: "A" | "AA" | "AAA";
        percentage: number;
        status: "compliant" | "partial" | "non-compliant";
      };
      issuesByPriority: {
        high: number;
        medium: number;
        low: number;
      };
      issues: {
        type: string;
        description: string;
        priority: "high" | "medium" | "low";
        wcagGuideline: string;
        affectedElements: {
          selector: string;
          html: string;
        }[];
      }[];
    };
    uptime?: {
      score: number;
      metrics: {
        responseTime: number;
        availability: number;
        statusCode?: number;
        error?: string;
      };
    };
    ai_insights?: {
      score: number;
      summary: string;
      recommendations: {
        category: string;
        description: string;
        priority: "high" | "medium" | "low";
      }[];
      insights: {
        aspect: string;
        analysis: string;
        suggestions: string[];
      }[];
    };
  };
  createdAt: string;
  completedAt?: string;
}

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldPoll, setShouldPoll] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/website-analysis/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch analysis");
        }

        setResult(data.data);

        // Stop polling if analysis is completed or failed
        if (data.data.status === "completed" || data.data.status === "failed") {
          setShouldPoll(false);
          setIsLoading(false);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
        setShouldPoll(false);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchAnalysis();

    // Set up polling if needed
    if (shouldPoll) {
      const interval = setInterval(fetchAnalysis, 5000);
      return () => clearInterval(interval);
    }
  }, [params.id, shouldPoll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-4">
          Analysis Not Found
        </h1>
        <p className="text-gray-400 mb-8">
          The requested analysis could not be found.
        </p>
        <button
          onClick={() => router.push("/analysis/new")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div
      className="px-4 py-8 max-w-7xl mx-auto"
      role="main"
      aria-label="Analysis Results Page"
    >
      {/* Status Banner */}
      {result.status !== "completed" && (
        <div
          className="mb-8 p-4 rounded-lg bg-dark-card/20 backdrop-blur-sm border border-white/5 shadow-glass"
          aria-live="polite"
        >
          <div className="flex items-center space-x-4">
            {result.status === "pending" ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                <p
                  className="text-white font-medium"
                  aria-label="Analysis in progress"
                >
                  Analysis in progress...
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p
                  className="text-white font-medium"
                  aria-label="Analysis failed"
                >
                  Analysis failed. Please try again.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Analysis Header */}
      <div className="mb-8 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-glass p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 md:mb-0">
            Analysis Results
          </h1>

          {/* Share & Export Buttons */}
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-dark-lighter/30 hover:bg-dark-lighter/50 text-white rounded-lg transition-colors flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>Share</span>
            </button>
            <button
              className="px-4 py-2 bg-dark-lighter/30 hover:bg-dark-lighter/50 text-white rounded-lg transition-colors flex items-center space-x-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-dark-lighter/30 backdrop-blur-sm border border-white/5">
            <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">
              Website
            </p>
            <p className="text-white font-medium truncate">{result.url}</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-lighter/30 backdrop-blur-sm border border-white/5">
            <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">
              Started
            </p>
            <p className="text-white font-medium">
              {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
          {result.completedAt && (
            <div className="p-4 rounded-lg bg-dark-lighter/30 backdrop-blur-sm border border-white/5">
              <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">
                Completed
              </p>
              <p className="text-white font-medium">
                {new Date(result.completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        {/* Performance Card - Spans 2 columns */}
        {result.results?.performance && (
          <div className="lg:col-span-2 p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 h-full">
            <h3 className="text-xl font-medium text-white mb-6">
              Performance Analysis
            </h3>

            {/* Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Overall Score</span>
                <span className="text-2xl font-bold text-primary">
                  {result.results.performance.score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${result.results.performance.score || 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {result.results.performance.metrics &&
                Object.entries(result.results.performance.metrics).map(
                  ([key, value]) => (
                    <div key={key} className="p-4 bg-dark-card/30 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">
                        {key.split(/(?=[A-Z])/).join(" ")}
                      </p>
                      <p className="text-lg font-medium text-white">
                        {typeof value === "number"
                          ? value.toFixed(2) + "s"
                          : value}
                      </p>
                    </div>
                  )
                )}
            </div>
          </div>
        )}

        {/* SEO Card */}
        {result.results?.seo && (
          <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 h-full">
            <h3 className="text-xl font-medium text-white mb-4">
              SEO Analysis
            </h3>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400">Score</span>
              <span className="text-3xl font-bold text-primary">
                {result.results.seo.score}%
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-dark-card/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Issues Found</p>
                <p className="text-lg font-medium text-white">
                  {result.results.seo.issues.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Card */}
        {result.results?.security && (
          <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                <FiShield className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-0">
                Security Analysis
              </h3>
            </div>
            {/* Prominent Score */}
            <div className="flex flex-col items-center mb-8">
              <span className="text-4xl font-extrabold text-cyan-400 mb-2">
                {result.results.security.score}%
              </span>
              <span className="text-sm text-gray-400">Score</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center gap-2 text-gray-400">
                    Score
                    <Tooltip content="A security score based on detected vulnerabilities, SSL configuration, HTTP headers, and other best practices.">
                      <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    </Tooltip>
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {result.results.security.score}%
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-card/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      Vulnerabilities
                      <Tooltip content="The number of security issues or vulnerabilities detected during the scan. Lower is better.">
                        <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                      </Tooltip>
                    </div>
                    <p className="text-lg font-medium text-white">
                      {result.results.security.issues.length}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Accessibility Card */}
        {result.results?.accessibility && (
          <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 h-full">
            <AccessibilityReport
              data={{
                score: result.results.accessibility.score,
                issues: Array.isArray(
                  (result.results.accessibility as any).violations
                )
                  ? (
                      (result.results.accessibility as any).violations as any[]
                    ).map((issue: any) => ({
                      impact: issue.impact || issue.priority || "unknown",
                      description: issue.description,
                      solution: issue.wcagGuideline || issue.help || "",
                    }))
                  : Array.isArray(result.results.accessibility.issues)
                  ? result.results.accessibility.issues.map((issue: any) => ({
                      impact: issue.impact || issue.priority || "unknown",
                      description: issue.description,
                      solution: issue.wcagGuideline || issue.help || "",
                    }))
                  : [],
              }}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Uptime Card */}
        {result.results?.uptime && (
          <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 h-full flex items-center justify-center">
            <UptimeCard
              isLoading={isLoading}
              data={{
                score: result.results.uptime.score,
                metrics: {
                  availability: result.results.uptime.metrics.availability,
                  responseTime: result.results.uptime.metrics.responseTime,
                  statusCode: result.results.uptime.metrics.statusCode ?? 0,
                  error: result.results.uptime.metrics.error ?? undefined,
                },
              }}
              url={result.url}
            />
          </div>
        )}

        {/* AI Insights Card - Spans full width */}
        {(() => {
          // Use bracket notation and type assertion to avoid TS error
          const aiInsights =
            result.results?.ai_insights ||
            (result.results as any)?.["ai-insights"];
          if (!aiInsights || aiInsights.error) {
            return (
              <div className="lg:col-span-3 p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5 text-center">
                <p className="text-red-400 font-semibold">
                  AI Insights are not available for this analysis.
                  {aiInsights && aiInsights.error && (
                    <span className="block text-xs text-gray-400 mt-2">
                      {aiInsights.error}
                    </span>
                  )}
                </p>
              </div>
            );
          }
          return (
            <div className="lg:col-span-3 p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5">
              <AIInsights data={aiInsights} isLoading={isLoading} />
            </div>
          );
        })()}
      </div>

      {/* Detailed Issues Section - Spans full width */}
      {((result.results?.seo?.issues && result.results.seo.issues.length > 0) ||
        (result.results?.security?.issues &&
          result.results.security.issues.length > 0) ||
        (result.results?.accessibility?.issues &&
          result.results.accessibility.issues.length > 0)) && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Detailed Findings
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO Issues */}
            {result.results?.seo?.issues &&
              result.results.seo.issues.length > 0 && (
                <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5">
                  <h3 className="text-xl font-medium text-white mb-4">
                    SEO Issues
                  </h3>
                  <div className="space-y-4">
                    {result.results.seo.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="p-4 bg-dark-lighter/20 rounded-lg border-l-4"
                        style={{
                          borderColor:
                            issue.severity === "high"
                              ? "rgb(239, 68, 68)"
                              : issue.severity === "medium"
                              ? "rgb(234, 179, 8)"
                              : "rgb(34, 197, 94)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${
                              issue.severity === "high"
                                ? "text-red-400"
                                : issue.severity === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {issue.severity.toUpperCase()} Priority
                          </span>
                        </div>
                        <p className="text-white mb-2">{issue.description}</p>
                        <p className="text-sm text-gray-400">
                          {issue.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Security Issues */}
            {result.results?.security?.issues &&
              result.results.security.issues.length > 0 && (
                <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5">
                  <h3 className="text-xl font-medium text-white mb-4">
                    Security Issues
                  </h3>
                  <div className="space-y-4">
                    {result.results.security.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="p-4 bg-dark-lighter/20 rounded-lg border-l-4"
                        style={{
                          borderColor:
                            issue.severity === "high"
                              ? "rgb(239, 68, 68)"
                              : issue.severity === "medium"
                              ? "rgb(234, 179, 8)"
                              : "rgb(34, 197, 94)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${
                              issue.severity === "high"
                                ? "text-red-400"
                                : issue.severity === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {issue.severity.toUpperCase()} Risk
                          </span>
                        </div>
                        <p className="text-white mb-2">{issue.description}</p>
                        <p className="text-sm text-gray-400">
                          {issue.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Accessibility Issues */}
            {result.results?.accessibility?.issues &&
              result.results.accessibility.issues.length > 0 && (
                <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-xl border border-white/5">
                  <h3 className="text-xl font-medium text-white mb-4">
                    Accessibility Issues
                  </h3>
                  <div className="space-y-4">
                    {result.results.accessibility.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="p-4 bg-dark-lighter/20 rounded-lg border-l-4"
                        style={{
                          borderColor:
                            issue.priority === "high"
                              ? "rgb(239, 68, 68)"
                              : issue.priority === "medium"
                              ? "rgb(234, 179, 8)"
                              : "rgb(34, 197, 94)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${
                              issue.priority === "high"
                                ? "text-red-400"
                                : issue.priority === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {issue.priority.toUpperCase()} Priority
                          </span>
                        </div>
                        <p className="text-white mb-2">{issue.description}</p>
                        <p className="text-sm text-gray-400">
                          {issue.wcagGuideline}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <ExportOptions
          data={{
            url: result.url,
            performance: result.results?.performance || {
              score: 0,
              metrics: {},
            },
            seo: result.results?.seo || { score: 0, issues: [] },
            security: result.results?.security || { score: 0, issues: [] },
            uptime: result.results?.uptime || { score: 0, metrics: {} },
            accessibility: result.results?.accessibility || {
              score: 0,
              wcagCompliance: {},
              issuesByPriority: {},
              issues: [],
            },
            aiInsights: result.results?.ai_insights
              ? {
                  score: result.results.ai_insights.score,
                  summary: result.results.ai_insights.summary,
                  recommendations:
                    result.results.ai_insights.recommendations || [],
                  insights: result.results.ai_insights.insights || [],
                }
              : {
                  score: 0,
                  summary: "",
                  recommendations: [],
                  insights: [],
                },
          }}
        />
      </Modal>
    </div>
  );
}
