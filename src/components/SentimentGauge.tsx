import React from 'react';
import { cn } from '../lib/utils';

interface SentimentGaugeProps {
  priceChangePercent?: number;
}

export function SentimentGauge({ priceChangePercent = 0 }: SentimentGaugeProps) {
  // Clamp value between -10% and +10% for the visual gauge
  const clampedValue = Math.max(-10, Math.min(10, priceChangePercent));
  
  // Calculate percentage position (0% is -10, 50% is 0, 100% is +10)
  const position = ((clampedValue + 10) / 20) * 100;
  
  let sentiment = 'Neutral';
  let colorClass = 'text-neutral-400';
  
  if (priceChangePercent > 1.5) {
    sentiment = 'Bullish';
    colorClass = 'text-emerald-400';
  } else if (priceChangePercent < -1.5) {
    sentiment = 'Bearish';
    colorClass = 'text-rose-400';
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-neutral-500">Market Sentiment</span>
        <span className={cn("text-xs font-bold uppercase tracking-wider", colorClass)}>
          {sentiment}
        </span>
      </div>
      
      <div className="relative h-1.5 w-full rounded-full bg-gradient-to-r from-rose-500 via-neutral-700 to-emerald-500">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-900 z-0" />
        
        {/* Active Thumb/Marker */}
        <div 
          className="absolute top-1/2 -mt-2 w-1.5 h-4 bg-neutral-200 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out z-10"
          style={{ left: `calc(${position}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
    </div>
  );
}
