import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSkeleton } from '../components/Common';
import { 
  Award, ShoppingBag, BookOpen, Search, Bell, 
  Star, ArrowRight, ShieldCheck, Heart, Clock, Sparkles, Users 
} from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 0,
    skillRequests: 0,
    activeClaims: 0,
    unreadNotifs: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch marketplace listings count
        const listingsRes = await api.get('/marketplace?sellerId=' + user.id);
        const activeListings = listingsRes.data.length;

        // Fetch skill requests
        const skillsRes = await api.get('/skills/history');
        const skillRequests = skillsRes.data.filter(r => r.status === 'PENDING' && r.receiverId === user.id).length;

        // Fetch claims
        const claimsRes = await api.get('/lostfound/user/claims');
        const activeClaims = claimsRes.data.myClaims.filter(c => c.status === 'PENDING').length +
                           claimsRes.data.receivedClaims.filter(c => c.status === 'PENDING').length;

        // Fetch notifications
        const notifsRes = await api.get('/notifications');
        const unreadNotifs = notifsRes.data.filter(n => !n.isRead).length;

        setStats({
          activeListings,
          skillRequests,
          activeClaims,
          unreadNotifs
        });

        // Derive recent activities from history
        const activities = [];
        listingsRes.data.slice(0, 2).forEach(item => {
          activities.push({
            id: `listing-${item.id}`,
            icon: '🛒',
            title: `Listed item: ${item.title}`,
            time: new Date(item.createdAt).toLocaleDateString()
          });
        });
        
        skillsRes.data.slice(0, 2).forEach(req => {
          const type = req.senderId === user.id ? 'Sent' : 'Received';
          activities.push({
            id: `skill-${req.id}`,
            icon: '🤝',
            title: `${type} skill exchange request for "${req.skillName}"`,
            time: new Date(req.createdAt).toLocaleDateString()
          });
        });

        setRecentActivities(activities.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getReputationLevel = (score) => {
    if (score >= 300) return { title: 'Royal Scholar', style: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' };
    if (score >= 150) return { title: 'Elite Exchange Partner', style: 'bg-primary/10 text-primary border border-primary/20' };
    if (score >= 50) return { title: 'Rising Contributor', style: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' };
    return { title: 'Campus Novice', style: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-gray-200/20 dark:border-slate-700/60' };
  };

  const getActivityIcon = (iconStr) => {
    if (iconStr === '🛒') return <ShoppingBag className="w-4 h-4 text-primary" />;
    if (iconStr === '🤝') return <Users className="w-4 h-4 text-primary" />;
    return <Clock className="w-4 h-4 text-slate-600" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  const reputationLevel = getReputationLevel(user.profile?.reputationScore || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-orange-400/0.02 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-4 text-left relative z-10">
          <img
            src={user.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
            alt="Avatar"
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-orange-50 dark:bg-slate-800 object-cover border border-gray-100 dark:border-slate-800 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-[#000000] dark:text-white tracking-tight">
                Hey, {user.profile?.name || 'Student'}!
              </h2>
              {user.isVerified && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  title="Verified Student"
                >
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-[#374151] dark:text-slate-400 font-medium mt-1">
              {user.profile?.major || 'General studies'} • Class of {user.profile?.graduationYear || 'N/A'}
            </p>
          </div>
        </div>

        {/* Reputation Level Widget */}
        <div className="flex flex-col gap-2.5 w-full md:w-auto relative z-10 text-left md:text-right">
          <span className="text-[10px] font-bold text-gray-600 dark:text-slate-500 uppercase tracking-wider">Reputation Score</span>
          <div className="flex items-center gap-2 md:justify-end">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-3xl font-extrabold text-[#000000] dark:text-white">
              {user.profile?.reputationScore || 0}
            </span>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${reputationLevel.style} w-fit md:ml-auto`}>
            {reputationLevel.title}
          </span>
        </div>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link to="/marketplace?sellerId=me" className="glass-card p-6 flex flex-col gap-4 text-left">
          <span className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-primary w-fit"><ShoppingBag className="w-5 h-5" /></span>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#000000] dark:text-white">{stats.activeListings}</span>
            <span className="text-xs text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Active Listings</span>
          </div>
        </Link>
        
        <Link to="/skills" className="glass-card p-6 flex flex-col gap-4 text-left">
          <span className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-primary w-fit"><BookOpen className="w-5 h-5" /></span>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#000000] dark:text-white">{stats.skillRequests}</span>
            <span className="text-xs text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Requests</span>
          </div>
        </Link>

        <Link to="/lost-found" className="glass-card p-6 flex flex-col gap-4 text-left">
          <span className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-primary w-fit"><Search className="w-5 h-5" /></span>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#000000] dark:text-white">{stats.activeClaims}</span>
            <span className="text-xs text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Active Claims</span>
          </div>
        </Link>

        <Link to="/notifications" className="glass-card p-6 flex flex-col gap-4 text-left">
          <span className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-primary w-fit"><Bell className="w-5 h-5" /></span>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#000000] dark:text-white">{stats.unreadNotifs}</span>
            <span className="text-xs text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Unread Alerts</span>
          </div>
        </Link>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (Score and Stats detail) */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col gap-6 text-left">
          <h3 className="font-bold text-lg text-[#000000] dark:text-white">Reputation Breakdown</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-[#374151] dark:text-slate-400">Marketplace Rating</span>
              <span className="flex items-center gap-1 text-sm font-bold text-[#000000] dark:text-slate-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {user.profile?.marketplaceRating || '0.0'}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-[#374151] dark:text-slate-400">Skill Rating</span>
              <span className="flex items-center gap-1 text-sm font-bold text-[#000000] dark:text-slate-200">
                <BookOpen className="w-4 h-4 text-primary" /> {user.profile?.skillRating || '0.0'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-[#374151] dark:text-slate-400">Trust Score</span>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-500">
                <ShieldCheck className="w-4 h-4" /> {user.profile?.trustScore || '100'}%
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-[#374151] dark:text-slate-400">Successful Exchanges</span>
              <span className="text-sm font-bold text-[#000000] dark:text-slate-200">
                {user.profile?.successfulExchanges || 0}
              </span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-[#374151] dark:text-slate-400">Items Returned</span>
              <span className="text-sm font-bold text-[#000000] dark:text-slate-200">
                {user.profile?.itemsReturned || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Right column (Recent Activities & Actions) */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          {/* Quick Actions */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#000000] dark:text-white">Quick Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/marketplace" className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#374151] dark:text-slate-300" /> Browse Marketplace
              </Link>
              <Link to="/skills" className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-[#374151] dark:text-slate-300" /> Exchange Skills
              </Link>
              <Link to="/lost-found" className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                <Search className="w-4 h-4 text-[#374151] dark:text-slate-300" /> Lost & Found
              </Link>
            </div>
          </div>

          {/* Activities List */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#000000] dark:text-white">Recent Activities</h3>
            
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Clock className="w-8 h-8 text-gray-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-[#374151] dark:text-slate-400">No recent activity found. Perform some trades or exchanges to start logging!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700">
                        {getActivityIcon(act.icon)}
                      </div>
                      <span className="text-sm font-semibold text-[#374151] dark:text-slate-200">{act.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 dark:text-slate-500 font-bold uppercase tracking-wider">{act.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
