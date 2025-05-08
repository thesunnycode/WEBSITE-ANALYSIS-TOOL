import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  threshold?: {
    low?: number;
    medium?: number;
    high?: number;
  };
  colors?: {
    low?: string;
    medium?: string;
    high?: string;
    background?: string;
  };
  width?: number;
  height?: number;
  label?: string;
  unit?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  threshold = { low: 33, medium: 66, high: 100 },
  colors = {
    low: '#22c55e',    // green
    medium: '#f59e0b', // amber
    high: '#ef4444',   // red
    background: '#e5e7eb'
  },
  width = 300,
  height = 200,
  label,
  unit
}) => {
  // Ensure value is within range
  const clampedValue = Math.min(Math.max(value, min), max);
  
  // Calculate percentage
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  
  // Determine color based on thresholds
  let color = colors.high;
  if (percentage <= threshold.low) {
    color = colors.low;
  } else if (percentage <= threshold.medium) {
    color = colors.medium;
  }

  // Data for the gauge chart (2 segments - filled and empty)
  const data = [
    { name: 'value', value: percentage },
    { name: 'empty', value: 100 - percentage }
  ];

  // Gauge arc is 180 degrees (half circle)
  const startAngle = 180;
  const endAngle = 0;

  return (
    <div className="flex flex-col items-center w-full" style={{ width, height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
            cornerRadius={0}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={colors.background} />
            <Label
              value={`${Math.round(percentage)}${unit ? unit : '%'}`}
              position="center"
              className="text-xl font-bold"
              offset={-20}
            />
            {label && (
              <Label
                value={label}
                position="center"
                className="text-sm text-gray-500"
                offset={10}
              />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GaugeChart;