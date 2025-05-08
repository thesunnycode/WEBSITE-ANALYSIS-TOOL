"use client";

import { useState, useEffect } from "react";
import { InfoIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { client } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/config";

interface FormData {
  url: string;
  options: {
    performance: boolean;
    security: boolean;
    seo: boolean;
    uptime: boolean;
    accessibility: boolean;
    ai_insights: boolean;
  };
}

interface WebsiteAnalysis {
  id: string;
  url: string;
  // Add other fields as needed
}

export default function NewAnalysisForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    url: "",
    options: {
      performance: false,
      security: false,
      seo: false,
      uptime: false,
      accessibility: false,
      ai_insights: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error("Please enter a website URL");
      return;
    }

    if (!Object.values(formData.options).some((value) => value)) {
      toast.error("Please select at least one analysis option");
      return;
    }

    setIsLoading(true);

    try {
      // Get token from localStorage or your auth context
      const token = localStorage.getItem("token");

      console.log("Starting analysis for URL:", formData.url); // Debug log

      // Step 1: Create a new website analysis
      const analysis = await client(API_ROUTES.websiteAnalysis, {
        method: "POST",
        token,
        body: JSON.stringify({ url: formData.url }),
      });

      console.log("Analysis created:", analysis); // Debug log

      if (!analysis?.id) {
        throw new Error("Invalid analysis response");
      }

      // Step 2: Trigger selected analysis types in parallel
      const analysisPromises = [];

      if (formData.options.performance) {
        analysisPromises.push(
          client(API_ROUTES.performance(analysis.id), {
            method: "POST",
            token,
            body: JSON.stringify({ url: formData.url }),
          })
        );
      }

      if (formData.options.security) {
        analysisPromises.push(
          client(API_ROUTES.security(analysis.id), {
            method: "POST",
            token,
            body: JSON.stringify({ url: formData.url }),
          })
        );
      }

      if (formData.options.seo) {
        analysisPromises.push(
          client(API_ROUTES.seo(analysis.id), {
            method: "POST",
            token,
            body: JSON.stringify({ url: formData.url }),
          })
        );
      }

      if (formData.options.uptime) {
        analysisPromises.push(
          client(API_ROUTES.uptime, {
            method: "POST",
            token,
            body: JSON.stringify({
              url: formData.url,
              name: `Monitor for ${formData.url}`,
              interval: 300,
              locations: ["us-east", "eu-central"],
              notifications: {
                email: {
                  enabled: false,
                  recipients: [],
                },
              },
            }),
          })
        );
      }

      if (formData.options.accessibility) {
        analysisPromises.push(
          client(API_ROUTES.accessibility(analysis.id), {
            method: "POST",
            token,
            body: JSON.stringify({ url: formData.url }),
          })
        );
      }

      if (formData.options.ai_insights) {
        analysisPromises.push(
          client(API_ROUTES.aiInsights(analysis.id), {
            method: "POST",
            token,
            body: JSON.stringify({ url: formData.url }),
          })
        );
      }

      // Wait for all analysis requests to complete
      await Promise.all(analysisPromises);

      toast.success("Analysis started successfully!");
      router.push(`/analysis/results?id=${analysis.id}`);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(
        error.message || "Failed to start analysis. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      suppressHydrationWarning
    >
      {/* URL Input Bento Box */}
      <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10">
        <label className="block mb-4">
          <span className="text-2xl font-semibold text-white mb-2 block">
            Website URL
          </span>
          <div className="relative">
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
              required
              pattern="^https?:\/\/.*"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                       text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <InfoIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-help" />
            </div>
          </div>
        </label>
      </div>

      {/* Analysis Options Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Analysis Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.options).map(([key, value]) => (
            <div
              key={key}
              className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10 
                         transition-all duration-300 hover:bg-white/10 cursor-pointer
                         group"
              onClick={() =>
                setFormData({
                  ...formData,
                  options: {
                    ...formData.options,
                    [key]: !value,
                  },
                })
              }
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => {}}
                  className="w-5 h-5 mt-1 rounded border-white/20 text-blue-500 
                           focus:ring-blue-500 focus:ring-offset-0 bg-white/5"
                />
                <div>
                  <h3 className="text-lg font-medium text-white capitalize mb-1">
                    {key}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {getOptionDescription(key)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 text-xl font-semibold text-white 
                 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
                 rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800
                 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50
                 transition-all duration-300 relative overflow-hidden"
      >
        <span className={`${isLoading ? "opacity-0" : "opacity-100"}`}>
          Start Analysis
        </span>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
    </form>
  );
}

function getOptionDescription(option: string): string {
  const descriptions = {
    performance:
      "Analyze loading speed, Core Web Vitals, and overall performance metrics",
    security:
      "Check for SSL certificates, vulnerabilities, and security headers",
    seo: "Evaluate meta tags, content structure, and search engine optimization",
    uptime: "Monitor website availability and response time",
  };
  return descriptions[option as keyof typeof descriptions] || "";
}
