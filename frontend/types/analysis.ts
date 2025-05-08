export interface Analysis {
  id: string;
  url: string;
  analyzedAt: Date;
  healthScore: number | null;
  status: AnalysisStatus;
  tags: AnalysisTag[];
  error?: string;
  seoScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
  bestPracticesScore?: number;
}

export type AnalysisStatus = "completed" | "in-progress" | "failed";

export interface AnalysisTag {
  id: string;
  label: string;
  color: string;
  tooltip?: string;
}

export interface AnalysisFilters {
  search: string;
  dateRange: DateRangeFilter;
  status: AnalysisStatus | "all";
  sortBy: "date" | "score" | "url";
  sortOrder: "asc" | "desc";
}

export interface DateRangeFilter {
  type: "7" | "30" | "custom";
  startDate?: Date;
  endDate?: Date;
}
