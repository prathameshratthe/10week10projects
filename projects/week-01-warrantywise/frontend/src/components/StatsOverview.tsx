import React from 'react';
import { ShieldCheck, Clock, RotateCcw, DollarSign } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-zinc-900/40 border border-white/[0.05] animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  // Format currencies display
  const currencyStrings = Object.entries(stats.total_spend_by_currency).map(([curr, amount]) => {
    const symbol = curr === 'INR' ? '₹' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  });
  const spendDisplay = currencyStrings.length > 0 ? currencyStrings.join(' + ') : '$0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
      {/* 1. Active Warranties */}
      <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Active Warranties
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono-numbers">
              {stats.active_warranties}
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">items</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            100% Protected
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 border-t border-white/[0.05] pt-2">
          Out of {stats.total_records} purchases cataloged
        </div>
      </div>

      {/* 2. Expiring Soon (<30 Days) */}
      <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Expiring Soon (&lt;30d)
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono-numbers">
              {stats.expiring_soon_warranties}
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">urgent</span>
          </div>
          {stats.expiring_soon_warranties > 0 ? (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Action Required
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Clear Window
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 border-t border-white/[0.05] pt-2">
          Claim before coverage window lapses
        </div>
      </div>

      {/* 3. Return Windows */}
      <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Return Deadlines
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono-numbers">
              {stats.active_returns}
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">open</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Store Return Ready
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 border-t border-white/[0.05] pt-2">
          Zero receipt loss or deadline miss
        </div>
      </div>

      {/* 4. Total Protected Value */}
      <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Total Insured Value
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight text-white font-mono-numbers truncate">
            {spendDisplay}
          </div>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 border-t border-white/[0.05] pt-2 flex items-center justify-between">
          <span>Cumulative Asset Spend</span>
          <span className="text-zinc-400 font-mono text-[10px]">USD / INR</span>
        </div>
      </div>
    </div>
  );
};
