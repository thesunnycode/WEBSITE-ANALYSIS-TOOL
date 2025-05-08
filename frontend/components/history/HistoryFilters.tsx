"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Search, Calendar, Filter } from "lucide-react";

interface Filters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  search: string;
  type: string;
  scoreRange: {
    min: number;
    max: number;
  };
}

interface HistoryFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export function HistoryFilters({ filters, setFilters }: HistoryFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const analysisTypes = [
    { value: "all", label: "All Types" },
    { value: "performance", label: "Performance" },
    { value: "seo", label: "SEO" },
    { value: "security", label: "Security" },
    { value: "uptime", label: "Uptime" },
  ];

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters({
      ...filters,
      dateRange: { start, end },
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by URL..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-dark-lighter rounded-lg border border-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <DatePicker
            selectsRange
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            onChange={handleDateRangeChange}
            placeholderText="Select date range..."
            className="w-full pl-10 pr-4 py-2 bg-dark-lighter rounded-lg border border-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Analysis Type Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-dark-lighter rounded-lg border border-white/5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {analysisTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div>
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>Advanced Filters</span>
          <motion.span
            animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
            className="text-xs"
          >
            ▼
          </motion.span>
        </button>

        {/* Advanced Filters Content */}
        <motion.div
          initial={false}
          animate={{
            height: isAdvancedOpen ? "auto" : 0,
            opacity: isAdvancedOpen ? 1 : 0,
          }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-4">
            {/* Score Range Slider */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Score Range</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange.min}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      scoreRange: {
                        ...filters.scoreRange,
                        min: Number(e.target.value),
                      },
                    })
                  }
                  className="flex-1"
                />
                <span className="text-white min-w-[4rem] text-center">
                  {filters.scoreRange.min} - {filters.scoreRange.max}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange.max}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      scoreRange: {
                        ...filters.scoreRange,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
