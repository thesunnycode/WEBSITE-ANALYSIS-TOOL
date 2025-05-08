export interface AnalyticsSummary {
  totalAnalyses: number;
  activeMonitors: number;
  errorsDetected: number;
  trendsPercentage: {
    analyses: number;
    monitors: number;
    errors: number;
  };
}

export interface UptimeStatus {
  url: string;
  status: "up" | "down";
  responseTime: number;
  lastChecked: string;
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  source: string;
}

export interface PerformanceData {
  timestamp: string;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
}
