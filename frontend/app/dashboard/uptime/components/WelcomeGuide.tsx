import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { CheckCircle, ArrowRight } from "lucide-react";

interface WelcomeGuideProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Uptime Monitoring",
    description:
      "Monitor your website's availability and performance in real-time. Get instant alerts when issues occur.",
  },
  {
    title: "Add Your First Monitor",
    description:
      "Enter your website URL and choose how often you want to check its status. We'll start monitoring immediately.",
  },
  {
    title: "Configure Alerts",
    description:
      "Set up notifications via email, SMS, or webhooks to stay informed about your website's status.",
  },
  {
    title: "View Your Status Page",
    description:
      "Share your public status page with users to keep them informed about your service's health.",
  },
];

export function WelcomeGuide({ onComplete }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <Progress value={(currentStep / (steps.length - 1)) * 100} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
          <p className="text-gray-500">{steps[currentStep].description}</p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 