import React, { useState, useMemo, type JSX } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
}

interface DataPoint {
  date: string;
  [key: string]: any;
}

interface TimelineChartProps {
  data?: DataPoint[];
  height?: number;
  lines?: LineConfig[];
  timeFormat?: 'day' | 'month' | 'year';
  tooltipFormatter?: (value: any, name: string, dataKey: string) => [string | number, string];
  showGrid?: boolean;
  showLegend?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  strokeWidth?: number;
  connectNulls?: boolean;
  allowZoom?: boolean;
  darkMode?: boolean;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface ColorScheme {
  background: string;
  text: string;
  gridLines: string;
  axis: string;
}

export default function TimelineChart({ 
  data = [],
  height = 400,
  lines = [
    { dataKey: 'value', name: 'Value', color: '#3b82f6' }
  ],
  timeFormat = 'day',
  tooltipFormatter,
  showGrid = true,
  showLegend = true,
  yAxisLabel = '',
  xAxisLabel = '',
  strokeWidth = 2,
  connectNulls = true,
  allowZoom = true,
  darkMode = false
}: TimelineChartProps): JSX.Element {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  
  // Color scheme
  const colors: ColorScheme = darkMode ? {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    gridLines: '#374151',
    axis: '#9ca3af'
  } : {
    background: 'bg-white',
    text: 'text-gray-800',
    gridLines: '#e5e7eb',
    axis: '#6b7280'
  };

  // Process data based on time format
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Filter by date range if set
    let filteredData = [...data];
    if (dateRange.start && dateRange.end) {
      filteredData = data.filter(item => {
        const date = new Date(item.date);
        return (!dateRange.start || date >= dateRange.start) && (!dateRange.end || date <= dateRange.end);
      });
    }
    
    return filteredData;
  }, [data, dateRange]);

  // Format dates based on timeFormat
  const formatXAxis = (dateStr: string): string => {
    const date = new Date(dateStr);
    
    if (timeFormat === 'day') {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else if (timeFormat === 'month') {
      return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    } else if (timeFormat === 'year') {
      return date.getFullYear().toString();
    }
    
    return dateStr;
  };

  // Custom tooltip formatter
  const defaultTooltipFormatter = (value: any, name: string): [any, string] => {
    return [value, name];
  };
  
  const formatter = tooltipFormatter || defaultTooltipFormatter;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any): JSX.Element | null => {
    if (active && payload && payload.length) {
      return (
        <div className={`${colors.background} p-3 border border-gray-300 rounded shadow-md ${colors.text}`}>
          <p className="font-medium mb-1">{formatXAxis(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium mr-2">{entry.name}:</span>
              <span>{formatter(entry.value, entry.name, entry.dataKey)[0]}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handle zoom functionality
  const handleZoom = (startIndex: number, endIndex: number): void => {
    if (!allowZoom || processedData.length === 0) return;
    
    const start = new Date(processedData[startIndex].date);
    const end = new Date(processedData[endIndex].date);
    
    setDateRange({ start, end });
  };

  // Reset zoom
  const resetZoom = (): void => {
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-glass">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Timeline Chart</h3>
        {allowZoom && dateRange.start && (
          <button 
            onClick={resetZoom} 
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Reset Zoom
          </button>
        )}
      </div>
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            onMouseDown={(e: any) => allowZoom && e && e.activeTooltipIndex !== undefined && setDateRange({ ...dateRange, start: new Date(processedData[e.activeTooltipIndex].date) })}
            onMouseMove={(e: any) => allowZoom && e && e.activeTooltipIndex !== undefined && dateRange.start && setDateRange({ ...dateRange, end: new Date(processedData[e.activeTooltipIndex].date) })}
            onMouseUp={() => allowZoom && dateRange.start && dateRange.end && handleZoom(
              processedData.findIndex(d => new Date(d.date).getTime() === dateRange.start!.getTime()),
              processedData.findIndex(d => new Date(d.date).getTime() === dateRange.end!.getTime())
            )}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              stroke={colors.axis}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: colors.text }}
            />
            <YAxis 
              stroke={colors.axis}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, fill: colors.text }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-white">{value}</span>}
              />
            )}
            {lines.map((line, index) => (
              <Line
                key={`line-${index}`}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={strokeWidth}
                connectNulls={connectNulls}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}