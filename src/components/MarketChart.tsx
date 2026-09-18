import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import type { ChartDataPoint } from '../types';

interface MarketChartProps {
  data: ChartDataPoint[];
  color?: string;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg shadow-xl">
        <p className="text-neutral-400 text-xs mb-2">
          {format(new Date(label), 'MMM dd, HH:mm')}
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-neutral-200 text-sm font-medium flex justify-between gap-4">
            <span>Price:</span>
            <span>${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          {payload[1] && (
            <p className="text-neutral-400 text-xs flex justify-between gap-4">
              <span>Vol:</span>
              <span>{payload[1].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function MarketChart({ data, color = "#F7931A", isLoading }: MarketChartProps) {
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-neutral-500 text-sm">No chart data available</span>
      </div>
    );
  }

  // Calculate dynamic min/max for Y-axis to make variations more visible
  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const diff = maxPrice - minPrice;
  const yMin = Math.max(0, minPrice - diff * 0.1);
  const yMax = maxPrice + diff * 0.1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis 
          dataKey="time" 
          tickFormatter={(time) => format(new Date(time), 'HH:mm')} 
          stroke="#525252"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          yAxisId="price"
          domain={[yMin, yMax]} 
          tickFormatter={(val) => `$${val.toLocaleString()}`}
          stroke="#525252"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dx={-10}
          orientation="right"
          width={window.innerWidth < 640 ? 0 : 60}
          hide={window.innerWidth < 640}
        />
        <YAxis 
          yAxisId="volume"
          orientation="left"
          stroke="#525252"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          hide={true} // Hide volume axis to keep it clean
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          yAxisId="volume"
          dataKey="volume" 
          fill="#3f3f46" 
          opacity={0.3}
          radius={[2, 2, 0, 0]}
        />
        <Area 
          yAxisId="price"
          type="monotone" 
          dataKey="close" 
          stroke={color} 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorPrice)" 
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
