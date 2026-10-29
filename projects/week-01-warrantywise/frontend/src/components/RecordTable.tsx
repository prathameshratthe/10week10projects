import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
  Trash2,
} from 'lucide-react';
import { PurchaseRecord } from '../types';

interface RecordTableProps {
  records: PurchaseRecord[];
  onDelete: (id: number) => void;
  onPrintClaimCard: (record: PurchaseRecord) => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onDelete,
  onPrintClaimCard,
}) => {
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

  return (
    <div className="obsidian-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/90 border-b border-white/[0.08] text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3.5">Merchant</th>
              <th className="py-2.5 px-3.5">Date</th>
              <th className="py-2.5 px-3.5">Category</th>
              <th className="py-2.5 px-3.5">Amount</th>
              <th className="py-2.5 px-3.5">Warranty Status</th>
              <th className="py-2.5 px-3.5">Coverage Expiry</th>
              <th className="py-2.5 px-3.5">Return Deadline</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {records.map((r) => {
              const sym = getCurrencySymbol(r.currency);
              const formattedAmt = `${sym}${r.total_amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}`;

              return (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3.5 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        {r.merchant_name.slice(0, 1)}
                      </span>
                      <div>
                        <span>{r.merchant_name}</span>
                        {r.invoice_number && (
                          <span className="block text-[10px] text-zinc-500 font-mono">
                            #{r.invoice_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-zinc-400 font-mono-numbers">{r.purchase_date}</td>
                  <td className="py-2.5 px-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-white/[0.06] text-zinc-300">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-white font-mono-numbers">{formattedAmt}</td>
                  <td className="py-2.5 px-3.5">
                    {r.has_explicit_warranty ? (
                      r.warranty_status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active ({r.days_left_warranty}d)</span>
                        </span>
                      ) : r.warranty_status === 'EXPIRING_SOON' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expiring ({r.days_left_warranty}d left)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Expired</span>
                        </span>
                      )
                    ) : (
                      <span className="text-zinc-600 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono-numbers text-zinc-400">
                    {r.warranty_end_date || '—'}
                  </td>
                  <td className="py-2.5 px-3.5">
                    {r.has_explicit_return_policy ? (
                      <span className="inline-flex items-center gap-1 text-rose-300 font-mono-numbers">
                        <span>{r.return_deadline}</span>
                        {r.days_left_return !== null && r.days_left_return !== undefined && r.days_left_return >= 0 && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded">
                            {r.days_left_return}d
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPrintClaimCard(r)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-all flex items-center gap-1 cursor-pointer"
                        title="Generate Claim Certificate"
                      >
                        <Printer className="w-3 h-3 text-zinc-400" />
                        <span>Proof</span>
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="p-1 text-zinc-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
