import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Store,
  FileCheck,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { ApiService } from '../services/api';
import {
  LineItem,
  PurchaseRecord,
  PurchaseRecordCreatePayload,
  ReceiptExtractionResult,
} from '../types';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ReceiptExtractionResult | null;
  onSaveSuccess: (record: PurchaseRecord) => void;
  onError: (msg: string) => void;
  uploadedFile?: File;
}

export const ExtractionReviewModal: React.FC<ExtractionReviewModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  onSaveSuccess,
  onError,
}) => {
  const [merchantName, setMerchantName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | string>('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('Electronics');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');

  // Warranty
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyMonths, setWarrantyMonths] = useState<number | string>('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [warrantyNotes, setWarrantyNotes] = useState('');

  // Return
  const [hasReturn, setHasReturn] = useState(false);
  const [returnDays, setReturnDays] = useState<number | string>('');
  const [returnDeadline, setReturnDeadline] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'rawText'>('form');

  // Populate state when extractedData changes
  useEffect(() => {
    if (extractedData) {
      setMerchantName(extractedData.merchant_name || '');
      setPurchaseDate(extractedData.purchase_date || new Date().toISOString().split('T')[0]);
      setTotalAmount(extractedData.total_amount ?? '');
      setCurrency(extractedData.currency || 'USD');
      setCategory('Electronics');
      setInvoiceNumber(extractedData.invoice_number || '');
      setPaymentMethod(extractedData.payment_method || 'Credit Card');
      setItems(extractedData.items || []);
      setNotes('');

      setHasWarranty(extractedData.has_explicit_warranty);
      setWarrantyMonths(extractedData.warranty_duration_months ?? '');
      setWarrantyEndDate(extractedData.warranty_end_date || '');
      setWarrantyNotes(extractedData.warranty_notes || '');

      setHasReturn(extractedData.has_explicit_return_policy);
      setReturnDays(extractedData.return_window_days ?? '');
      setReturnDeadline(extractedData.return_deadline || '');
      setReturnNotes(extractedData.return_notes || '');
    }
  }, [extractedData]);

  // Recalculate warranty end date when months or purchaseDate change
  const handleMonthsChange = (monthsVal: number | string) => {
    setWarrantyMonths(monthsVal);
    const m = parseInt(String(monthsVal), 10);
    if (!isNaN(m) && purchaseDate) {
      try {
        const dt = new Date(purchaseDate);
        dt.setMonth(dt.getMonth() + m);
        setWarrantyEndDate(dt.toISOString().split('T')[0]);
      } catch (e) {
        // ignore
      }
    }
  };

  // Recalculate return deadline when days or purchaseDate change
  const handleDaysChange = (daysVal: number | string) => {
    setReturnDays(daysVal);
    const d = parseInt(String(daysVal), 10);
    if (!isNaN(d) && purchaseDate) {
      try {
        const dt = new Date(purchaseDate);
        dt.setDate(dt.getDate() + d);
        setReturnDeadline(dt.toISOString().split('T')[0]);
      } catch (e) {
        // ignore
      }
    }
  };

  if (!isOpen || !extractedData) return null;

  const handleAddItem = () => {
    setItems([...items, { name: 'New Item', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const q = updated[index].quantity || 1;
      const u = updated[index].unit_price || 0;
      updated[index].total_price = parseFloat((q * u).toFixed(2));
    }
    setItems(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim()) {
      onError('Merchant name is required');
      return;
    }
    if (!purchaseDate) {
      onError('Purchase date is required');
      return;
    }
    const numAmount = parseFloat(String(totalAmount));
    if (isNaN(numAmount) || numAmount < 0) {
      onError('Please enter a valid total amount');
      return;
    }

    setSaving(true);
    try {
      const payload: PurchaseRecordCreatePayload = {
        merchant_name: merchantName.trim(),
        purchase_date: purchaseDate,
        total_amount: numAmount,
        currency,
        category,
        invoice_number: invoiceNumber.trim() || undefined,
        payment_method: paymentMethod.trim() || undefined,
        items,
        has_explicit_warranty: hasWarranty,
        warranty_duration_months: hasWarranty && warrantyMonths ? parseInt(String(warrantyMonths), 10) : undefined,
        warranty_end_date: hasWarranty ? warrantyEndDate || undefined : undefined,
        warranty_notes: hasWarranty ? warrantyNotes || undefined : undefined,
        has_explicit_return_policy: hasReturn,
        return_window_days: hasReturn && returnDays ? parseInt(String(returnDays), 10) : undefined,
        return_deadline: hasReturn ? returnDeadline || undefined : undefined,
        return_notes: hasReturn ? returnNotes || undefined : undefined,
        notes: notes.trim() || undefined,
      };

      const savedRecord = await ApiService.createRecord(payload);
      setSaving(false);
      onSaveSuccess(savedRecord);
      onClose();
    } catch (err: any) {
      setSaving(false);
      onError(err.message || 'Failed to save purchase record');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-4xl rounded-3xl p-6 sm:p-8 my-8 max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">
                  Review & Verify Extraction
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round(extractedData.confidence_score * 100)}% Confidence
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400">
                  {extractedData.extraction_method}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure all details are accurate before cataloging into your warranty vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Structured Review Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rawText')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'rawText'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Document OCR Text ({extractedData.raw_text?.length || 0} chars)
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-1 mt-4 space-y-6 flex-1">
          {activeTab === 'rawText' ? (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {extractedData.raw_text || '[No raw text extracted]'}
            </div>
          ) : (
            <form id="extraction-form" onSubmit={handleSave} className="space-y-6">
              {/* Primary Merchant & Payment Details */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  <span>Store & Financial Transaction</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Merchant Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Store / Merchant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Home Appliances">Home Appliances</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Tools">Tools & Hardware</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Purchase Date (YYYY-MM-DD) *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Total Amount *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  {/* Invoice # */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Invoice / Receipt #
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. INV-10492"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="Credit Card, UPI, etc."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Warranty Clause Section (Strictly Explicit) */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  hasWarranty
                    ? 'bg-blue-950/20 border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/30 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {hasWarranty ? (
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-slate-500" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white">Explicit Warranty Protection</h3>
                      <p className="text-xs text-slate-400">
                        Zero Hallucination: Enabled only if explicitly printed on the document
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWarranty}
                      onChange={(e) => setHasWarranty(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {hasWarranty ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Warranty Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={warrantyMonths}
                        onChange={(e) => handleMonthsChange(e.target.value)}
                        placeholder="e.g. 12 or 24"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Warranty Expiration Date
                      </label>
                      <input
                        type="date"
                        value={warrantyEndDate}
                        onChange={(e) => setWarrantyEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Warranty Terms & Notes
                      </label>
                      <input
                        type="text"
                        value={warrantyNotes}
                        onChange={(e) => setWarrantyNotes(e.target.value)}
                        placeholder="e.g. 1-Yr Limited Manufacturer"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic pt-2">
                    No warranty clause was found printed on this receipt. Toggle switch if you have external documentation.
                  </div>
                )}
              </div>

              {/* Return Policy Section */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  hasReturn
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : 'bg-slate-900/30 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${hasReturn ? 'text-rose-400' : 'text-slate-500'}`} />
                    <div>
                      <h3 className="text-sm font-bold text-white">Return & Exchange Window</h3>
                      <p className="text-xs text-slate-400">
                        Tracks countdown for full refund or replacement eligibility
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReturn}
                      onChange={(e) => setHasReturn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {hasReturn ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Return Window (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={returnDays}
                        onChange={(e) => handleDaysChange(e.target.value)}
                        placeholder="e.g. 14 or 30"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Last Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDeadline}
                        onChange={(e) => setReturnDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Return Policy Conditions
                      </label>
                      <input
                        type="text"
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="e.g. Original box and receipt required"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic pt-2">
                    No explicit return policy was stated on this receipt.
                  </div>
                )}
              </div>

              {/* Line Items Editor */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Extracted Purchased Items ({items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No line items extracted. Click 'Add Item' to record purchased items.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800"
                      >
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          placeholder="Item name"
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Qty"
                          className="w-16 px-2 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.total_price ?? ''}
                          onChange={(e) =>
                            handleItemChange(idx, 'total_price', parseFloat(e.target.value) || 0)
                          }
                          placeholder="Price"
                          className="w-24 px-2 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Private Notes / Serial Number (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Serial: SN-9948210, kept original box in garage attic"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0 mt-4">
          <p className="text-xs text-slate-500 hidden sm:block">
            Records are persisted to local SQLite database
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              form="extraction-form"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving to Vault...' : 'Save Purchase Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
