import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Incident } from "../types";

interface IncidentListProps {
  incidents: Incident[];
  onIncidentSelect: (incident: Incident) => void;
}

export default function IncidentList({ incidents, onIncidentSelect }: IncidentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "down":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "maintenance":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Incidents</h2>

        <div className="space-y-4">
          {incidents?.map((incident, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onIncidentSelect(incident)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(incident.status)}
                  <span className="font-medium">Incident #{incident.id}</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {incident.status}
                </Badge>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  {new Date(incident.startTime).toLocaleString()} -{" "}
                  {new Date(incident.endTime).toLocaleString()}
                </p>
                <p className="mt-1">
                  Duration: {formatDuration(incident.startTime, incident.endTime)}
                </p>
              </div>

              <div className="text-sm">
                <p className="font-medium">Error Details:</p>
                <p className="text-gray-600 mt-1">{incident.error}</p>
              </div>

              {incident.affectedVisitors && (
                <div className="text-sm text-gray-500">
                  <p>Estimated Impact: {incident.affectedVisitors} visitors affected</p>
                </div>
              )}
            </div>
          ))}

          {(!incidents || incidents.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No incidents reported in the last 30 days
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 