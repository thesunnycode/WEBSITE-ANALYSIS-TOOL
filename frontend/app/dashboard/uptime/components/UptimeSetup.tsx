import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface UptimeSetupProps {
  onSetupComplete: () => void;
}

export default function UptimeSetup({ onSetupComplete }: UptimeSetupProps) {
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("5");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/uptime-monitor/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, checkFrequency: parseInt(frequency) }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Setup Complete",
          description: "Your website is now being monitored.",
        });
        onSetupComplete();
      } else {
        throw new Error(data.message || "Setup failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup monitoring",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Setup Uptime Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              Check Frequency
            </label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every minute</SelectItem>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetupComplete()}
              disabled={loading}
            >
              Skip Setup
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Monitoring
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 