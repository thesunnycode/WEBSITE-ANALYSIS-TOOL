"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { UptimeStatus } from "./components/UptimeStatus";
import UptimeTimeline from "./components/UptimeTimeline";
import IncidentList from "./components/IncidentList";
import AlertSettings from "./components/AlertSettings";
import StatusPage from "./components/StatusPage";
import UptimeSetup from "./components/UptimeSetup";
import { WelcomeGuide } from "./components/WelcomeGuide";
import { FeatureTour } from "./components/FeatureTour";
import { IncidentDetails } from "./components/IncidentDetails";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import type { MonitorData, Incident } from "./types";

export default function UptimePage() {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFeatureTour, setShowFeatureTour] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMonitorData();
  }, []);

  const fetchMonitorData = async () => {
    try {
      const response = await fetch("/api/uptime-monitor");
      const data = await response.json();
      if (data.success) {
        setMonitorData(data.data);
        setShowSetup(data.data.monitors.length === 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch uptime data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentUpdate = async (incidentId: string, updates: any) => {
    try {
      const response = await fetch(`/api/uptime-monitor/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        fetchMonitorData();
        setSelectedIncident(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update incident",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (showSetup) {
    return <UptimeSetup onSetupComplete={() => setShowSetup(false)} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {showWelcome && (
        <WelcomeGuide onComplete={() => setShowWelcome(false)} />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Uptime Monitoring</h1>
        <Button onClick={() => setShowSetup(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UptimeStatus data={monitorData} />
        <StatusPage />
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <UptimeTimeline />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentList
            onIncidentSelect={setSelectedIncident}
            incidents={monitorData?.incidents || []}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertSettings />
        </TabsContent>
      </Tabs>

      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={handleIncidentUpdate}
        />
      )}

      {showFeatureTour && (
        <FeatureTour onClose={() => setShowFeatureTour(false)} />
      )}
    </div>
  );
} 