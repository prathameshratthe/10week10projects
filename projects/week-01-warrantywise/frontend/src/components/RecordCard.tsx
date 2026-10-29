import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Package,
  Trash2,
  Printer,
  ArrowUpRight
} from 'lucide-react';
import { PurchaseRecord } from '../types';

interface RecordCardProps {
  record: PurchaseRecord;
  onDelete: (id: number) => void;
  onPrintClaimCard: (record: PurchaseRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onDelete,
  onPrintClaimCard,
}) => {
  // Format currency symbol
  const getCurrencySymbol = (curr: string) => {
    switch (curr?.toUpperCase()) {
      case 'INR':
        return '₹';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
    }
  };

  const symbol = getCurrencySymbol(record.currency);
  const formattedAmount = `${symbol}${record.total_amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
  })}`;

  // Warranty status badge
  const renderWarrantyBadge = () => {
    if (!record.has_explicit_warranty) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-white/[0.06]">
          No Explicit Stated Clause
        </span>
      );
    }

    switch (record.warranty_status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Active Coverage</span>
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Expiring Soon</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-white/[0.06]">
            <ShieldAlert className="w-3 h-3 text-zinc-400" />
            <span>Expired</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between group">
      <div>
        {/* Top Header: Merchant & Price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-zinc-200 shrink-0 shadow-inner">
              {record.merchant_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3
                className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1"
                title={record.merchant_name}
              >
                {record.merchant_name}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  {record.purchase_date}
                </span>
                <span>•</span>
                <span className="text-zinc-400">{record.category}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base font-bold text-white font-mono-numbers">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between py-2 border-y border-white/[0.05] my-2.5">
          {renderWarrantyBadge()}

          {record.has_explicit_warranty && record.days_left_warranty !== null && record.days_left_warranty !== undefined && (
            <span
              className={`text-xs font-mono-numbers font-medium ${
                record.days_left_warranty < 0
                  ? 'text-zinc-500'
                  : record.days_left_warranty <= 30
                  ? 'text-amber-400'
                  : 'text-zinc-300'
              }`}
            >
              {record.days_left_warranty < 0
                ? `${Math.abs(record.days_left_warranty)}d past expiry`
                : `${record.days_left_warranty} days left`}
            </span>
          )}
        </div>

        {/* Warranty Expiration Details */}
        {record.has_explicit_warranty ? (
          <div className="space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Duration:</span>
              <span className="text-zinc-300 font-mono-numbers">
                {record.warranty_duration_months} Months ({Math.round(((record.warranty_duration_months || 0) / 12) * 10) / 10} Yrs)
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Coverage Valid To:</span>
              <span className="text-zinc-200 font-medium font-mono-numbers">{record.warranty_end_date}</span>
            </div>
            {record.warranty_notes && (
              <p className="text-[11px] text-zinc-500 italic line-clamp-1 mt-1">
                "{record.warranty_notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-zinc-500 py-1 italic">
            Standard statutory protection applies (no invoice clause).
          </div>
        )}

        {/* Return Window Banner */}
        {record.has_explicit_return_policy && (
          <div
            className={`mt-2.5 px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
              record.return_status === 'ACTIVE' || record.return_status === 'EXPIRING_SOON'
                ? 'bg-rose-950/20 border-rose-500/25 text-rose-300'
                : 'bg-zinc-900 border-white/[0.05] text-zinc-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>Return deadline: {record.return_deadline}</span>
            </div>
            {record.days_left_return !== null && record.days_left_return !== undefined && record.days_left_return >= 0 && (
              <span className="font-bold font-mono-numbers text-[10px] bg-rose-500/20 px-1 rounded">
                {record.days_left_return}d
              </span>
            )}
          </div>
        )}

        {/* Item Names */}
        {record.items && record.items.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Package className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="line-clamp-1">
                {record.items.map((i) => i.name).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={() => onPrintClaimCard(record)}
          className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white transition-colors font-medium cursor-pointer"
        >
          <Printer className="w-3 h-3 text-zinc-400" />
          <span>Claim Certificate</span>
          <ArrowUpRight className="w-3 h-3 text-zinc-500" />
        </button>

        <button
          onClick={() => onDelete(record.id)}
          className="p-1 text-zinc-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
          title="Delete record"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
