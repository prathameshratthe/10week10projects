import React from 'react';
import { Shield, Plus, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenEvalReport: () => void;
  recordCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenEvalReport,
  recordCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090A0F]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-inner">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans">
                WarrantyWise
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Active Protection
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block tracking-normal">
              Intelligent Consumer Warranty & Return Protection Platform
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quantitative Verification Report */}
          <button
            onClick={onOpenEvalReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all shadow-sm"
            title="View quantitative test benchmarks (20 receipts, 100% precision)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Ground-Truth Benchmark</span>
            <span className="md:hidden">Audit</span>
          </button>

          {/* Active Vault Count */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono-numbers text-zinc-300 font-medium">{recordCount}</span>
            <span>Documents Vaulted</span>
          </div>

          {/* New Receipt Action Button - High Contrast Apple/Linear Style */}
          <button
            onClick={onOpenUpload}
            id="upload-receipt-btn"
            className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Protect Receipt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
