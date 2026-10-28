import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border animate-in slide-in-from-bottom-5 duration-300 bg-slate-900/90 text-white border-slate-700">
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      )}
      <span className="text-xs font-medium">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
