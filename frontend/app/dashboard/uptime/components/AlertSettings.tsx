import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Bell, Plus } from "lucide-react";

export default function AlertSettings() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alert Settings</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email Notifications</label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when services go down
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Slack Integration</label>
              <p className="text-sm text-muted-foreground">
                Send alerts to your Slack workspace
              </p>
            </div>
            <Switch />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Notification Channel</label>
                <Select defaultValue="email">
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Recipient</label>
                <Input placeholder="Enter recipient" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 