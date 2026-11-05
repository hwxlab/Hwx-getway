/**
 * HWX Gateway - Stats Card Component
 * Tabular figures, unboxed metadata, and high-density typography
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight tabular-nums">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            {trend && (
              <span className={`font-mono ${trendPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {trend}
              </span>
            )}
            {trend && subtitle && <span aria-hidden="true">·</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
