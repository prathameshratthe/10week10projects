import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Inbox,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ApiService } from './services/api';
import {
  DashboardStats,
  PurchaseRecord,
  ReceiptExtractionResult,
} from './types';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { RecordCard } from './components/RecordCard';
import { RecordTable } from './components/RecordTable';
import { ReceiptUploader } from './components/ReceiptUploader';
import { ExtractionReviewModal } from './components/ExtractionReviewModal';
import { PrintableSummaryModal } from './components/PrintableSummaryModal';
import { EvalReportModal } from './components/EvalReportModal';
import { Toast, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & layout
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedWarrantyStatus, setSelectedWarrantyStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<ReceiptExtractionResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | undefined>(undefined);
  const [activePrintRecord, setActivePrintRecord] = useState<PurchaseRecord | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now().toString(), type, message });
  };

  // Fetch records
  const loadData = useCallback(async () => {
    try {
      const [fetchedRecords, fetchedStats] = await Promise.all([
        ApiService.listRecords({
          search: search || undefined,
          category: selectedCategory,
          warranty_status: selectedWarrantyStatus,
        }),
        ApiService.getStats(),
      ]);
      setRecords(fetchedRecords);
      setStats(fetchedStats);
    } catch (err: any) {
      showToast(err.message || 'Failed to load records from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedWarrantyStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle successful AI extraction
  const handleExtractionSuccess = (result: ReceiptExtractionResult, file?: File) => {
    setExtractedData(result);
    setUploadedFile(file);
    setIsReviewModalOpen(true);
    showToast('Receipt details extracted! Please verify fields before saving.');
  };

  // Handle record creation success
  const handleSaveSuccess = (savedRecord: PurchaseRecord) => {
    showToast(`Protected: ${savedRecord.merchant_name} (${savedRecord.warranty_status})`);
    loadData();
  };

  // Handle record deletion
  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this purchase record?')) return;
    try {
      await ApiService.deleteRecord(id);
      showToast('Record deleted');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  // Check for immediate expiring warranties or returns to render urgency banner
  const expiringSoonCount = stats?.expiring_soon_warranties || 0;
  const expiringReturnsCount = stats?.expiring_soon_returns || 0;

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex flex-col selection:bg-blue-500 selection:text-white antialiased">
      {/* Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploaderOpen(true)}
        onOpenEvalReport={() => setIsEvalModalOpen(true)}
        recordCount={stats?.total_records || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* Urgent Deadlines Banner (if applicable) */}
        {(expiringSoonCount > 0 || expiringReturnsCount > 0) && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white">Action Required: Deadlines Approaching — </span>
                <span className="text-zinc-300">
                  {expiringSoonCount > 0 && `${expiringSoonCount} warranty expiring within 30 days. `}
                  {expiringReturnsCount > 0 && `${expiringReturnsCount} return window closing soon!`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedWarrantyStatus('EXPIRING_SOON')}
              className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0 cursor-pointer"
            >
              <span>Review Deadlines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dashboard Statistics Overview */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Filter and Search Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedWarrantyStatus={selectedWarrantyStatus}
          onWarrantyStatusChange={setSelectedWarrantyStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={records.length}
        />

        {/* Records Listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 rounded-xl bg-zinc-900/40 border border-white/[0.05] animate-pulse"
              />
            ))}
          </div>
        ) : records.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.1] bg-zinc-950/40 my-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">No Purchase Records Cataloged</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-5">
              {search || selectedCategory !== 'ALL' || selectedWarrantyStatus !== 'ALL'
                ? 'No records match your active search and filter criteria.'
                : 'Your warranty vault is currently empty. Protect your first store receipt to track manufacturer warranties and return windows.'}
            </p>
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Protect First Receipt</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onDelete={handleDeleteRecord}
                onPrintClaimCard={(r) => setActivePrintRecord(r)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <RecordTable
            records={records}
            onDelete={handleDeleteRecord}
            onPrintClaimCard={(r) => setActivePrintRecord(r)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-zinc-500 mt-12 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WarrantyWise — Intelligent Consumer Warranty Vault & Protection Platform</span>
          <span className="font-mono text-[11px] text-zinc-500">Deterministic Extraction Standard • 20 Ground Truth Samples Verified</span>
        </div>
      </footer>

      {/* Modals */}
      <ReceiptUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onExtractionSuccess={handleExtractionSuccess}
        onError={(msg) => showToast(msg, 'error')}
      />

      <ExtractionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        extractedData={extractedData}
        uploadedFile={uploadedFile}
        onSaveSuccess={handleSaveSuccess}
        onError={(msg) => showToast(msg, 'error')}
      />

      <PrintableSummaryModal
        isOpen={!!activePrintRecord}
        onClose={() => setActivePrintRecord(null)}
        record={activePrintRecord}
      />

      <EvalReportModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
