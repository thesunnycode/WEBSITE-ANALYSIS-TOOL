"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PerformanceMetrics from "@/components/results/PerformanceMetrics";
import SEOAnalysis from "@/components/results/SEOAnalysis";
import AccessibilityReport from "@/components/results/AccessibilityReport";
import AIInsights from "@/components/results/AIInsights";
import ExportOptions from "@/components/results/ExportOptions";
import { Loader } from "@/components/ui/Loader";

interface AnalysisData {
  url: string;
  performance: {
    score: number;
    metrics: {
      loadTime: number;
      firstContentfulPaint: number;
      speedIndex: number;
    };
  };
  seo: {
    score: number;
    issues: Array<{
      severity: string;
      description: string;
      recommendation: string;
    }>;
  };
  accessibility: {
    score: number;
    issues: Array<{
      impact: string;
      description: string;
      solution: string;
    }>;
  };
  aiInsights: {
    summary: string;
    recommendations: string[];
    userExperience: {
      strengths: string[];
      weaknesses: string[];
    };
  };
}

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get("id");

        if (!id) {
          setError("No analysis ID provided");
          setShouldPoll(false);
          return;
        }

        const response = await fetch(`/api/analysis/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analysis results");
        }

        const responseData = await response.json();
        if (!responseData.success || !responseData.data) {
          throw new Error("Invalid response format");
        }

        setData(responseData.data);
        setError(null);

        // Stop polling if analysis is complete
        if (responseData.data.status === "completed" || responseData.data.status === "failed") {
          setShouldPoll(false);
        }
      } catch (error: any) {
        console.error("Error fetching results:", error);
        setError(error.message || "Failed to load analysis results");
        setShouldPoll(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    if (shouldPoll) {
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, [shouldPoll]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400 text-center">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          No Data Available
        </h2>
        <p className="text-gray-400 text-center">
          No analysis results were found.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Blur Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Analysis Results
          </h1>
          <p className="text-lg text-gray-400">
            Comprehensive analysis of your website's performance, SEO, and
            accessibility
          </p>
        </motion.div>

        {/* Export Options */}
        <motion.div variants={itemVariants}>
          <ExportOptions data={data} />
        </motion.div>

        {/* Main Grid - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <motion.div variants={itemVariants}>
            <PerformanceMetrics data={data.performance} />
          </motion.div>

          {/* SEO Analysis */}
          <motion.div variants={itemVariants}>
            <SEOAnalysis data={data.seo} />
          </motion.div>

          {/* Accessibility Report */}
          <motion.div variants={itemVariants}>
            <AccessibilityReport data={data.accessibility} />
          </motion.div>

          {/* AI Insights */}
          <motion.div variants={itemVariants}>
            <AIInsights data={data.aiInsights} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
