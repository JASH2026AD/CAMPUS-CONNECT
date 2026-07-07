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
      showToast('All alerts cleared.', 'success');
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'CHAT':
        return { icon: <Mail className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-500/10' };
      case 'SKILL':
        return { icon: <BookOpen className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-500/10' };
      case 'MARKETPLACE':
        return { icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10' };
      case 'LOST_FOUND':
        return { icon: <Search className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-500/10' };
      case 'GENERAL':
      default:
        return { icon: <Bell className="w-4 h-4 text-black" />, bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <PageHeader title="Campus Alerts" subtitle="Stay updated with trade proposals, exchange requests, and claims" icon={Bell} />
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-800 text-[#374151] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up!" description="You have no notifications in your history log at the moment." />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notif => {
            const meta = getNotifMeta(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`glass-card p-4 flex justify-between items-center gap-4 transition-all duration-200 ${
                  notif.isRead 
                    ? 'opacity-60 hover:opacity-85 border-gray-200 dark:border-slate-800/80 shadow-none' 
                    : 'border-primary/20 bg-orange-50/10 dark:bg-orange-950/5 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 cursor-pointer shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-slate-100 flex items-center gap-1.5 leading-snug">
                      {notif.title}
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-400 mt-0.5 leading-relaxed font-semibold">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-gray-600 dark:text-slate-500 font-bold whitespace-nowrap">
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
