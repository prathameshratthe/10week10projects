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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploaderOpen(true)}
        onOpenEvalReport={() => setIsEvalModalOpen(true)}
        recordCount={stats?.total_records || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Expiring Alert Banner (if urgent deadlines exist) */}
        {(expiringSoonCount > 0 || expiringReturnsCount > 0) && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-rose-950/40 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Action Required: Deadlines Approaching</h4>
                <p className="text-xs text-slate-400">
                  {expiringSoonCount > 0 && `${expiringSoonCount} warranty coverage expiring within 30 days. `}
                  {expiringReturnsCount > 0 && `${expiringReturnsCount} return window closing in 7 days!`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedWarrantyStatus('EXPIRING_SOON')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              <span>View Expiring</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : records.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 my-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">No Purchase Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
              {search || selectedCategory !== 'ALL' || selectedWarrantyStatus !== 'ALL'
                ? 'No records match your active search and filter criteria.'
                : 'Your warranty vault is currently empty. Upload your first store receipt to automatically extract and track warranty terms.'}
            </p>
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Extract First Receipt</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WarrantyWise • 10-Week AI Builder Challenge (Week 01)</span>
          <span>Zero Hallucination Guarantee • Tested on 20 Ground Truth Samples</span>
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
