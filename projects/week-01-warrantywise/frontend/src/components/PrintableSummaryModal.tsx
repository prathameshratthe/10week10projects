import React from 'react';
import { X, Printer, Shield } from 'lucide-react';
import { PurchaseRecord } from '../types';

interface PrintableSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PurchaseRecord | null;
}

export const PrintableSummaryModal: React.FC<PrintableSummaryModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

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

  const sym = getCurrencySymbol(record.currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-700/60 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold font-display text-white">
              Official Warranty Claim Certificate
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div className="py-6 space-y-6 print:text-black">
          {/* Certificate Title */}
          <div className="text-center border-b border-slate-800 pb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight font-display text-white print:text-black">
              WARRANTYWISE CLAIM CERTIFICATE
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Verified Purchase Record & Warranty Intelligence Brief • Record #{record.id}
            </p>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-500 print:text-gray-600 block text-[10px] uppercase font-semibold">
                Store / Merchant
              </span>
              <span className="text-white print:text-black font-bold text-sm mt-0.5 block">
                {record.merchant_name}
              </span>
              {record.invoice_number && (
                <span className="text-slate-400 print:text-gray-600 text-[11px] block">
                  Invoice #: {record.invoice_number}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-500 print:text-gray-600 block text-[10px] uppercase font-semibold">
                Financial Transaction
              </span>
              <span className="text-white print:text-black font-bold text-sm mt-0.5 block">
                {sym}{record.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {record.currency}
              </span>
              <span className="text-slate-400 print:text-gray-600 text-[11px] block">
                Purchased: {record.purchase_date}
              </span>
            </div>
          </div>

          {/* Warranty Terms */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 print:bg-blue-50 print:border-blue-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-800 mb-2">
              Verified Warranty Coverage
            </h3>
            {record.has_explicit_warranty ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Coverage Status:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-700">
                    {record.warranty_status} ({record.days_left_warranty} days remaining)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Duration:</span>
                  <span className="text-white print:text-black font-semibold">
                    {record.warranty_duration_months} Months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Expires On:</span>
                  <span className="text-white print:text-black font-semibold">
                    {record.warranty_end_date}
                  </span>
                </div>
                {record.warranty_notes && (
                  <p className="text-[11px] text-slate-400 print:text-gray-700 italic mt-2 pt-2 border-t border-blue-500/20">
                    Notes: "{record.warranty_notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 print:text-gray-600">
                No explicit warranty was noted on the purchase receipt.
              </p>
            )}
          </div>

          {/* Line items table */}
          {record.items && record.items.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 print:text-gray-700 uppercase tracking-wider mb-2">
                Purchased Items
              </h4>
              <div className="border border-slate-800 print:border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-gray-700">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-300 print:text-black">
                    {record.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium">{it.name}</td>
                        <td className="py-2 px-3 text-center">{it.quantity}</td>
                        <td className="py-2 px-3 text-right">
                          {sym}{(it.total_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Proof Footer */}
          <div className="pt-4 border-t border-slate-800 print:border-gray-300 flex items-center justify-between text-[10px] text-slate-500 print:text-gray-500">
            <span>Generated by WarrantyWise AI • 10-Week AI Builder Challenge</span>
            <span>Recorded: {new Date(record.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
