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
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Merchant</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Warranty Status</th>
              <th className="py-3 px-4">Warranty Expiry</th>
              <th className="py-3 px-4">Return Window</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {records.map((r) => {
              const sym = getCurrencySymbol(r.currency);
              const formattedAmt = `${sym}${r.total_amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}`;

              return (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {r.merchant_name}
                    {r.invoice_number && (
                      <span className="block text-[10px] text-slate-500 font-normal">
                        #{r.invoice_number}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{r.purchase_date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white font-display">{formattedAmt}</td>
                  <td className="py-3 px-4">
                    {r.has_explicit_warranty ? (
                      r.warranty_status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active ({r.days_left_warranty}d)</span>
                        </span>
                      ) : r.warranty_status === 'EXPIRING_SOON' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expires in {r.days_left_warranty}d</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Expired</span>
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {r.warranty_end_date || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {r.has_explicit_return_policy ? (
                      <span
                        className={
                          r.return_status === 'ACTIVE'
                            ? 'text-rose-400 font-medium'
                            : 'text-slate-500'
                        }
                      >
                        {r.return_deadline} ({r.return_window_days}d)
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onPrintClaimCard(r)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Print Claim Certificate"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete"
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
