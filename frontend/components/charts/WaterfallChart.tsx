import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

export interface WaterfallItem {
  name: string;
  value: number;
  isTotal?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  width?: number | string;
  height?: number | string;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  showLegend?: boolean;
  customTooltip?: React.FC<any>;
  valueFormatter?: (value: number) => string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  width = "100%",
  height = 400,
  positiveColor = "#3b82f6",
  negativeColor = "#ef4444",
  totalColor = "#6366f1",
  showLegend = true,
  customTooltip,
  valueFormatter = (value) => value.toLocaleString(),
}) => {
  // Process data to calculate running total
  const processedData = data.reduce<
    (WaterfallItem & { start: number; end: number })[]
  >((acc, item, index) => {
    if (index === 0) {
      // First item starts at 0
      return [
        {
          ...item,
          start: 0,
          end: item.value,
        },
      ];
    }

    const previousEnd = acc[index - 1].end;

    if (item.isTotal) {
      // For total items, we set the start to 0 and end to the specified value
      return [
        ...acc,
        {
          ...item,
          start: 0,
          end: item.value,
        },
      ];
    } else {
      // Regular items continue from previous end
      return [
        ...acc,
        {
          ...item,
          start: previousEnd,
          end: previousEnd + item.value,
        },
      ];
    }
  }, []);

  // Custom tooltip component
  const DefaultTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            {data.value >= 0 ? "+" : ""}
            {valueFormatter(data.value)}
          </p>
          {!data.isTotal && (
            <p className="text-sm text-gray-500">
              Total: {valueFormatter(data.end)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <ComposedChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" scale="band" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && (
          <Legend
            payload={[
              { value: "Increase", type: "rect", color: positiveColor },
              { value: "Decrease", type: "rect", color: negativeColor },
              { value: "Total", type: "rect", color: totalColor },
            ]}
          />
        )}
        <ReferenceLine y={0} stroke="#000" />
        <Bar
          dataKey="value"
          stackId="stack"
          radius={[4, 4, 0, 0]}
          fill={(entry) => {
            if (entry.isTotal) return totalColor;
            return entry.value >= 0 ? positiveColor : negativeColor;
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WaterfallChart;
