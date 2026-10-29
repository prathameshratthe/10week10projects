import React, { useState } from 'react';
import {
  Shield,
  Plus,
  CheckCircle2,
  FolderLock,
  Scale,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 'vault' | 'claims' | 'analytics' | 'alerts' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenEvalReport: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentUser: User | null;
  unreadAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenEvalReport,
  onOpenAuth,
  onLogout,
  currentUser,
  unreadAlertsCount,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090A0F]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-inner">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans">
                WarrantyWise
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active Protection
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xl:block tracking-normal">
              Enterprise Consumer Warranty & Return Vault Platform
            </p>
          </div>
        </div>

        {/* Center Primary Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-zinc-950/80 border border-white/[0.07]">
          <button
            onClick={() => onTabChange('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Vault</span>
          </button>

          <button
            onClick={() => onTabChange('claims')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Claims Hub</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Ground Truth Benchmark Trigger */}
          <button
            onClick={onOpenEvalReport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all shadow-sm cursor-pointer"
            title="View quantitative test benchmarks (20 receipts, 100% precision)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Ground-Truth Benchmark</span>
            <span className="lg:hidden">Audit</span>
          </button>

          {/* New Receipt Action Button - High Contrast Tactile White */}
          <button
            onClick={onOpenUpload}
            id="upload-receipt-btn"
            className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Protect Receipt</span>
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer text-left"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-tight">
                    {currentUser.organization_name}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  {getInitials(currentUser.full_name || 'Admin User')}
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0e121b] border border-white/10 shadow-2xl p-2 z-50 text-xs">
                    <div className="px-2.5 py-2 border-b border-white/[0.07] mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                        Signed In As
                      </span>
                      <span className="font-semibold text-white block truncate">
                        {currentUser.email}
                      </span>
                      <span className="text-[11px] text-emerald-400 block mt-0.5">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onTabChange('settings');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Workspace & API Keys</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer text-left mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#090A0F] py-2 px-3 text-xs overflow-x-auto">
        <button
          onClick={() => onTabChange('vault')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeTab === 'vault' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
          }`}
        >
          Vault
        </button>
        <button
          onClick={() => onTabChange('claims')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeTab === 'claims' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
          }`}
        >
          Claims
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeTab === 'analytics' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeTab === 'alerts' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
          }`}
        >
          Alerts {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            activeTab === 'settings' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
