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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-2xl rounded-2xl p-6 sm:p-7 relative shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.07] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Official Warranty Claim Certificate
              </h2>
              <p className="text-[11px] text-zinc-400">Verifiable proof for retailer and manufacturer repair submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div className="py-5 space-y-5 print:text-black">
          {/* Certificate Title */}
          <div className="text-center border-b border-white/[0.07] print:border-gray-300 pb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 print:border-gray-400 text-zinc-200 print:text-black mb-2">
              <Shield className="w-5 h-5 text-emerald-400 print:text-black" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white print:text-black">
              WARRANTYWISE CLAIM CERTIFICATE
            </h1>
            <p className="text-xs text-zinc-400 print:text-gray-600 mt-0.5 font-mono">
              Verified Purchase Record & Warranty Intelligence Brief • Record #{record.id}
            </p>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.07] print:bg-gray-100 print:border-gray-300">
              <span className="text-zinc-500 print:text-gray-600 block text-[10px] uppercase font-semibold tracking-wider">
                Store / Merchant
              </span>
              <span className="text-white print:text-black font-bold text-sm mt-0.5 block">
                {record.merchant_name}
              </span>
              {record.invoice_number && (
                <span className="text-zinc-400 print:text-gray-600 text-[11px] font-mono block mt-0.5">
                  Invoice #: {record.invoice_number}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.07] print:bg-gray-100 print:border-gray-300">
              <span className="text-zinc-500 print:text-gray-600 block text-[10px] uppercase font-semibold tracking-wider">
                Financial Transaction
              </span>
              <span className="text-white print:text-black font-bold text-sm mt-0.5 block font-mono">
                {sym}{record.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {record.currency}
              </span>
              <span className="text-zinc-400 print:text-gray-600 text-[11px] font-mono block mt-0.5">
                Purchased: {record.purchase_date}
              </span>
            </div>
          </div>

          {/* Warranty Terms */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07] print:bg-gray-50 print:border-gray-300">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 print:text-gray-700 mb-2">
              Verified Warranty Coverage
            </h3>
            {record.has_explicit_warranty ? (
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400 print:text-gray-600 font-sans">Coverage Status:</span>
                  <span className="font-semibold text-emerald-400 print:text-emerald-700">
                    {record.warranty_status} ({record.days_left_warranty} days remaining)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 print:text-gray-600 font-sans">Duration:</span>
                  <span className="text-white print:text-black font-semibold">
                    {record.warranty_duration_months} Months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 print:text-gray-600 font-sans">Expires On:</span>
                  <span className="text-white print:text-black font-semibold">
                    {record.warranty_end_date}
                  </span>
                </div>
                {record.warranty_notes && (
                  <p className="text-[11px] text-zinc-400 print:text-gray-700 italic mt-2 pt-2 border-t border-white/[0.06] font-sans">
                    Notes: "{record.warranty_notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 print:text-gray-600 italic">
                No explicit warranty was noted on the purchase receipt.
              </p>
            )}
          </div>

          {/* Line items table */}
          {record.items && record.items.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-500 print:text-gray-700 uppercase tracking-wider mb-2">
                Purchased Items
              </h4>
              <div className="border border-white/[0.07] print:border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 print:bg-gray-200 text-zinc-500 print:text-gray-700 text-[10px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] print:divide-gray-300 text-zinc-300 print:text-black font-mono">
                    {record.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-sans font-medium text-white print:text-black">{it.name}</td>
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
          <div className="pt-3 border-t border-white/[0.07] print:border-gray-300 flex items-center justify-between text-[10px] text-zinc-500 print:text-gray-500 font-mono">
            <span>Generated by WarrantyWise Platform • Official Warranty Claim Record</span>
            <span>Recorded: {new Date(record.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
