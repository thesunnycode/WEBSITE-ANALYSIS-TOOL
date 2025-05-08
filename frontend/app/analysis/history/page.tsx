"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiFilter,
  FiDownload,
  FiShare2,
  FiSearch,
  FiAlertCircle,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiArrowUp,
  FiCheck,
  FiX,
  FiChevronDown,
  FiClock,
  FiSave,
  FiSettings,
  FiChevronUp,
  FiMoreHorizontal,
  FiChevronRight,
} from "react-icons/fi";
import {
  DateRangePicker,
  Select,
  SelectItem,
  Badge,
  Card,
  Text,
} from "@tremor/react";
import Tooltip from "@/components/modals/Tooltip";
import dynamic from "next/dynamic";
import React from "react";
import Image from "next/image";

// Import visualization components
const SparklineChart = dynamic(
  () => import("@/components/history/SparklineChart"),
  { ssr: false }
);
const ScoreGauge = dynamic(() => import("@/components/history/ScoreGauge"), {
  ssr: false,
});
const StatsCard = dynamic(() => import("@/components/history/StatsCard"), {
  ssr: false,
});
const TimelineChart = dynamic(
  () => import("@/components/history/TimelineChart"),
  { ssr: false }
);

interface Analysis {
  id: string;
  url: string;
  createdAt: string;
  completedAt?: string;
  status: "pending" | "completed" | "failed";
  healthScore?: number;
  previousScore?: number;
  results?: {
    performance?: { score: number };
    seo?: { score: number };
    security?: { score: number };
    uptime?: { score: number };
    "ai-insights"?: { score: number };
  };
  history?: { date: string; score: number }[];
  screenshot?: string;
}

const MotionUl = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.ul),
  { ssr: false }
);

const MotionLi = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.li),
  { ssr: false }
);

type DataPoint = { date: string; [key: string]: any };

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    url: true,
    date: true,
    score: true,
    status: true,
    actions: true,
  });
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [savedFilters, setSavedFilters] = useState<
    { name: string; config: any }[]
  >([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Extract domains for tag filtering
  const availableTags = useMemo(() => {
    const domains = new Set<string>();
    analyses.forEach((analysis) => {
      try {
        const url = new URL(analysis.url);
        domains.add(url.hostname);
      } catch (e) {
        // Invalid URL, skip
      }
    });
    return Array.from(domains);
  }, [analyses]);

  useEffect(() => {
    fetchAnalyses();

    // Add scroll listener for "scroll to top" button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/website-analysis/history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch analyses");
      }

      setAnalyses(data.analyses || []);
    } catch (error: any) {
      setError(error.message);
      toast.error("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = (analysis: Analysis) => {
    if (analysis.healthScore) return analysis.healthScore;
    const scores = Object.values(analysis.results || {})
      .map((r) => r?.score)
      .filter(Boolean);
    return scores.length
      ? Math.round(
          scores.reduce(
            (sum, score) => (sum ?? 0) + (score ?? 0),
            0 as number
          ) / scores.length
        )
      : null;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        icon: <FiCheck className="mr-1.5" />,
        label: "Completed",
      },
      pending: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        icon: <FiClock className="mr-1.5 animate-pulse" />,
        label: "In Progress",
      },
      failed: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: <FiX className="mr-1.5" />,
        label: "Failed",
      },
    };

    const statusInfo = badges[status as keyof typeof badges];

    return (
      <span
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          statusInfo.bg
        } ${statusInfo.text} shadow-sm shadow-${
          status === "completed"
            ? "emerald"
            : status === "pending"
            ? "indigo"
            : "red"
        }-500/30`}
      >
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/website-analysis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      toast.success("Analysis deleted successfully");
      fetchAnalyses();
    } catch (error) {
      toast.error("Failed to delete analysis");
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      const deletePromises = selectedItems.map(async (id) => {
        try {
          await handleDelete(id);
          return { id, success: true };
        } catch (error) {
          return { id, success: false };
        }
      });

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter((r) => !r.success).map((r) => r.id);

      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} analyses`);
      } else {
        toast.success("Successfully deleted all selected analyses");
      }

      setSelectedItems([]);
      await fetchAnalyses();
    } catch (error) {
      toast.error("Failed to process bulk delete operation");
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const saveCurrentFilter = () => {
    const name = prompt("Enter a name for this filter preset:");
    if (name) {
      setSavedFilters([
        ...savedFilters,
        {
          name,
          config: {
            searchQuery,
            dateRange,
            statusFilter,
            activeTags,
          },
        },
      ]);
      toast.success(`Filter "${name}" saved successfully`);
    }
  };

  const applyFilterPreset = (preset: { name: string; config: any }) => {
    setSearchQuery(preset.config.searchQuery);
    setDateRange(preset.config.dateRange);
    setStatusFilter(preset.config.statusFilter);
    setActiveTags(preset.config.activeTags);
    toast.success(`Filter "${preset.name}" applied`);
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const downloadCSV = () => {
    // Generate CSV from filteredAnalyses
    const headers = "URL,Date,Health Score,Status\n";
    const rows = filteredAnalyses
      .map(
        (analysis) =>
          `${analysis.url},${format(
            new Date(analysis.createdAt),
            "yyyy-MM-dd"
          )},${getHealthScore(analysis) || "N/A"},${analysis.status}`
      )
      .join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `analysis-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file downloaded successfully");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSummaryStats = () => {
    const total = analyses.length;
    const completed = analyses.filter((a) => a.status === "completed").length;
    const failed = analyses.filter((a) => a.status === "failed").length;
    const pending = analyses.filter((a) => a.status === "pending").length;

    const completedAnalyses = analyses.filter((a) => a.status === "completed");
    let avgScore = 0;
    const scores = completedAnalyses
      .map(getHealthScore)
      .filter((s): s is number => s !== null && s !== undefined);
    if (scores.length > 0) {
      avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    return {
      total,
      completed,
      failed,
      pending,
      avgScore: Math.round(avgScore),
    };
  };

  const filteredAnalyses = analyses
    .filter((analysis) => {
      // Base filters
      if (
        searchQuery &&
        !analysis.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (statusFilter !== "all" && analysis.status !== statusFilter)
        return false;
      if (dateRange.from && dateRange.to) {
        const date = new Date(analysis.createdAt);
        if (date < dateRange.from || date > dateRange.to) return false;
      }

      // Tag filters
      if (activeTags.length > 0) {
        try {
          const url = new URL(analysis.url);
          if (!activeTags.includes(url.hostname)) return false;
        } catch (e) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "score") {
        const scoreA = getHealthScore(a) || 0;
        const scoreB = getHealthScore(b) || 0;
        comparison = scoreB - scoreA;
      } else if (sortBy === "url") {
        comparison = a.url.localeCompare(b.url);
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });

  const stats = getSummaryStats();

  // For TimelineChart, aggregate all history entries from all analyses
  const allHistory = analyses.flatMap((a) => a.history || []);

  // Error state component
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-[#121826] rounded-xl border border-white/5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FiAlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">
            Unable to Load Analysis History
          </h2>
          <p className="text-gray-400 text-center max-w-md mx-auto mb-6">
            {error}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <FiRefreshCw className="w-5 h-5" /> Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-[#121826] to-[#192339]">
        <div className="space-y-8 animate-pulse">
          <div>
            <div className="h-10 w-72 bg-white/5 rounded-lg mb-2"></div>
            <div className="h-5 w-48 bg-white/5 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white/5 rounded-lg border border-white/10"
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
            ))}
          </div>

          <div className="h-96 bg-white/5 rounded-lg border border-white/10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Analysis History
          </h1>
          <p className="text-gray-400 mt-2">
            Track, compare, and manage your website analyses
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Analyses"
            value={stats.total}
            icon={<FiRefreshCw className="w-8 h-8 text-blue-400" />}
          />
          <StatsCard
            title="Success Rate"
            value={`${
              stats.total
                ? Math.round((stats.completed / stats.total) * 100)
                : 0
            }%`}
            icon={<FiCheck className="w-8 h-8 text-emerald-400" />}
          />
          <StatsCard
            title="Average Score"
            value={stats.avgScore}
            icon={<FiAlertCircle className="w-8 h-8 text-amber-400" />}
          />
          <StatsCard
            title="In Progress"
            value={stats.pending}
            icon={<FiClock className="w-8 h-8 text-indigo-400" />}
          />
        </div>

        {/* Analysis Timeline */}
        <Card className="bg-[#151F32]/80 border-[#2D3748] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Analysis Frequency
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
              >
                <FiDownload size={14} /> Export
              </button>
              <button
                onClick={saveCurrentFilter}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
              >
                <FiSave size={14} /> Save Filter
              </button>
            </div>
          </div>
          {allHistory.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
              No data available for the selected range.
            </div>
          ) : (
            <TimelineChart data={allHistory} />
          )}
        </Card>

        {/* Advanced Filters */}
        <div className="bg-[#151F32] border border-[#232c43] rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <FiFilter className="text-blue-400 text-lg" />
              <span className="text-white font-semibold text-base">
                Filters
              </span>
            </div>
            <input
              type="text"
              placeholder="Search by domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#232c43] border border-[#2D3748] rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <DateRangePicker
              value={dateRange as any}
              onValueChange={setDateRange as any}
              className="bg-[#232c43] border border-[#2D3748] rounded-lg text-white"
              selectPlaceholder="Select dates"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="bg-[#232c43] border border-[#2D3748] rounded-lg text-white"
            >
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">In Progress</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </Select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
            >
              {showFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-4 bg-[#151F32]/80 border border-[#2D3748] rounded-lg shadow-lg"
            >
              <span className="text-sm text-gray-300">
                <span className="font-bold text-white">
                  {selectedItems.length}
                </span>{" "}
                items selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <FiTrash2 /> Delete Selected
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis List */}
        {filteredAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 bg-[#151F32]/80 border border-[#2D3748] rounded-lg"
          >
            <Image
              src="/api/placeholder/120/120"
              alt="No results"
              width={120}
              height={120}
              className="mb-4 opacity-50"
            />
            <h3 className="text-xl font-medium text-white mb-2">
              No Analyses Found
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {searchQuery || statusFilter !== "all" || activeTags.length > 0
                ? "Try adjusting your search filters to see more results."
                : "Start by analyzing a website to build your history."}
            </p>
            {searchQuery || statusFilter !== "all" || activeTags.length > 0 ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setActiveTags([]);
                }}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = "/analysis/new")}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Start New Analysis
              </button>
            )}
          </motion.div>
        ) : (
          <div className="overflow-x-auto bg-[#151F32]/80 border border-[#2D3748] rounded-lg shadow-xl">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#121826] z-10">
                <tr className="text-left border-b border-[#2D3748]">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredAnalyses.length}
                      onChange={(e) => {
                        setSelectedItems(
                          e.target.checked
                            ? filteredAnalyses.map((a) => a.id)
                            : []
                        );
                      }}
                      className="rounded border-[#2D3748] bg-white/5 focus:ring-blue-500"
                    />
                  </th>
                  {visibleColumns.url && (
                    <th
                      className="p-4 text-xs font-semibold tracking-wider text-gray-300 uppercase cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === "url") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("url");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Website URL
                        {sortBy === "url" &&
                          (sortOrder === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </div>
                    </th>
                  )}
                  {visibleColumns.date && (
                    <th
                      className="p-4 text-xs font-semibold tracking-wider text-gray-300 uppercase cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === "date") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("date");
                          setSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Last Analyzed
                        {sortBy === "date" &&
                          (sortOrder === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </div>
                    </th>
                  )}
                  {visibleColumns.score && (
                    <th
                      className="p-4 text-xs font-semibold tracking-wider text-gray-300 uppercase cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === "score") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("score");
                          setSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Health Score
                        {sortBy === "score" &&
                          (sortOrder === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </div>
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th
                      className="p-4 text-xs font-semibold tracking-wider text-gray-300 uppercase cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === "status") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("status");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </div>
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="p-4 text-xs font-semibold tracking-wider text-gray-300 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((analysis, index) => {
                  const healthScore = getHealthScore(analysis);
                  const isExpanded = expandedRows.includes(analysis.id);

                  return (
                    <React.Fragment key={analysis.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className={`border-b border-[#2D3748] ${
                          isExpanded
                            ? "bg-[#1E293B]"
                            : "hover:bg-[#1E293B] transition-colors"
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(analysis.id)}
                            onChange={(e) => {
                              setSelectedItems(
                                e.target.checked
                                  ? [...selectedItems, analysis.id]
                                  : selectedItems.filter(
                                      (id) => id !== analysis.id
                                    )
                              );
                            }}
                            className="rounded border-[#2D3748] bg-white/5 focus:ring-blue-500"
                          />
                        </td>

                        {visibleColumns.url && (
                          <td className="p-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleRowExpansion(analysis.id)}
                                className="mr-2 p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                {isExpanded ? (
                                  <FiChevronDown />
                                ) : (
                                  <FiChevronRight />
                                )}
                              </button>
                              <div>
                                <div className="font-medium text-white">
                                  {analysis.url}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {(() => {
                                    try {
                                      const url = new URL(analysis.url);
                                      return url.hostname;
                                    } catch (e) {
                                      return "Unknown Domain";
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {visibleColumns.date && (
                          <td className="p-4 font-mono text-gray-400 text-sm">
                            {format(
                              new Date(analysis.createdAt),
                              "MMM d, yyyy"
                            )}
                            <div className="text-xs opacity-70">
                              {format(new Date(analysis.createdAt), "HH:mm:ss")}
                            </div>
                          </td>
                        )}

                        {visibleColumns.score && (
                          <td className="p-4">
                            {healthScore !== null ? (
                              <div className="flex items-center gap-3">
                                <ScoreGauge score={healthScore} size="md" />
                                <div>
                                  <span
                                    className={`font-medium ${getScoreColor(
                                      healthScore
                                    )}`}
                                  >
                                    {healthScore}
                                  </span>
                                  {analysis.previousScore && (
                                    <div className="flex items-center text-xs mt-1">
                                      {healthScore > analysis.previousScore ? (
                                        <span className="text-emerald-400 flex items-center">
                                          <FiArrowUp
                                            size={12}
                                            className="mr-1"
                                          />
                                          +
                                          {healthScore - analysis.previousScore}
                                        </span>
                                      ) : healthScore <
                                        analysis.previousScore ? (
                                        <span className="text-red-400 flex items-center">
                                          <FiArrowUp
                                            size={12}
                                            className="mr-1 transform rotate-180"
                                          />
                                          {healthScore - analysis.previousScore}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">
                                          No change
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        )}

                        {visibleColumns.status && (
                          <td className="p-4">
                            {getStatusBadge(analysis.status)}
                          </td>
                        )}

                        {visibleColumns.actions && (
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Tooltip content="View Report">
                                <button
                                  onClick={() =>
                                    (window.location.href = `/analysis/${analysis.id}`)
                                  }
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                                >
                                  <FiEye />
                                </button>
                              </Tooltip>

                              <Tooltip content="Re-analyze">
                                <button
                                  onClick={() =>
                                    (window.location.href = `/analysis/new?url=${encodeURIComponent(
                                      analysis.url
                                    )}`)
                                  }
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                                >
                                  <FiRefreshCw />
                                </button>
                              </Tooltip>

                              <Tooltip content="Share">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      `${window.location.origin}/analysis/${analysis.id}`
                                    );
                                    toast.success("Link copied to clipboard");
                                  }}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                                >
                                  <FiShare2 />
                                </button>
                              </Tooltip>

                              <div className="relative group">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white">
                                  <FiMoreHorizontal />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-[#121826] border border-[#2D3748] rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <button
                                    onClick={() => handleDelete(analysis.id)}
                                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 rounded-t-lg transition-colors flex items-center gap-2"
                                  >
                                    <FiTrash2 size={14} /> Delete Analysis
                                  </button>
                                  <button
                                    onClick={() =>
                                      (window.location.href = `/analysis/${analysis.id}/export`)
                                    }
                                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/5 rounded-b-lg transition-colors flex items-center gap-2"
                                  >
                                    <FiDownload size={14} /> Export Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                      </motion.tr>

                      {/* Expanded row details */}
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#1E293B]"
                        >
                          <td
                            colSpan={
                              6 +
                              (visibleColumns.url ? 1 : 0) +
                              (visibleColumns.date ? 1 : 0) +
                              (visibleColumns.score ? 1 : 0) +
                              (visibleColumns.status ? 1 : 0) +
                              (visibleColumns.actions ? 1 : 0)
                            }
                          >
                            <div className="p-4 border-t border-[#2D3748]">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Score breakdown */}
                                <div>
                                  <h4 className="font-medium text-white mb-3">
                                    Score Breakdown
                                  </h4>
                                  <div className="space-y-3">
                                    {analysis.results &&
                                      Object.entries(analysis.results).map(
                                        ([key, data]) => (
                                          <div
                                            key={key}
                                            className="flex items-center justify-between"
                                          >
                                            <span className="text-gray-400">
                                              {key
                                                .replace("-", " ")
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                )}
                                            </span>
                                            <span
                                              className={getScoreColor(
                                                data?.score || 0
                                              )}
                                            >
                                              {data?.score || 0}
                                            </span>
                                          </div>
                                        )
                                      )}
                                  </div>
                                </div>

                                {/* Score history */}
                                <div>
                                  <h4 className="font-medium text-white mb-3">
                                    Score History
                                  </h4>
                                  {analysis.history ? (
                                    <SparklineChart
                                      data={
                                        analysis.history as unknown as any[]
                                      }
                                    />
                                  ) : (
                                    <p className="text-gray-500 text-sm">
                                      No historical data available
                                    </p>
                                  )}
                                </div>

                                {/* Additional details */}
                                <div>
                                  <h4 className="font-medium text-white mb-3">
                                    Analysis Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">
                                        Created
                                      </span>
                                      <span className="text-gray-300">
                                        {format(
                                          new Date(analysis.createdAt),
                                          "MMM d, yyyy HH:mm"
                                        )}
                                      </span>
                                    </div>
                                    {analysis.completedAt && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Completed
                                        </span>
                                        <span className="text-gray-300">
                                          {format(
                                            new Date(analysis.completedAt),
                                            "MMM d, yyyy HH:mm"
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">ID</span>
                                      <span className="text-gray-300 font-mono text-xs">
                                        {analysis.id}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() =>
                                    (window.location.href = `/analysis/${analysis.id}`)
                                  }
                                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                >
                                  View Full Report
                                </button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors shadow-lg"
            onClick={scrollToTop}
          >
            <FiChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
