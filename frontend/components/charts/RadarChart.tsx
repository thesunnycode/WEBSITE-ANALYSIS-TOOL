import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

export interface RadarDataItem {
  name: string;
  [key: string]: string | number;
}

export interface RadarSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

interface RadarChartProps {
  data: RadarDataItem[];
  series: RadarSeries[];
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  fillOpacity?: number;
  gridCount?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showAxisLine?: boolean;
  angleAxisProps?: object;
  radiusAxisProps?: object;
  valueFormatter?: (value: number) => string;
  customTooltip?: React.FC<any>;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  series,
  width = '100%',
  height = 400,
  fill = true,
  fillOpacity = 0.3,
  gridCount = 5,
  showLegend = true,
  showGrid = true,
  showAxisLine = true,
  angleAxisProps = {},
  radiusAxisProps = {},
  valueFormatter = (value) => value.toString(),
  customTooltip,
}) => {
  // Default colors if not provided
  const defaultColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Default tooltip component
  const DefaultTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {valueFormatter(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsRadarChart 
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
      >
        {showGrid && <PolarGrid gridType="circle" gridCount={gridCount} />}
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          {...angleAxisProps}
        />
        {showAxisLine && (
          <PolarRadiusAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickFormatter={valueFormatter}
            {...radiusAxisProps}
          />
        )}
        
        {series.map((serie, index) => (
          <Radar
            key={`radar-${serie.dataKey}`}
            name={serie.name || serie.dataKey}
            dataKey={serie.dataKey}
            stroke={serie.color || defaultColors[index % defaultColors.length]}
            fill={fill ? serie.color || defaultColors[index % defaultColors.length] : 'none'}
            fillOpacity={fillOpacity}
            dot
            activeDot={{ r: 6 }}
          />
        ))}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && (
          <Legend
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;