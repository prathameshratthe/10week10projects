import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { ReceiptExtractionResult } from '../types';

interface ReceiptUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionSuccess: (result: ReceiptExtractionResult, file?: File) => void;
  onError: (msg: string) => void;
}

const SAMPLE_RECEIPTS = [
  {
    name: 'Apple MacBook Pro ($3,155)',
    desc: '1-Year Warranty + 14-Day Return',
    filename: 'apple_macbook.txt',
    text: `APPLE STORE #R102
5th Avenue, New York, NY
Date: 2026-03-10
Invoice #: APL-992014

MacBook Pro 16-inch M3   1   $2,499.00
AppleCare+ Protection    1   $399.00

Subtotal: $2,898.00
Tax: $257.20
Total: $3,155.20
Payment: Apple Pay

1 Year Manufacturer Limited Warranty
14-day return policy with original box`,
  },
  {
    name: 'Croma TV (₹64,990 INR)',
    desc: '1-Yr Warranty + 7-Day Return',
    filename: 'croma_tv.txt',
    text: `CROMA ELECTRONICS
Phoenix Marketcity, Pune
Date: 12/08/2026
Invoice No: CR-772910

Samsung 55 Inch 4K QLED TV   1   Rs. 64,990.00
Installation & Demo          1   Rs. 0.00

Grand Total: ₹64,990.00
Payment Method: UPI / GPay

Warranty: 1 Year Manufacturer Warranty on Product
Panel Warranty: 2 Years
Returns accepted within 7 days for defective units`,
  },
  {
    name: 'Samsung Fridge ($2,136)',
    desc: '2-Year Warranty + 30-Day Return',
    filename: 'home_depot_fridge.txt',
    text: `HOME DEPOT #4402
Atlanta, GA
Date: 2026-05-18
Order ID: HD-339102

Samsung French Door Refrigerator   1   $1,899.00
Delivery & Haul Away               1   $79.00

Subtotal: $1,978.00
Sales Tax: $158.24
Total Amount: $2,136.24
Payment: Credit Card

2 Years Limited Warranty on parts and labor
30-day return window from delivery date`,
  },
  {
    name: 'Trader Joe\'s ($13.46)',
    desc: 'Groceries (Zero Warranty Test)',
    filename: 'trader_joes.txt',
    text: `TRADER JOE'S #501
Pasadena, CA
Date: 2026-06-04
Receipt #: TJ-88210

Organic Bananas          $1.99
Almond Milk Unsweetened  $2.99
Sourdough Bread          $3.49
Avocado 4-pack           $4.99

Tax: $0.00
Total: $13.46
Payment: Debit Card

Thank you for shopping at Trader Joe's!`,
  },
];

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  isOpen,
  onClose,
  onExtractionSuccess,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setLoading(true);
    setProcessingStage('Ingesting document bytes...');

    try {
      setTimeout(() => setProcessingStage('Parsing line items and financial totals...'), 400);
      setTimeout(() => setProcessingStage('Auditing explicit warranty clauses...'), 900);

      const result = await ApiService.extractReceipt(file);
      setLoading(false);
      onExtractionSuccess(result, file);
      onClose();
    } catch (err: any) {
      setLoading(false);
      onError(err.message || 'Failed to extract receipt');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: (typeof SAMPLE_RECEIPTS)[0]) => {
    const file = new File([sample.text], sample.filename, { type: 'text/plain' });
    handleFileProcess(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-xl rounded-3xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Extract Receipt</h2>
              <p className="text-xs text-slate-400">PDF, JPG, PNG, WEBP, or TXT receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          {loading ? (
            <div className="flex flex-col items-center py-4 text-center">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-200">{processingStage}</p>
              <p className="text-xs text-slate-500 mt-1">Applying strict schema validation</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Click to upload or drag & drop receipt
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF invoices, scans, photos, & store receipts (up to 10MB)
              </p>
            </div>
          )}
        </div>

        {/* One-Click Sample Presets */}
        <div className="mt-6">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Or Try One-Click Synthetic Test Receipts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_RECEIPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSampleClick(sample)}
                className="flex flex-col items-start p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/80 transition-all text-left disabled:opacity-50"
              >
                <span className="text-xs font-medium text-slate-200">{sample.name}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{sample.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zero Hallucination Guarantee Footnote */}
        <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Hallucination Guarantee:</strong> WarrantyWise flags warranties as active
            only when explicitly stated in text. You will be able to review and modify all fields in the next step.
          </span>
        </div>
      </div>
    </div>
  );
};
