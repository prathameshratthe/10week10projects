import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, Coins } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-5"
          />
        ))}
      </div>
    );
  }

  // Format currencies display
  const currencyStrings = Object.entries(stats.total_spend_by_currency).map(([curr, amount]) => {
    const symbol = curr === 'INR' ? '₹' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  });
  const spendDisplay = currencyStrings.length > 0 ? currencyStrings.join(' + ') : '$0.00';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Active Warranties */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Active Warranties</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-white">
            {stats.active_warranties}
          </span>
          <span className="text-xs text-blue-400/80 font-medium">Fully Covered</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {stats.total_records} total items currently cataloged
        </p>
      </div>

      {/* 2. Expiring Soon (<30 Days) */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Expiring Soon</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-white">
            {stats.expiring_soon_warranties}
          </span>
          <span className="text-xs text-amber-400 font-medium">Within 30 Days</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Action needed to file claims or extend coverage
        </p>
      </div>

      {/* 3. Return Deadlines */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Active Return Windows</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-white">
            {stats.active_returns}
          </span>
          <span className="text-xs text-rose-400 font-medium">Eligible Returns</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {stats.expiring_soon_returns > 0
            ? `⚠️ ${stats.expiring_soon_returns} return deadline(s) closing in 7 days!`
            : 'No immediate return deadlines expiring'}
        </p>
      </div>

      {/* 4. Total Tracked Spend */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Total Protected Value</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold font-display text-white truncate max-w-[200px]" title={spendDisplay}>
            {spendDisplay}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Cumulative investment guarded by receipts
        </p>
      </div>
    </div>
  );
};
