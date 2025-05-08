import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Download, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TimelineData {
  date: string;
  status: "up" | "down" | "maintenance";
  duration: number;
  incidents: Array<{
    id: string;
    startTime: string;
    endTime: string;
    type: string;
    description: string;
  }>;
}

export default function UptimeTimeline() {
  const [timeRange, setTimeRange] = useState("7");
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTimelineData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/uptime/timeline?timeRange=${timeRange}`
      );
      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error("Failed to fetch timeline data:", error);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  const exportTimelineData = async () => {
    try {
      const response = await fetch(
        `/api/uptime-monitor/timeline/export?days=${timeRange}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uptime-timeline-${timeRange}-days.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export timeline data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
        return "bg-green-500";
      case "down":
        return "bg-red-500";
      case "maintenance":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Uptime Timeline</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportTimelineData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {timelineData.map((day) => (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {day.duration}% uptime
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(day.status)}`}
                    style={{ width: `${day.duration}%` }}
                  />
                </div>
                {day.incidents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {day.incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {incident.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
