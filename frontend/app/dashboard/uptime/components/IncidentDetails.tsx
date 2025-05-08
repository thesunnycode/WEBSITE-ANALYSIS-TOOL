import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Clock, CheckCircle, Wrench } from "lucide-react";
import { Incident } from "../types";

interface IncidentDetailsProps {
  incident: Incident;
  onClose: () => void;
  onUpdate: (incidentId: string, updates: Partial<Incident>) => Promise<void>;
}

export function IncidentDetails({
  incident,
  onClose,
  onUpdate,
}: IncidentDetailsProps) {
  const [isMaintenance, setIsMaintenance] = useState(
    incident.status === "maintenance"
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMaintenanceToggle = async () => {
    setLoading(true);
    try {
      await onUpdate(incident.id, {
        status: isMaintenance ? "down" : "maintenance",
      });
      setIsMaintenance(!isMaintenance);
      toast({
        title: "Status Updated",
        description: `Incident marked as ${
          isMaintenance ? "active" : "maintenance"
        }`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (incident.status) {
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "maintenance":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "Ongoing";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle>Incident #{incident.id}</CardTitle>
          <Badge
            variant={
              incident.status === "resolved"
                ? "success"
                : incident.status === "maintenance"
                ? "secondary"
                : "destructive"
            }
          >
            {incident.status.toUpperCase()}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">{incident.error}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p className="font-medium">
              {new Date(incident.startTime).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {formatDuration(incident.startTime, incident.endTime)}
            </p>
          </div>
        </div>

        {incident.affectedVisitors && (
          <div>
            <p className="text-sm text-gray-500">Impact</p>
            <p className="font-medium">
              {incident.affectedVisitors.toLocaleString()} users affected
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isMaintenance}
              onCheckedChange={handleMaintenanceToggle}
              disabled={loading || incident.status === "resolved"}
            />
            <span className="text-sm">Mark as Maintenance</span>
          </div>
          {incident.status === "down" && (
            <Button
              variant="outline"
              onClick={() => onUpdate(incident.id, { status: "resolved" })}
              disabled={loading}
            >
              Mark as Resolved
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 