import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  active?: boolean;
  onRemove?: () => void;
}

export function StatCard({ title, value, subtitle, trend, icon, active, onRemove, className, ...props }: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer",
        active 
          ? "border-neutral-700 bg-neutral-800/80 shadow-md" 
          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700/80 hover:bg-neutral-800/50",
        className
      )}
      {...props}
    >
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 p-1 bg-neutral-800/80 hover:bg-rose-500 hover:text-white text-neutral-400 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      
      <div className="flex items-center justify-between mb-3 sm:mb-4 pr-4">
        <h3 className="text-xs sm:text-sm font-medium text-neutral-400 flex items-center gap-1.5 sm:gap-2">
          {icon && <span className="text-neutral-500 shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h3>
        {trend !== undefined && (
          <span 
            className={cn(
              "flex items-center text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shrink-0",
              isPositive ? "text-emerald-400 bg-emerald-400/10" : 
              isNegative ? "text-rose-400 bg-rose-400/10" : 
              "text-neutral-400 bg-neutral-400/10"
            )}
          >
            {isPositive && <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
            {isNegative && <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
            {Math.abs(trend).toFixed(2)}%
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <span className="text-lg sm:text-2xl font-semibold tracking-tight text-neutral-100 truncate">
          {value}
        </span>
        {subtitle && (
          <span className="text-[10px] sm:text-xs text-neutral-500 font-medium truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
