import { useState, useCallback, useMemo } from "react";
import { Analysis, AnalysisFilters, DateRangeFilter } from "@/types/analysis";

interface UseAnalysisHistoryReturn {
  analyses: Analysis[];
  filteredAnalyses: Analysis[];
  filters: AnalysisFilters;
  selectedItems: string[];
  setSearchTerm: (term: string) => void;
  setDateFilter: (filter: DateRangeFilter) => void;
  setStatusFilter: (status: AnalysisFilters["status"]) => void;
  setSortConfig: (field: AnalysisFilters["sortBy"]) => void;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectItem: (id: string) => void;
  deleteAnalyses: (ids: string[]) => Promise<void>;
  reanalyzeItems: (ids: string[]) => Promise<void>;
  cancelAnalysis: (id: string) => Promise<void>;
}

export const useAnalysisHistory = (): UseAnalysisHistoryReturn => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<AnalysisFilters>({
    search: "",
    dateRange: { type: "7" },
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, search: term }));
  }, []);

  const setDateFilter = useCallback((dateRange: DateRangeFilter) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const setStatusFilter = useCallback((status: AnalysisFilters["status"]) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setSortConfig = useCallback((field: AnalysisFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  }, []);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedItems(checked ? analyses.map((a) => a.id) : []);
    },
    [analyses]
  );

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const deleteAnalyses = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/analysis/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error('Failed to delete analyses');
      }

      setAnalyses((prev) =>
        prev.filter((analysis) => !ids.includes(analysis.id))
      );
      setSelectedItems((prev) => prev.filter((id) => !ids.includes(id)));
    } catch (error) {
      console.error("Failed to delete analyses:", error);
      throw error;
    }
  }, []);

  const reanalyzeItems = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/analysis/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error('Failed to reanalyze items');
      }

      const data = await response.json();
      setAnalyses((prev) => {
        return prev.map(analysis => {
          if (ids.includes(analysis.id)) {
            return { ...analysis, status: 'in-progress' };
          }
          return analysis;
        });
      });
    } catch (error) {
      console.error("Failed to reanalyze items:", error);
      throw error;
    }
  }, []);

  const cancelAnalysis = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel analysis');
      }

      setAnalyses((prev) => {
        return prev.map(analysis => {
          if (analysis.id === id) {
            return { ...analysis, status: 'failed', error: 'Analysis cancelled' };
          }
          return analysis;
        });
      });
    } catch (error) {
      console.error("Failed to cancel analysis:", error);
      throw error;
    }
  }, []);

  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter((analysis) => {
        const matchesSearch = analysis.url
          .toLowerCase()
          .includes(filters.search.toLowerCase());
        const matchesStatus =
          filters.status === "all" || analysis.status === filters.status;

        // Date range filtering
        const analysisDate = new Date(analysis.analyzedAt);
        if (filters.dateRange.type === 'custom' && filters.dateRange.startDate && filters.dateRange.endDate) {
          return matchesSearch && matchesStatus && 
            analysisDate >= filters.dateRange.startDate && 
            analysisDate <= filters.dateRange.endDate;
        } else if (filters.dateRange.type === '7' || filters.dateRange.type === '30') {
          const daysAgo = parseInt(filters.dateRange.type);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
          return matchesSearch && matchesStatus && analysisDate >= cutoffDate;
        }
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === "asc" ? 1 : -1;

        switch (filters.sortBy) {
          case "date":
            return (a.analyzedAt.getTime() - b.analyzedAt.getTime()) * order;
          case "score":
            const scoreA = a.healthScore ?? -1;
            const scoreB = b.healthScore ?? -1;
            return (scoreA - scoreB) * order;
          case "url":
            return a.url.localeCompare(b.url) * order;
          default:
            return 0;
        }
      });
  }, [analyses, filters]);

  return {
    analyses,
    filteredAnalyses,
    filters,
    selectedItems,
    setSearchTerm,
    setDateFilter,
    setStatusFilter,
    setSortConfig,
    toggleSelectAll,
    toggleSelectItem,
    deleteAnalyses,
    reanalyzeItems,
    cancelAnalysis,
  };
};
