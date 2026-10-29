import React, { useState } from 'react';
import { X, Copy, Check, Printer, Scale } from 'lucide-react';
import { ClaimLetterResponse } from '../types';

interface ClaimLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterData: ClaimLetterResponse | null;
}

export const ClaimLetterModal: React.FC<ClaimLetterModalProps> = ({
  isOpen,
  onClose,
  letterData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !letterData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterData.letter_body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-3xl rounded-2xl p-6 relative shadow-2xl flex flex-col max-h-[90vh] print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07] shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <Scale className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Formal Warranty Dispute & RMA Demand Letter
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {letterData.claim_number}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Statutorily grounded notice citing consumer protection standards</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-white/10 hover:border-white/20 text-white transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Notice'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Citations Pill Bar */}
        <div className="py-3 flex flex-wrap gap-1.5 shrink-0 print:hidden">
          {letterData.statutory_citations.map((cite, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-zinc-950/80 border border-white/[0.08] text-[10px] font-mono text-zinc-300 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {cite}
            </span>
          ))}
        </div>

        {/* Letter Body */}
        <div className="flex-1 overflow-y-auto mt-2 p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08] print:border-none print:p-0 font-mono text-xs text-zinc-200 print:text-black whitespace-pre-wrap leading-relaxed">
          {letterData.letter_body}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 shrink-0 mt-3 print:hidden">
          <span>Ready to email or attach to vendor RMA ticketing portal</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
