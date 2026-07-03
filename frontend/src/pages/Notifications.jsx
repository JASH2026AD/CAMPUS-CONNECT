import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { Bell, Check, Mail, BookOpen, ShoppingBag, Search, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      showToast('Alert marked as read.', 'success');
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All alerts cleared! 🔔', 'success');
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'CHAT':
        return { emoji: '💬', icon: <Mail className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-500/10' };
      case 'SKILL':
        return { emoji: '🤝', icon: <BookOpen className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-500/10' };
      case 'MARKETPLACE':
        return { emoji: '🛒', icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10' };
      case 'LOST_FOUND':
        return { emoji: '🔍', icon: <Search className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-500/10' };
      case 'GENERAL':
      default:
        return { emoji: '📢', icon: <Bell className="w-4 h-4 text-slate-500" />, bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader title="Campus Alerts" subtitle="Stay updated with trade proposals, exchange requests, and claims" emoji="🔔" />
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState emoji="🔔" title="All caught up!" description="You have no notifications in your history log at the moment." />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notif => {
            const meta = getNotifMeta(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`glass-panel border rounded-2xl p-4 flex justify-between items-center gap-4 transition-all ${
                  notif.isRead 
                    ? 'opacity-60 hover:opacity-80 border-gray-200/40 dark:border-slate-800/40' 
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer shadow-premium'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${meta.bg} flex items-center justify-center`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {meta.emoji} {notif.title}
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
