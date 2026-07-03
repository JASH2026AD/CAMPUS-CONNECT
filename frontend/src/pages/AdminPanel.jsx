import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { Shield, Users, ShoppingBag, Search, Flag, Award, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../api/axios';

export default function AdminPanel() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'reports'
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReportsList(res.data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchStats();
    if (activeTab === 'users') {
      await fetchUsers();
    } else if (activeTab === 'reports') {
      await fetchReports();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This will delete all their listings, reports, and claims.')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('Student user permanently removed from directory.', 'success');
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast('Failed to delete user.', 'error');
    }
  };

  const handleResolveReport = async (reportId, action) => {
    const confirmMsg = action === 'DELETE_ITEM' 
      ? 'Are you sure you want to delete this marketplace item and penalize the seller\'s trust score?'
      : 'Are you sure you want to mark this report as resolved?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { action });
      showToast(`Report updated. Action: ${action} resolved successfully.`, 'success');
      fetchReports();
      fetchStats();
    } catch (err) {
      console.error('Resolve report error:', err);
      showToast('Failed to resolve report.', 'error');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <PageHeader title="Platform Administration" subtitle="Moderate reported student profiles, inspect spam flags, and view usage metrics" emoji="🛡️" />

      {/* Tabs */}
      <div className="border-b border-gray-200/40 dark:border-slate-800/40 flex gap-4">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Analytics & Statistics 📊
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Manage Users ({stats?.users?.total || 0}) 👥
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Moderation Reports ({stats?.reports?.pending || 0}) 🚨
        </button>
      </div>

      {/* Tab 1 Content: Stats & Analytics */}
      {activeTab === 'stats' && stats && (
        <div className="flex flex-col gap-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-white/20 shadow-premium">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Registrants</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{stats.users.total}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Students: {stats.users.students} | Admins: {stats.users.admins}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/20 shadow-premium">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">Marketplace Volume</span>
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{stats.marketplace.total}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Available: {stats.marketplace.available} | Sold: {stats.marketplace.sold}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/20 shadow-premium">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">Claims Lodged</span>
                <Search className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{stats.lostFound.claims}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Pending verification: {stats.lostFound.pendingClaims}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/20 shadow-premium">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">Exchanges Run</span>
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{stats.skills.requests}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Completed matches: {stats.skills.completedSessions}</p>
            </div>
          </div>

          {/* Platforms Overview card */}
          <div className="glass-card border rounded-2xl p-6 shadow-premium flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Platform Health Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white/40 dark:bg-slate-900/20 border border-gray-200/20 dark:border-slate-800/40 rounded-xl">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Moderation Queue</span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.reports.pending}</p>
                <p className="text-[10px] text-gray-400 font-semibold">Pending violation flags</p>
              </div>

              <div className="p-4 bg-white/40 dark:bg-slate-900/20 border border-gray-200/20 dark:border-slate-800/40 rounded-xl">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lost & Found claims active</span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.lostFound.pendingClaims}</p>
                <p className="text-[10px] text-gray-400 font-semibold">Requires student verification reviews</p>
              </div>

              <div className="p-4 bg-white/40 dark:bg-slate-900/20 border border-gray-200/20 dark:border-slate-800/40 rounded-xl">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verified users ratio</span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">100%</p>
                <p className="text-[10px] text-gray-400 font-semibold">All accounts locked to college .edu</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Users Directory */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Registrants Database</h3>

          {loading ? (
            <LoadingSkeleton type="list" count={3} />
          ) : usersList.length === 0 ? (
            <EmptyState emoji="👥" title="No users found" description="No student registration profiles have been initialized." />
          ) : (
            <div className="flex flex-col gap-3">
              {usersList.map(item => (
                <div key={item.id} className="glass-panel border rounded-2xl p-4 flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-lg bg-orange-100 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        {item.profile?.name || 'New Account'}
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          item.role === 'ADMIN' ? 'bg-orange-500/10 text-primary border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {item.role}
                        </span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{item.email} • Major: {item.profile?.major || 'General'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-[10px] font-semibold text-gray-400 hidden sm:block">
                      <p>Reputation: <span className="text-slate-800 dark:text-white font-bold">{item.profile?.reputationScore || 0}</span></p>
                      <p>Trust Score: <span className="text-slate-800 dark:text-white font-bold">{item.profile?.trustScore || 100}%</span></p>
                    </div>

                    {item.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete student user account"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3 Content: Moderation Queue */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Active Moderation Flags</h3>

          {loading ? (
            <LoadingSkeleton type="list" count={3} />
          ) : reportsList.length === 0 ? (
            <EmptyState emoji="🛡️" title="Clear Queue" description="You have no pending reports! Campus is clean." />
          ) : (
            <div className="flex flex-col gap-4">
              {reportsList.map(rep => (
                <div key={rep.id} className="glass-panel border rounded-2xl p-5 shadow-premium flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                        Violation reported
                      </span>
                      <p className="text-xs text-gray-400 mt-1 font-semibold">Reported item: <strong className="text-slate-800 dark:text-white">"{rep.marketplaceItem?.title || 'Unknown Product'}"</strong></p>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      rep.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="p-3 bg-white/50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-800/40 rounded-xl text-xs flex flex-col gap-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Reason:</span>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">"{rep.reason}"</p>
                    
                    <div className="border-t border-gray-200/20 dark:border-slate-800/40 my-1.5" />
                    
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                      <span>Reporter: {rep.reporter?.profile?.name || rep.reporter?.email}</span>
                      <span>Offending Seller: {rep.reportedUser?.profile?.name || rep.reportedUser?.email}</span>
                    </div>
                  </div>

                  {rep.status === 'PENDING' && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'DELETE_ITEM')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-premium flex items-center justify-center gap-1"
                      >
                        <ShieldAlert className="w-4 h-4" /> Remove Item & Deduct Trust Score
                      </button>
                      
                      <button
                        onClick={() => handleResolveReport(rep.id, 'RESOLVE')}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-800 hover:bg-green-500/10 hover:text-green-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
