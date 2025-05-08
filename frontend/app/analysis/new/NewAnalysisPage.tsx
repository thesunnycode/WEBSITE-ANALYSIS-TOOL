"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BarChart2,
  Search,
  Shield,
  Activity,
  CheckCircle,
  Brain,
  Gauge,
  ChevronRight,
  Clock,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import Image from "next/image";

interface AnalysisOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime?: string;
  recommended?: boolean;
  category?: "performance" | "security" | "optimization";
}

interface ExampleWebsite {
  name: string;
  url: string;
  description: string;
  logo?: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  const exampleWebsites: ExampleWebsite[] = [
    {
      name: "Google",
      url: "https://www.google.com",
      description: "World's most popular search engine",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E",
    },
    {
      name: "GitHub",
      url: "https://github.com",
      description: "Leading software development platform",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23181717' d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'/%3E%3C/svg%3E",
    },
    {
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      description: "Developer Q&A community",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23F58025' d='M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.705 4.53.903-1.95-9.706-4.53-.902 1.95zm2.715-4.785l8.217 6.855 1.359-1.62-8.216-6.853-1.36 1.618zM15.751 0l-1.746 1.294 6.405 8.604 1.746-1.294L15.749 0z'/%3E%3C/svg%3E",
    },
    {
      name: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      description: "Web development documentation",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M0 0v24h24V0H0zm21.6 21.6H2.4V2.4h19.2v19.2z M7.2 15.6h2.4v-4.8H12v4.8h2.4V8.4H7.2v7.2z'/%3E%3C/svg%3E",
    },
  ];

  const analysisOptions: AnalysisOption[] = [
    {
      id: "performance",
      label: "Performance Analysis",
      description: "Analyze loading speed and performance metrics",
      icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
      estimatedTime: "2-3 min",
      recommended: true,
      category: "performance",
    },
    {
      id: "seo",
      label: "SEO Audit",
      description: "Check search engine optimization factors",
      icon: <Search className="w-6 h-6 text-purple-400" />,
      estimatedTime: "3-4 min",
      category: "optimization",
    },
    {
      id: "security",
      label: "Security Check",
      description: "Scan for security vulnerabilities",
      icon: <Shield className="w-6 h-6 text-red-400" />,
      estimatedTime: "4-5 min",
      recommended: true,
      category: "security",
    },
    {
      id: "accessibility",
      label: "Accessibility Check",
      description: "Evaluate WCAG compliance and accessibility features",
      icon: <Gauge className="w-6 h-6 text-green-400" />,
      estimatedTime: "2-3 min",
      category: "optimization",
    },
    {
      id: "uptime",
      label: "Uptime Monitoring",
      description: "Monitor website availability and response time",
      icon: <Activity className="w-6 h-6 text-yellow-400" />,
      estimatedTime: "1-2 min",
      category: "performance",
    },
    {
      id: "ai_insights",
      label: "AI Insights",
      description: "Get intelligent recommendations and analysis",
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      estimatedTime: "3-4 min",
      category: "optimization",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setCurrentStep(2);
  };

  const toggleOption = (optionId: string) => {
    const newSelectedOptions = new Set(selectedOptions);
    if (newSelectedOptions.has(optionId)) {
      newSelectedOptions.delete(optionId);
    } else {
      newSelectedOptions.add(optionId);
    }
    setSelectedOptions(newSelectedOptions);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (selectedOptions.size === 0) {
      toast.error("Please select at least one analysis option");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/website-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          options: Array.from(selectedOptions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // More descriptive error message based on status
        let errorMessage = data.message || "Failed to start analysis";
        if (response.status === 401) {
          errorMessage = "Please log in to start analysis";
        } else if (response.status === 503) {
          errorMessage = "Service is currently unavailable";
        }

        toast.error(errorMessage);
        return;
      }

      // Extract analysis ID from the response
      const analysisId = data?.data?.id || data?.analysisId;
      if (!analysisId) {
        toast.error("Invalid server response");
        return;
      }

      toast.success("Analysis started successfully");
      router.push(`/analysis/${analysisId}`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to start analysis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  if (!mounted) return null;

  return (
    <div className="p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className="w-24 h-1 mx-2 bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: currentStep > step ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-sm text-gray-400">
            <span>Enter URL</span>
            <span>Select Options</span>
            <span>Start Analysis</span>
          </div>
        </div>

        {/* URL Input Section */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full h-12 pl-4 pr-12 bg-gray-800 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <div className="absolute right-3 top-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Example Websites */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                Popular Examples
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exampleWebsites.map((website) => (
                  <motion.div
                    key={website.name}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700"
                    onClick={() => handleExampleClick(website.url)}
                  >
                    <div className="flex items-center mb-2">
                      {website.logo && (
                        <img
                          src={website.logo}
                          alt={website.name}
                          className="w-6 h-6 mr-2"
                        />
                      )}
                      <h4 className="font-medium">{website.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      {website.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Options */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Choose Analysis Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisOptions.map((option) => (
              <motion.div
                key={option.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedOptions.has(option.id)
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">{option.icon}</div>
                  <div className="ml-4">
                    <h4 className="font-semibold flex items-center">
                      {option.label}
                      {option.recommended && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {option.estimatedTime}
                  </div>
                  {selectedOptions.has(option.id) && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !url || selectedOptions.size === 0}
            className={`h-12 px-8 text-lg font-medium rounded-lg transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Starting Analysis...
              </div>
            ) : (
              <div className="flex items-center">
                Start Analysis
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
