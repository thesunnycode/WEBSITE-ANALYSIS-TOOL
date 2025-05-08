import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

export interface TreemapItem {
  name: string;
  value: number;
  children?: TreemapItem[];
  color?: string;
}

interface TreemapChartProps {
  data: TreemapItem[];
  width?: number | string;
  height?: number | string;
  colorScale?: string[];
  valueFormatter?: (value: number) => string;
  animated?: boolean;
  customTooltip?: React.FC<any>;
  onClick?: (data: TreemapItem) => void;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  width = '100%',
  height = 400,
  colorScale = ['#3b82f6', '#4f46e5', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'],
  valueFormatter = (value) => value.toLocaleString(),
  animated = true,
  customTooltip,
  onClick,
}) => {
  // Helper to get color based on depth and index
  const getColor = (node: any) => {
    // If color is defined on the node, use it
    if (node.color) return node.color;
    
    // Calculate color based on depth and index
    const depth = node.depth || 0;
    const index = node.index || 0;
    const colorIndex = (depth + index) % colorScale.length;
    return colorScale[colorIndex];
  };

  // Default custom content for treemap cells
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    
    // Don't render text for very small rectangles
    if (width < 30 || height < 30) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getColor(props),
            stroke: '#fff',
            strokeWidth: 2,
            fillOpacity: depth === 1 ? 0.8 : 0.6,
          }}
          onClick={() => onClick && onClick(props)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="bold"
          fill="#fff"
          className="pointer-events-none"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#fff"
          className="pointer-events-none"
        >
          {valueFormatter(value)}
        </text>
      </g>
    );
  };

  // Default tooltip component
  const DefaultTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">{valueFormatter(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4/3}
        stroke="#fff"
        isAnimationActive={animated}
        animationDuration={500}
        content={<CustomizedContent />}
      >
        <Tooltip content={customTooltip || <DefaultTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
};

export default TreemapChart;