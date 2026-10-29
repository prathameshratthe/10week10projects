import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
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
    desc: '1-Year Limited Warranty + 14-Day Return Window',
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
    name: 'Croma Retail TV (₹64,990 INR)',
    desc: '1-Yr Warranty + 7-Day Return Window',
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
    name: 'Home Depot Refrigerator ($2,136)',
    desc: '2-Year Warranty on parts & labor + 30-Day Return',
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
    name: 'Trader Joe\'s Groceries ($13.46)',
    desc: 'Perishable Consumables (No Warranty Test)',
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
      setTimeout(() => setProcessingStage('Extracting line items and financial metadata...'), 350);
      setTimeout(() => setProcessingStage('Verifying explicit warranty clauses...'), 750);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-lg rounded-2xl p-5 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 shadow-inner">
              <UploadCloud className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Upload Purchase Document</h2>
              <p className="text-[11px] text-zinc-400">PDF, JPG, PNG, WEBP, or TXT receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag & Drop Target */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`mt-4 border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/5 scale-[0.99]'
              : 'border-white/[0.12] hover:border-white/25 bg-zinc-950/60 hover:bg-zinc-950/90'
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
            <div className="flex flex-col items-center py-3 text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2.5" />
              <p className="text-xs font-semibold text-zinc-200">{processingStage}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Strict schema extraction</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 flex items-center justify-center mb-2.5">
                <FileText className="w-5 h-5 text-zinc-300" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">
                Click to browse or drop purchase receipt here
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Invoices, store slips, order confirmations (up to 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Pre-Loaded Quick Presets */}
        <div className="mt-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
            Instant Test Receipts:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SAMPLE_RECEIPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSampleClick(sample)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-white/[0.06] hover:border-white/20 hover:bg-zinc-900 transition-all text-left disabled:opacity-50 group cursor-pointer"
              >
                <div>
                  <div className="text-[11px] font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 line-clamp-1">{sample.desc}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 shrink-0 ml-1.5 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Audit Footnote */}
        <div className="mt-4 flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/50 border border-white/[0.05] text-[11px] text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-zinc-300">Strict Extraction Standard:</strong> Warranties are cataloged only when explicitly documented. In the next step, you can verify and adjust extracted fields before committing to your vault.
          </span>
        </div>
      </div>
    </div>
  );
};
