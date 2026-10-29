import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Trash2,
} from 'lucide-react';
import { ApiService } from '../services/api';
import {
  ClaimLetterResponse,
  ClaimStatus,
  PurchaseRecord,
  WarrantyClaim,
  WarrantyClaimCreate,
} from '../types';
import { ClaimLetterModal } from './ClaimLetterModal';

interface ClaimsViewProps {
  records: PurchaseRecord[];
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({ records, onNotify }) => {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<ClaimLetterResponse | null>(null);

  // New claim form state
  const [selectedRecordId, setSelectedRecordId] = useState<number | ''>('');
  const [claimTitle, setClaimTitle] = useState('');
  const [claimIssue, setClaimIssue] = useState('');
  const [claimResolution, setClaimResolution] = useState('Free Repair');
  const [creating, setCreating] = useState(false);

  const loadClaims = async () => {
    try {
      const data = await ApiService.listClaims(statusFilter);
      setClaims(data);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load claims', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [statusFilter]);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) {
      onNotify('Please select an asset from your vault', 'error');
      return;
    }
    setCreating(true);
    try {
      const payload: WarrantyClaimCreate = {
        record_id: Number(selectedRecordId),
        title: claimTitle.trim(),
        issue_description: claimIssue.trim(),
        desired_resolution: claimResolution,
        status: 'SUBMITTED',
      };
      await ApiService.createClaim(payload);
      onNotify('Warranty claim filed successfully');
      setIsCreateModalOpen(false);
      // Reset form
      setClaimTitle('');
      setClaimIssue('');
      setSelectedRecordId('');
      loadClaims();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create claim', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateLetter = async (claim: WarrantyClaim) => {
    try {
      const letter = await ApiService.generateClaimLetter({
        record_id: claim.record_id,
        issue_description: claim.issue_description,
        desired_resolution: claim.desired_resolution,
      });
      setActiveLetter(letter);
      setIsLetterModalOpen(true);
    } catch (err: any) {
      onNotify(err.message || 'Failed to generate dispute notice', 'error');
    }
  };

  const handleStatusChange = async (claimId: number, newStatus: ClaimStatus) => {
    try {
      await ApiService.updateClaim(claimId, { status: newStatus });
      onNotify(`Claim updated to ${newStatus}`);
      loadClaims();
    } catch (err: any) {
      onNotify(err.message || 'Failed to update claim status', 'error');
    }
  };

  const handleDeleteClaim = async (claimId: number) => {
    if (!window.confirm('Are you sure you want to delete this warranty claim?')) return;
    try {
      await ApiService.deleteClaim(claimId);
      onNotify('Claim deleted');
      loadClaims();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete claim', 'error');
    }
  };

  // Metrics
  const activeCount = claims.filter((c) => c.status === 'IN_REVIEW' || c.status === 'SUBMITTED').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED').length;
  const totalDisputedVal = claims.reduce((acc, c) => acc + (c.repair_cost_claimed || 0), 0);

  const renderStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Approved</span>
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>In Review</span>
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileText className="w-3 h-3 text-blue-400" />
            <span>Submitted</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-white/[0.08]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Active Claims
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {activeCount}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">under review</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Dispatched RMA inquiries
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Claims Approved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {approvedCount}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">100% resolved</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Replacements & parts authorized
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Disputed Capital
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ${totalDisputedVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Total asset value claimed
          </div>
        </div>

        <div className="obsidian-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Action Ready
            </span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>File New Claim</span>
            </button>
          </div>
          <div className="mt-3 text-xs text-zinc-300">
            Generate formal dispute notice citing statutory consumer law.
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-white/[0.05] pt-2">
            Magnuson-Moss & UCC compliant
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="obsidian-card rounded-2xl overflow-hidden">
        {/* Sub-header Filter Tabs */}
        <div className="p-4 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {['ALL', 'IN_REVIEW', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {st === 'ALL' ? 'All Claims' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'} Found
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading claims ledger...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Scale className="w-8 h-8 text-zinc-500 mb-2" />
            <h3 className="text-sm font-bold text-white">No Warranty Claims on Record</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
              File a formal claim against any vaulted asset to generate legally compliant dispute documentation.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>File First Claim</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 border-b border-white/[0.08] text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Claim ID</th>
                  <th className="py-2.5 px-3.5">Asset / Merchant</th>
                  <th className="py-2.5 px-3.5">Issue Description</th>
                  <th className="py-2.5 px-3.5">Desired Remedy</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">RMA / Tracking</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-zinc-300 font-semibold">
                      {c.claim_number}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-white line-clamp-1">
                        {c.product_name || c.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {c.merchant_name} • Filed: {c.filing_date}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-300 max-w-xs">
                      <p className="line-clamp-2 text-xs">{c.issue_description}</p>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-white/[0.08] text-zinc-300 font-medium">
                        {c.desired_resolution}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">{renderStatusBadge(c.status)}</td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-zinc-400">
                      {c.tracking_number ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{c.tracking_number}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">Pending Carrier</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleGenerateLetter(c)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white transition-all text-[11px] cursor-pointer"
                          title="Generate legal dispute letter"
                        >
                          <Scale className="w-3 h-3 text-emerald-400" />
                          <span>Dispute Letter</span>
                        </button>

                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value as ClaimStatus)}
                          className="bg-zinc-900 border border-white/10 text-zinc-300 text-[11px] rounded px-1.5 py-1 focus:outline-none"
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>

                        <button
                          onClick={() => handleDeleteClaim(c.id)}
                          className="p-1 text-zinc-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete claim"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File New Claim Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0e121b] border border-white/10 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">File Warranty Dispute Claim</h2>
                  <p className="text-[11px] text-zinc-400">Generate formal vendor dispute grounded in consumer protection law</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Select Covered Asset *
                </label>
                <select
                  required
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="">-- Choose Vault Asset --</option>
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.items && r.items[0] ? r.items[0].name : r.merchant_name} (${r.total_amount} {r.currency}) — {r.merchant_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Claim Summary / Defect Title *
                </label>
                <input
                  type="text"
                  required
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  placeholder="e.g. Battery Swelling & Thermal Shutdown"
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Defect Description & Operating Conditions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder="Describe failure circumstances, error codes, and confirm unit was not subjected to accidental damage..."
                  className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Desired Legal Remedy
                  </label>
                  <select
                    value={claimResolution}
                    onChange={(e) => setClaimResolution(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="Free Repair">Free Repair</option>
                    <option value="Replacement Unit">Full Replacement Unit</option>
                    <option value="Full Refund">Complete Purchase Refund</option>
                    <option value="Component Replacement">Replacement Spare Part</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Statutory Framework
                  </label>
                  <div className="px-3 py-2 rounded-lg bg-zinc-950/80 border border-white/10 text-[11px] text-zinc-400 font-mono">
                    Magnuson-Moss Act
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.07] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'File Claim & Generate RMA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Letter Modal */}
      <ClaimLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        letterData={activeLetter}
      />
    </div>
  );
};
