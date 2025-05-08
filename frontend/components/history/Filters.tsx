"use client";

import { motion } from "framer-motion";
import { FiZap, FiSearch, FiUsers } from "react-icons/fi";
import { Select, SelectItem } from "@tremor/react";

interface FiltersProps {
  filters: {
    performanceScore: string;
    seoScore: string;
    accessibilityScore: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      performanceScore: string;
      seoScore: string;
      accessibilityScore: string;
    }>
  >;
}

const scoreOptions = [
  { value: "all", label: "All Scores" },
  { value: "excellent", label: "Excellent (90-100)" },
  { value: "good", label: "Good (70-89)" },
  { value: "moderate", label: "Moderate (50-69)" },
  { value: "poor", label: "Poor (0-49)" },
];

export default function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Filter Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Score Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="w-5 h-5 text-blue-400" />
            <label className="text-sm font-medium text-white">
              Performance Score
            </label>
          </div>
          <Select
            value={filters.performanceScore}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, performanceScore: value }))
            }
            className="mt-1"
          >
            {scoreOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* SEO Score Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiSearch className="w-5 h-5 text-purple-400" />
            <label className="text-sm font-medium text-white">SEO Score</label>
          </div>
          <Select
            value={filters.seoScore}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, seoScore: value }))
            }
            className="mt-1"
          >
            {scoreOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Accessibility Score Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="w-5 h-5 text-green-400" />
            <label className="text-sm font-medium text-white">
              Accessibility Score
            </label>
          </div>
          <Select
            value={filters.accessibilityScore}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, accessibilityScore: value }))
            }
            className="mt-1"
          >
            {scoreOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() =>
            setFilters({
              performanceScore: "excellent",
              seoScore: "excellent",
              accessibilityScore: "excellent",
            })
          }
          className="px-3 py-1 text-sm rounded-full bg-green-400/10 text-green-400 
            hover:bg-green-400/20 transition-colors"
        >
          High Performers
        </button>
        <button
          onClick={() =>
            setFilters({
              performanceScore: "poor",
              seoScore: "poor",
              accessibilityScore: "poor",
            })
          }
          className="px-3 py-1 text-sm rounded-full bg-red-400/10 text-red-400 
            hover:bg-red-400/20 transition-colors"
        >
          Needs Improvement
        </button>
        <button
          onClick={() =>
            setFilters({
              performanceScore: "all",
              seoScore: "all",
              accessibilityScore: "all",
            })
          }
          className="px-3 py-1 text-sm rounded-full bg-gray-400/10 text-gray-400 
            hover:bg-gray-400/20 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </motion.div>
  );
}
