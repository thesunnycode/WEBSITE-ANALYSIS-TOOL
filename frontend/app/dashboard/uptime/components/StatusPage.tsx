import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Globe, Settings } from "lucide-react";

export default function StatusPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status Page</CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">All Systems Operational</span>
          </div>

          <div className="space-y-2">
            {[
              { name: "Website", status: "operational" },
              { name: "API", status: "operational" },
              { name: "Database", status: "operational" },
              { name: "CDN", status: "operational" },
            ].map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{service.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground capitalize">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 