export interface Monitor {
  id: string;
  url: string;
  status: 'up' | 'down' | 'maintenance';
  lastChecked: string;
  uptime: number;
  responseTime: number;
}

export interface Incident {
  id: string;
  monitorId: string;
  startTime: string;
  endTime: string;
  status: 'down' | 'maintenance' | 'resolved';
  error?: string;
  affectedVisitors?: number;
}

export interface MonitorData {
  monitors: Monitor[];
  incidents: Incident[];
  stats: {
    totalUptime: number;
    averageResponseTime: number;
    totalIncidents: number;
  };
} 