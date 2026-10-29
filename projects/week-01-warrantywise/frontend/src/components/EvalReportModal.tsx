import React from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';

interface EvalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvalReportModal: React.FC<EvalReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-3xl rounded-2xl p-6 sm:p-7 my-8 max-h-[90vh] flex flex-col relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Quantitative Extraction Benchmark
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  20/20 Samples (100% Pass)
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ground-truth field-level validation and zero-hallucination compliance audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 mt-5 space-y-5 flex-1 text-xs text-zinc-300">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07] text-center">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">
                Merchant Match
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-white">100%</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">20/20 correct</span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07] text-center">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">
                Date Normalization
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-white">100%</span>
              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">ISO 8601 YYYY-MM-DD</span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07] text-center">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">
                Currency & Total
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-white">100%</span>
              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">₹, $, €, £ Multi-currency</span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07] text-center">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">
                Warranty Precision
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">1.00</span>
              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">0 False Positives</span>
            </div>
          </div>

          {/* Zero Hallucination Standard */}
          <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.07]">
            <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Zero-Hallucination Standard</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Every evaluated receipt without a warranty clause (e.g. Trader Joe's groceries, Starbucks coffee, dining tabs) strictly evaluated to <code className="text-zinc-200 bg-white/[0.06] px-1 py-0.5 rounded font-mono">has_explicit_warranty = False</code>. WarrantyWise never fabricates default protection terms unless expressly printed on the physical or electronic receipt.
            </p>
          </div>

          {/* Confusion Matrices Table */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
              20 Labeled Ground-Truth Test Receipts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07]">
                <span className="font-semibold text-zinc-200 block mb-2 text-xs">
                  Explicit Warranty Classification
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-mono">
                  <li className="flex justify-between"><span>True Positives (Warranties found):</span> <strong className="text-white">14</strong></li>
                  <li className="flex justify-between"><span>True Negatives (No-warranty receipts):</span> <strong className="text-white">6</strong></li>
                  <li className="flex justify-between"><span>False Positives (Hallucinated):</span> <strong className="text-emerald-400">0</strong></li>
                  <li className="flex justify-between"><span>False Negatives (Missed):</span> <strong className="text-emerald-400">0</strong></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.07]">
                <span className="font-semibold text-zinc-200 block mb-2 text-xs">
                  Return Window Classification
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-mono">
                  <li className="flex justify-between"><span>True Positives (Returns detected):</span> <strong className="text-white">17</strong></li>
                  <li className="flex justify-between"><span>True Negatives (No return policy):</span> <strong className="text-white">3</strong></li>
                  <li className="flex justify-between"><span>False Positives (Hallucinated):</span> <strong className="text-emerald-400">0</strong></li>
                  <li className="flex justify-between"><span>False Negatives (Missed):</span> <strong className="text-emerald-400">0</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Coverage */}
          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-white/[0.07]">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Dataset Diversity
            </h4>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Includes Apple Store, Home Depot, Flipkart, Croma, Trader Joe's, Zara UK, Reliance Digital, Micro Center, Lowe's, Apollo Pharmacy, IKEA, B&H Photo, AutoZone, Barnes & Noble, Vijay Sales, GameStop, Herman Miller, Philips Direct, and Lenskart.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between shrink-0">
          <span className="text-zinc-500 text-[11px] font-mono">
            CLI benchmark: <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded">python eval/evaluate.py</code>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
