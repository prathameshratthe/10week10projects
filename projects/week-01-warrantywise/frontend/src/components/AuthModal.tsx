import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building2, Shield, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onError: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('Acme Corp');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await ApiService.login(email, password);
        onSuccess(res.user);
      } else {
        const res = await ApiService.signup(email, password, fullName, orgName);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      onError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'consumer') => {
    setLoading(true);
    try {
      const res = await ApiService.demoLogin(role);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      onError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0e121b] border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {tab === 'login' ? 'Sign In to Warranty Vault' : 'Create Enterprise Account'}
              </h2>
              <p className="text-[11px] text-zinc-400">Zero-loss purchase and warranty intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Demo Access (1-Click) */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-950/70 border border-white/[0.08]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Instant One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin')}
              className="flex flex-col text-left p-2.5 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-white/25 hover:bg-zinc-800 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-emerald-400">Enterprise Admin</span>
                <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white" />
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5">Alex Chen • Nexus Corp</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('consumer')}
              className="flex flex-col text-left p-2.5 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-white/25 hover:bg-zinc-800 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-emerald-400">Personal Vault</span>
                <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white" />
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5">Sarah Connor • Household</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-center gap-1 mt-4 p-0.5 rounded-lg bg-zinc-950/80 border border-white/[0.07]">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              tab === 'login' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              tab === 'signup' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Organization / Vault Name</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Nexus Technologies Inc."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090A0F] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Vault' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
          <span>Enterprise encryption standard</span>
          <span className="font-mono">SHA-256 / PBKDF2</span>
        </div>
      </div>
    </div>
  );
};
