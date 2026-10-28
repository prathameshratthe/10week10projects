import React from 'react';
import { Shield, Sparkles, Plus, Award } from 'lucide-react';

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
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display tracking-tight text-white">
                WarrantyWise
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Week 01 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Receipt Extraction & Warranty Vault
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Eval Benchmark Button */}
          <button
            onClick={onOpenEvalReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            title="View quantitative test benchmarks (20 receipts, 100% precision)"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden md:inline">20-Sample Eval Report</span>
            <span className="md:hidden">Eval</span>
          </button>

          {/* Records Counter */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{recordCount} Records Protected</span>
          </div>

          {/* New Receipt Action Button */}
          <button
            onClick={onOpenUpload}
            id="upload-receipt-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 hover:shadow-blue-500/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Receipt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
