import React, { type JSX } from 'react';
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatsCardProps {
  title?: string;
  value?: number | string;
  previousValue?: number | null;
  icon?: React.ReactNode;
  iconBackground?: string;
  iconColor?: string;
  changeType?: 'percentage' | 'value' | 'none';
  changeTimeframe?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  trendDirection?: 'up' | 'down';
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
}

type ChangeData = {
  value: number;
  text: string;
  direction: 'positive' | 'negative' | 'neutral';
};

export default function StatsCard({
  title = "Statistic",
  value = "0",
  previousValue = null,
  icon = null,
  iconBackground = "bg-[#232c43]",
  iconColor = "text-blue-400",
  changeType = "percentage", 
  changeTimeframe = "vs last period",
  trend = "neutral",
  trendDirection = "up",
  format = "number",
  currency = "$"
}: StatsCardProps): JSX.Element {
  // Calculate change and format values
  const calculateChange = (): ChangeData => {
    if (previousValue === null) return { value: 0, text: "0", direction: "neutral" };
    
    const currentValue = typeof value === 'string' ? parseFloat(value) : value;
    const diff = currentValue - previousValue;
    
    // Determine direction based on difference and trend direction
    let direction: 'positive' | 'negative' | 'neutral' = "neutral";
    if (diff > 0) {
      direction = trendDirection === "up" ? "positive" : "negative";
    } else if (diff < 0) {
      direction = trendDirection === "up" ? "negative" : "positive";
    }
    
    // Format the change text
    let text: string;
    if (changeType === "percentage" && previousValue !== 0) {
      const percentChange = (diff / Math.abs(previousValue)) * 100;
      text = `${Math.abs(percentChange).toFixed(1)}%`;
    } else if (changeType === "value") {
      text = formatValue(Math.abs(diff), format, currency);
    } else {
      text = "0";
    }
    
    return { value: diff, text, direction };
  };
  
  const formatValue = (val: number | string, format: string, currency: string): string => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    if (format === "currency") {
      return `${currency}${Number(numVal).toLocaleString()}`;
    } else if (format === "percentage") {
      return `${Number(numVal).toFixed(1)}%`;
    } else {
      return Number(numVal).toLocaleString();
    }
  };
  
  const change = calculateChange();
  const formattedValue = formatValue(value, format, currency);
  
  // Determine trend colors and icons
  const getTrendColors = (direction: string): string => {
    if (direction === "positive") return "text-green-400 bg-green-900/30";
    if (direction === "negative") return "text-red-400 bg-red-900/30";
    return "text-gray-400 bg-gray-800/30";
  };
  
  const getTrendIcon = (direction: string): JSX.Element => {
    if (direction === "positive") return <ArrowUp size={16} />;
    if (direction === "negative") return <ArrowDown size={16} />;
    return <Minus size={16} />;
  };
  
  const trendColors = getTrendColors(change.direction);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-glass p-5 hover:shadow-glass-hover transition-shadow">
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <div className="text-2xl font-semibold text-white">{formattedValue}</div>
            
            {changeType !== "none" && previousValue !== null && (
              <span className={`ml-2 flex items-center text-sm font-medium rounded-full px-2 py-0.5 ${trendColors}`}>
                <span className="mr-1 flex items-center rounded-full">
                  {getTrendIcon(change.direction)}
                </span>
                {change.text}
              </span>
            )}
          </div>
        </div>
        
        {icon && (
          <div className={`rounded-md p-2 ${iconBackground} ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
      
      {changeType !== "none" && previousValue !== null && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">{changeTimeframe}</p>
        </div>
      )}
    </div>
  );
}