'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface SparklineChartProps {
  data: { [key: string]: any }[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  strokeWidth?: number;
  className?: string;
}

const SparklineChart = ({ 
  data = [], 
  color = '#10b981', 
  height = 40, 
  showTooltip = false,
  strokeWidth = 2,
  className = ''
}: SparklineChartProps) => {
  // Format data if it's not already in the right format
  const formattedData = data.map((item, index) => {
    if (typeof item === 'number') {
      return { value: item, index };
    } else if (typeof item === 'object') {
      return { ...item, index };
    }
    return { value: 0, index };
  });

  return (
    <div className={`h-full w-full ${className}`} style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          {showTooltip && (
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [value, 'Value']}
              labelFormatter={(index) => `Point ${index + 1}`}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;