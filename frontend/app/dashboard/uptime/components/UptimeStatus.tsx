import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface UptimeStatusProps {
  data: any; // Replace with proper type
}

export function UptimeStatus({ data }: UptimeStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
        return "bg-[#34C759]"; // Green
      case "down":
        return "bg-[#FF3B30]"; // Red
      case "maintenance":
        return "bg-[#007AFF]"; // Blue
      case "warning":
        return "bg-[#FFCC00]"; // Amber
      default:
        return "bg-[#8E8E93]"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="w-5 h-5 text-[#34C759]" />;
      case "down":
        return <AlertCircle className="w-5 h-5 text-[#FF3B30]" />;
      case "maintenance":
        return <Clock className="w-5 h-5 text-[#007AFF]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[#FFCC00]" />;
      default:
        return null;
    }
  };

  const getStatusAriaLabel = (status: string) => {
    switch (status) {
      case "up":
        return "System is operational";
      case "down":
        return "System is experiencing downtime";
      case "maintenance":
        return "System is under maintenance";
      case "warning":
        return "System is experiencing issues";
      default:
        return "System status unknown";
    }
  };

  return (
    <Card className="p-6" role="region" aria-label="System Status">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium" id="status-title">Current Status</h2>
          <Badge 
            variant="outline" 
            className={getStatusColor(data?.status)}
            aria-labelledby="status-title"
            aria-label={getStatusAriaLabel(data?.status)}
          >
            <span className="text-[16px] font-bold">{data?.status?.toUpperCase()}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4" role="list" aria-label="Status Metrics">
          <div className="space-y-2" role="listitem">
            <p className="text-[14px] text-gray-500">Uptime (30 days)</p>
            <p className="text-[16px] font-bold" aria-label={`${data?.uptimeStats?.monthly} percent uptime`}>
              {data?.uptimeStats?.monthly}%
            </p>
          </div>
          <div className="space-y-2" role="listitem">
            <p className="text-[14px] text-gray-500">Response Time</p>
            <p className="text-[16px] font-bold" aria-label={`${data?.responseTimeStats?.average} milliseconds response time`}>
              {data?.responseTimeStats?.average}ms
            </p>
          </div>
        </div>

        <div className="pt-4 border-t" role="list" aria-label="Check Times">
          <div className="flex items-center justify-between" role="listitem">
            <span className="text-[12px] text-gray-500">Last Check</span>
            <span className="text-[12px]" aria-label={`Last checked at ${new Date(data?.lastCheck).toLocaleString()}`}>
              {new Date(data?.lastCheck).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2" role="listitem">
            <span className="text-[12px] text-gray-500">Next Check</span>
            <span className="text-[12px]" aria-label={`Next check at ${new Date(data?.nextCheck).toLocaleString()}`}>
              {new Date(data?.nextCheck).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2" role="status" aria-live="polite">
          {getStatusIcon(data?.status)}
          <span className="text-[14px] text-gray-500">
            {data?.status === "up" ? "All systems operational" : "Issues detected"}
          </span>
        </div>
      </div>
    </Card>
  );
} 