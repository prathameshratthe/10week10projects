import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Receipt,
  Trash2,
  Printer,
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
  // Format currency
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
          No Stated Warranty
        </span>
      );
    }

    switch (record.warranty_status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Coverage</span>
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring Soon</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Coverage Expired</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all hover:shadow-xl hover:shadow-black/30 group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            {/* Merchant Initials Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-sm font-bold font-display text-blue-400 shrink-0">
              {record.merchant_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3
                className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1"
                title={record.merchant_name}
              >
                {record.merchant_name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {record.purchase_date}
                </span>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                  {record.category}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-extrabold font-display text-white">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Status Badge & Duration */}
        <div className="flex items-center justify-between py-2 border-y border-slate-800/80 my-3">
          {renderWarrantyBadge()}

          {record.has_explicit_warranty && record.days_left_warranty !== null && record.days_left_warranty !== undefined && (
            <span
              className={`text-xs font-semibold ${
                record.days_left_warranty < 0
                  ? 'text-rose-400'
                  : record.days_left_warranty <= 30
                  ? 'text-amber-400'
                  : 'text-slate-300'
              }`}
            >
              {record.days_left_warranty < 0
                ? `Expired ${Math.abs(record.days_left_warranty)}d ago`
                : `${record.days_left_warranty} days left`}
            </span>
          )}
        </div>

        {/* Warranty Expiration Details */}
        {record.has_explicit_warranty ? (
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="text-slate-300 font-medium">
                {record.warranty_duration_months} Months ({Math.round(((record.warranty_duration_months || 0) / 12) * 10) / 10} Yrs)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valid Until:</span>
              <span className="text-slate-200 font-semibold">{record.warranty_end_date}</span>
            </div>
            {record.warranty_notes && (
              <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-1">
                "{record.warranty_notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-1">
            Receipt did not contain explicit warranty wording.
          </div>
        )}

        {/* Return Deadline Banner (if applicable) */}
        {record.has_explicit_return_policy && (
          <div
            className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
              record.return_status === 'ACTIVE' || record.return_status === 'EXPIRING_SOON'
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Return by: {record.return_deadline}</span>
            </div>
            {record.days_left_return !== null && record.days_left_return !== undefined && record.days_left_return >= 0 && (
              <span className="font-bold text-[11px] bg-rose-500/20 px-1.5 py-0.5 rounded">
                {record.days_left_return}d left
              </span>
            )}
          </div>
        )}

        {/* Items summary */}
        {record.items && record.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Receipt className="w-3 h-3 text-slate-500" />
              <span className="line-clamp-1">
                {record.items.map((i) => i.name).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onPrintClaimCard(record)}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Claim Proof</span>
        </button>

        <button
          onClick={() => onDelete(record.id)}
          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          title="Delete record"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
