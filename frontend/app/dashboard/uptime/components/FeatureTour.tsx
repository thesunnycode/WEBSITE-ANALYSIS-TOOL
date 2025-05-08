import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface FeatureTourProps {
  onClose: () => void;
}

const features = [
  {
    title: "Real-time Monitoring",
    description: "Get instant updates about your website's status and performance.",
    icon: "📊",
  },
  {
    title: "Custom Alerts",
    description: "Configure notifications for downtime, slow response times, and more.",
    icon: "🔔",
  },
  {
    title: "Status Page",
    description: "Share your service status with users through a public status page.",
    icon: "🌐",
  },
  {
    title: "Detailed Reports",
    description: "Access comprehensive reports about your website's uptime and performance.",
    icon: "📈",
  },
];

export function FeatureTour({ onClose }: FeatureTourProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out animation
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg animate-in slide-in-from-bottom-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{features[currentFeature].icon}</span>
            <h3 className="font-medium">{features[currentFeature].title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {features[currentFeature].description}
        </p>
        <div className="flex justify-center space-x-1 mt-3">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentFeature ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 