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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-4xl rounded-2xl p-6 sm:p-7 my-8 max-h-[90vh] flex flex-col relative shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Verify Extracted Record
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round(extractedData.confidence_score * 100)}% Confidence
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/[0.05] text-zinc-400 border border-white/[0.06]">
                  {extractedData.extraction_method}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review parsed financial amounts, dates, and explicit protection clauses before vaulting
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

        {/* Tab switcher - Linear Segmented Control */}
        <div className="flex items-center gap-1.5 pt-4 shrink-0">
          <div className="inline-flex p-0.5 rounded-lg bg-zinc-950/80 border border-white/[0.07]">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Structured Fields
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rawText')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'rawText'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Raw Document Text ({extractedData.raw_text?.length || 0} chars)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-1 mt-4 space-y-5 flex-1">
          {activeTab === 'rawText' ? (
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto">
              {extractedData.raw_text || '[No raw text extracted]'}
            </div>
          ) : (
            <form id="extraction-form" onSubmit={handleSave} className="space-y-4">
              {/* Primary Merchant & Payment Details */}
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06] space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Store className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Store & Financial Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Merchant Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Store / Merchant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
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
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Purchase Date (YYYY-MM-DD) *
                    </label>
                    <input
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Total Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  {/* Invoice # */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Invoice / Receipt #
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. INV-10492"
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Payment Method
                    </label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="Credit Card, UPI, etc."
                      className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Warranty Clause Section (Strictly Explicit) */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasWarranty
                    ? 'bg-blue-950/20 border-blue-500/30'
                    : 'bg-zinc-950/40 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {hasWarranty ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-zinc-500" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-tight">Explicit Warranty Protection</h3>
                      <p className="text-[11px] text-zinc-400">
                        Zero Hallucination: Enabled only when explicitly documented on the receipt
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
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>

                {hasWarranty ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Warranty Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={warrantyMonths}
                        onChange={(e) => handleMonthsChange(e.target.value)}
                        placeholder="e.g. 12 or 24"
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Warranty Expiration Date
                      </label>
                      <input
                        type="date"
                        value={warrantyEndDate}
                        onChange={(e) => setWarrantyEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Warranty Terms & Notes
                      </label>
                      <input
                        type="text"
                        value={warrantyNotes}
                        onChange={(e) => setWarrantyNotes(e.target.value)}
                        placeholder="e.g. 1-Yr Limited Manufacturer"
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-500 italic pt-1">
                    No warranty clause was found printed on this receipt.
                  </div>
                )}
              </div>

              {/* Return Policy Section */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasReturn
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-zinc-950/40 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${hasReturn ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-tight">Return & Exchange Window</h3>
                      <p className="text-[11px] text-zinc-400">
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
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>

                {hasReturn ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Return Window (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={returnDays}
                        onChange={(e) => handleDaysChange(e.target.value)}
                        placeholder="e.g. 14 or 30"
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Last Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDeadline}
                        onChange={(e) => setReturnDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Return Policy Conditions
                      </label>
                      <input
                        type="text"
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="e.g. Original box and receipt required"
                        className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-500 italic pt-1">
                    No explicit return policy was stated on this receipt.
                  </div>
                )}
              </div>

              {/* Line Items Editor */}
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Purchased Items ({items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-1">
                    No individual line items parsed. Click 'Add Item' to record specific products.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#090A0F] border border-white/[0.08]"
                      >
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          placeholder="Item description"
                          className="flex-1 px-2.5 py-1 text-xs rounded bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-white/30"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Qty"
                          className="w-14 px-2 py-1 text-xs rounded bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none"
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
                          className="w-20 px-2 py-1 text-xs rounded bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
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
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Private Notes / Serial Number (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Serial: SN-9948210, kept original box in garage attic"
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between shrink-0 mt-4">
          <p className="text-[11px] text-zinc-500 hidden sm:block">
            Strict verification protects your claim proof accuracy
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              form="extraction-form"
              disabled={saving}
              className="btn-primary flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Cataloging...' : 'Save to Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
