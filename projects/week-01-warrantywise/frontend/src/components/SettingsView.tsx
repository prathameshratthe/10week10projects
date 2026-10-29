import React, { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Database,
  Shield,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { User } from '../types';

interface SettingsViewProps {
  user: User | null;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onNotify,
  onRefreshData,
}) => {
  const [apiKey, setApiKey] = useState(user?.api_key || 'ww_live_nexus_corp_9948201a');
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    try {
      const newKey = await ApiService.generateApiKey();
      setApiKey(newKey);
      onNotify('New enterprise API key generated');
    } catch (err: any) {
      onNotify(err.message || 'Failed to generate key', 'error');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        'Reset vault to default enterprise demo dataset? This will re-seed 8 real-world assets, 3 claims, and priority alerts.'
      )
    )
      return;
    setResettingDemo(true);
    try {
      await ApiService.resetDemoData();
      onNotify('Enterprise vault re-seeded with demo data');
      onRefreshData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to reset demo data', 'error');
    } finally {
      setResettingDemo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Workspace Profile Card */}
      <div className="obsidian-card rounded-2xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Vault Organization Profile
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Active workspace and access credentials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Active Organization
            </label>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/10 text-white font-medium">
              {user?.organization_name || 'Nexus Technologies Inc.'}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Primary Administrator
            </label>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/10 text-white font-medium">
              {user?.full_name || 'Alex Chen'} ({user?.email || 'alex.chen@nexus.corp'})
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Account Role
            </label>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/10 text-zinc-300 font-mono">
              {user?.role || 'Lead Asset Manager'}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Verification Engine
            </label>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/10 text-emerald-400 font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Deterministic Zero-Hallucination v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise API Keys */}
      <div className="obsidian-card rounded-2xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Developer & ERP Integration Keys
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authenticate automated PDF email forwarders, SAP/NetSuite ingest, or custom scrapers
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="text-[11px] font-medium text-zinc-400 block">
            Active REST API Key
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2.5 rounded-lg bg-[#090A0F] border border-white/10 font-mono text-xs text-zinc-200 truncate">
              {apiKey}
            </div>
            <button
              onClick={handleCopyKey}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleGenerateKey}
              disabled={generatingKey}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingKey ? 'animate-spin' : ''}`} />
              <span>Rotate Key</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-white/[0.06] font-mono text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-zinc-300 font-semibold block mb-1">cURL Example:</span>
            <code>curl -X POST https://warrantywise-week01.onrender.com/api/v1/receipts/extract \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer {apiKey.slice(0, 16)}..." \<br />
            &nbsp;&nbsp;-F "file=@invoice.pdf"</code>
          </div>
        </div>
      </div>

      {/* Vault Reset & Data Backups */}
      <div className="obsidian-card rounded-2xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Vault Maintenance & Data Portability
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Export comprehensive claim records or re-seed realistic enterprise demo data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Re-seed demo data */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Re-seed Enterprise Demo Dataset</h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Cleans and populates 8 real-world purchase receipts (Apple, Dell, Sony, Herman Miller), 3 warranty claims, and urgent alerts.
              </p>
            </div>
            <button
              onClick={handleResetDemo}
              disabled={resettingDemo}
              className="mt-4 btn-primary flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resettingDemo ? 'animate-spin' : ''}`} />
              <span>{resettingDemo ? 'Resetting...' : 'Reset Demo Vault'}</span>
            </button>
          </div>

          {/* Export Full Dataset */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Export Complete Portfolio</h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Download structured records, explicit warranty terms, line items, and claim numbers.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <a
                href={ApiService.getExportCsvUrl()}
                className="flex-1 text-center py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Export CSV
              </a>
              <a
                href={ApiService.getExportJsonUrl()}
                className="flex-1 text-center py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Export JSON
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
