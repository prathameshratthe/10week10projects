import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Building2,
  Calendar,
  PieChart,
  DollarSign,
  Award,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { AnalyticsSummary } from '../types';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await ApiService.getAnalyticsSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Level Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Total Insured Assets
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ${data.total_portfolio_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">USD Invoiced</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Multi-currency portfolio aggregate
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Capital at Risk (&lt;60d)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-400">
              ${data.capital_at_risk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">expiring soon</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Assets requiring inspection or renewal
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Active Coverage
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {data.total_active_warranties}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">guaranteed</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Protected against repair liabilities
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Claim Recovery Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {data.claims_settlement_rate}%
            </span>
            <span className="text-[10px] text-blue-400 font-mono">settlement</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            {data.total_claims_active} claims currently under vendor review
          </div>
        </div>
      </div>

      {/* Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Spend Distribution */}
        <div className="obsidian-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Capital Allocation by Category
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {data.category_distribution.length} Segments
            </span>
          </div>

          <div className="space-y-3.5">
            {data.category_distribution.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-200">{cat.category}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-zinc-400">${cat.total_amount.toLocaleString()}</span>
                    <span className="text-zinc-500 text-[11px]">({cat.percentage}%)</span>
                  </div>
                </div>
                {/* Visual Bar */}
                <div className="h-2 w-full rounded-full bg-zinc-950/80 border border-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.max(cat.percentage, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiration Timeline Roadmap */}
        <div className="obsidian-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Upcoming Expiration Horizon
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Scheduled Lapses</span>
          </div>

          <div className="space-y-3">
            {data.expiration_timeline.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-white block">{item.period}</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5 block">
                    {item.count} {item.count === 1 ? 'Asset expiring' : 'Assets expiring'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-zinc-200 block">
                    ${item.total_insured_value.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Capital At Risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Reliability Scorecard */}
      <div className="obsidian-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Vendor Reliability & Warranty Performance Index
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Ground-Truth Benchmark</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 border-b border-white/[0.08] text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3.5">Vendor / Brand</th>
                <th className="py-2.5 px-3.5">Total Assets</th>
                <th className="py-2.5 px-3.5">Active Warranties</th>
                <th className="py-2.5 px-3.5">Claims Filed</th>
                <th className="py-2.5 px-3.5">Reliability Score</th>
                <th className="py-2.5 px-3.5 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {data.vendor_reliability.map((v, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-white">{v.vendor}</td>
                  <td className="py-2.5 px-3.5 text-zinc-400 font-mono">{v.records_count}</td>
                  <td className="py-2.5 px-3.5 text-emerald-400 font-mono">{v.active_warranties}</td>
                  <td className="py-2.5 px-3.5 text-zinc-300 font-mono">{v.claims_filed}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-white">
                    {v.reliability_score} / 100
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        v.reliability_score >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : v.reliability_score >= 80
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {v.reliability_score >= 90 ? 'Grade A+' : v.reliability_score >= 80 ? 'Grade A' : 'Grade B'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
