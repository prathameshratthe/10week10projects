import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Send,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { NotificationItem } from '../types';

interface AlertsViewProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  onRefreshBadge: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onNotify, onRefreshBadge }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);

  const loadNotifications = async () => {
    try {
      const items = await ApiService.listNotifications();
      setNotifications(items);
      onRefreshBadge();
    } catch (err: any) {
      onNotify(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      onRefreshBadge();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onNotify('All notifications marked as read');
      onRefreshBadge();
    } catch (err: any) {
      onNotify(err.message || 'Failed to mark read', 'error');
    }
  };

  const handleTriggerTest = async () => {
    setSendingTest(true);
    try {
      await ApiService.triggerTestAlert({
        type: 'EXPIRING_WARRANTY',
        severity: 'urgent',
        title: 'Simulated 14-Day Expiration Webhook Triggered',
        message: 'Notification service dispatched simulated email to procurement team for upcoming warranty lapse.',
      });
      onNotify('Simulated alert dispatched to notification center');
      loadNotifications();
    } catch (err: any) {
      onNotify(err.message || 'Failed to send test alert', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="obsidian-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Automated Notification & Escalation Center
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time monitoring of return deadlines, warranty expirations, and claim authorizations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            Mark All Read
          </button>
          <button
            onClick={handleTriggerTest}
            disabled={sendingTest}
            className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? 'Sending...' : 'Test Webhook Alert'}</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="obsidian-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Live Escalations & System Audit Feed
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {notifications.length} Total Notifications
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading alerts feed...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">No alerts on file.</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                  !n.read ? 'bg-white/[0.02]' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.severity === 'urgent'
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        : n.severity === 'warning'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    }`}
                  >
                    {n.severity === 'urgent' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : n.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">{n.title}</span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-500">{n.type}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
