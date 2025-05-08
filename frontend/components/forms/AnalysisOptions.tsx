"use client";

import { InfoIcon } from "lucide-react";
import Tooltip from "../modals/Tooltip";

interface AnalysisOptionsProps {
  performance: boolean;
  security: boolean;
  seo: boolean;
  uptime: boolean;
  accessibility: boolean;
  "ai-insights": boolean;
  onChange: (name: string, value: boolean) => void;
}

const optionDescriptions = {
  performance: "Analyze loading speed and performance metrics",
  security: "Check for security vulnerabilities and best practices",
  seo: "Evaluate search engine optimization factors",
  uptime: "Monitor website availability and response time",
  accessibility: "Evaluate WCAG compliance and accessibility features",
  "ai-insights": "Get intelligent recommendations and insights powered by AI",
};

export default function AnalysisOptions({
  options,
  onChange,
}: AnalysisOptionsProps) {
  const handleOptionChange = (option: keyof typeof options) => {
    onChange(option, !options[option as keyof typeof options]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Analysis Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(options).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={() => handleOptionChange(key as keyof typeof options)}
              className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor={key} className="ml-3 flex items-center gap-2">
              <span className="text-white capitalize">{key}</span>
              <Tooltip
                content={
                  optionDescriptions[key as keyof typeof optionDescriptions]
                }
              >
                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </Tooltip>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
