import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { Search, Send, Calendar, Star, Check, X, ShieldAlert, Award, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function SkillExchange() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'requests', 'sessions'
  
  // Tab 1: Browse states
  const [partners, setPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('OFFERED'); // search by offered skills
  const [browseLoading, setBrowseLoading] = useState(false);

  // Exchange Request modal
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [exchangeSkill, setExchangeSkill] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  
  // Tab 2: Requests states
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Schedule session states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');

  // Rating modal states
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRating, setSessionRating] = useState(5);
  const [sessionReview, setSessionReview] = useState('');

  // Fetch partners
  const fetchPartners = async () => {
    setBrowseLoading(true);
    try {
      const res = await api.get('/skills/search', {
        params: { query: searchQuery, type: searchType }
      });
      // Filter out current user from results
      setPartners(res.data.filter(p => p.userId !== user.id));
    } catch (err) {
      console.error('Error searching partners:', err);
    } finally {
      setBrowseLoading(false);
    }
  };

  // Fetch requests & history
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await api.get('/skills/history');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching skill requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchPartners();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPartners();
  };

  const handleOpenRequest = (partner) => {
    setSelectedPartner(partner);
    // Suggest first offered skill as exchange target
    const offered = partner.skills.filter(s => s.type === 'OFFERED')[0]?.name || '';
    setExchangeSkill(offered);
    setReqModalOpen(true);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!exchangeSkill) {
      showToast('Please specify the skill name you want to learn.', 'warning');
      return;
    }

    try {
      await api.post('/skills/request', {
        receiverId: selectedPartner.userId,
        skillName: exchangeSkill,
        message: requestMsg
      });

      showToast('Skill exchange request sent! 🤝', 'success');
      setReqModalOpen(false);
      setRequestMsg('');
    } catch (err) {
      console.error('Error sending skill request:', err);
      showToast(err.response?.data?.error || 'Failed to send request.', 'error');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.put(`/skills/request/${requestId}`, { status });
      showToast(`Exchange request ${status.toLowerCase()}!`, 'success');
      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      showToast('Failed to update request.', 'error');
    }
  };

  const handleOpenSchedule = (req) => {
    setSelectedRequest(req);
    setScheduleModalOpen(true);
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!scheduleTime) return;

    try {
      await api.post('/skills/session', {
        requestId: selectedRequest.id,
        scheduledAt: scheduleTime
      });

      showToast('Exchange session scheduled successfully! 📅', 'success');
      setScheduleModalOpen(false);
      setScheduleTime('');
      fetchRequests();
    } catch (err) {
      console.error('Scheduling error:', err);
      showToast('Failed to schedule session.', 'error');
    }
  };

  const handleOpenRate = (session) => {
    setSelectedSession(session);
    setRateModalOpen(true);
  };

  const handleCompleteSession = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/skills/session/${selectedSession.id}/complete`, {
        rating: sessionRating,
        review: sessionReview
      });

      showToast('Session rated! Reputation score and skills profile adjusted. ✨', 'success');
      setRateModalOpen(false);
      setSessionReview('');
      setSessionRating(5);
      fetchRequests();
    } catch (err) {
      console.error('Error rating session:', err);
      showToast('Failed to complete session.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <PageHeader title="Skill Exchange Network" subtitle="Swap expertise, coding help, languages, and study advice with peers" emoji="🤝" />

      {/* Tabs */}
      <div className="border-b border-gray-200/40 dark:border-slate-800/40 flex gap-4">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'browse'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Find Study Partners 🔍
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          My Requests 📩
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Scheduled Sessions 📅
        </button>
      </div>

      {/* Tab 1 Content: Browse Partners */}
      {activeTab === 'browse' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[240px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search skills (e.g. React, C++, Physics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
            
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-xs font-bold focus:outline-none"
            >
              <option value="OFFERED">Offering Skill (Learn from them)</option>
              <option value="WANTED">Wanted Skill (Teach them)</option>
            </select>

            <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium">
              Search
            </button>
          </form>

          {browseLoading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : partners.length === 0 ? (
            <EmptyState emoji="🕵️" title="No partners found" description="Try searching for a different skill, or check if study partners have listed tags." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map(p => (
                <div key={p.id} className="glass-card border rounded-2xl p-5 shadow-premium flex flex-col justify-between gap-5 relative hover:scale-[1.01] transition-transform">
                  <div className="flex items-start gap-4">
                    <img
                      src={p.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl bg-orange-50 object-cover shadow-sm"
                    />
                    <div className="text-left flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        {p.name}
                        {p.skillRating > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 ml-1">
                            ★ {p.skillRating.toFixed(1)}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{p.major || 'Student'} • Class of {p.graduationYear || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        "{p.bio || 'Available for exchange requests.'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Skills Offered */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Teaches:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.filter(s => s.type === 'OFFERED').map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills Wanted */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Wants:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.filter(s => s.type === 'WANTED').map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenRequest(p)}
                    className="w-full mt-2 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium"
                  >
                    Request Exchange 🤝
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Requests logs */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Incoming Requests */}
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
              📥 Received Requests
            </h3>

            {requestsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : requests.filter(r => r.receiverId === user.id).length === 0 ? (
              <EmptyState emoji="📥" title="No received requests" description="Study partners will reach out here to exchange matching skills." />
            ) : (
              <div className="flex flex-col gap-4">
                {requests.filter(r => r.receiverId === user.id).map(req => (
                  <div key={req.id} className="glass-panel border rounded-2xl p-5 shadow-premium flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.sender.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                          alt="Avatar"
                          className="w-9 h-9 rounded-lg bg-orange-50 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{req.sender.profile?.name}</p>
                          <p className="text-[10px] text-gray-400">Class of {req.sender.profile?.graduationYear}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      wants to learn: <span className="text-primary font-bold">"{req.skillName}"</span>
                    </p>
                    
                    {req.message && (
                      <p className="text-xs text-gray-400 italic bg-white/50 dark:bg-slate-900/20 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800/40">
                        "{req.message}"
                      </p>
                    )}

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-premium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                          className="flex-1 py-2 border border-gray-300 dark:border-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {req.status === 'ACCEPTED' && req.sessions.length === 0 && (
                      <button
                        onClick={() => handleOpenSchedule(req)}
                        className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium"
                      >
                        Schedule Session 📅
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
              📤 Sent Requests
            </h3>

            {requestsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : requests.filter(r => r.senderId === user.id).length === 0 ? (
              <EmptyState emoji="📤" title="No sent requests" description="Reach out to students on the browsing tab to request skill matches." />
            ) : (
              <div className="flex flex-col gap-4">
                {requests.filter(r => r.senderId === user.id).map(req => (
                  <div key={req.id} className="glass-panel border rounded-2xl p-5 shadow-premium flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.receiver.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                          alt="Avatar"
                          className="w-9 h-9 rounded-lg bg-orange-50 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{req.receiver.profile?.name}</p>
                          <p className="text-[10px] text-gray-400">Class of {req.receiver.profile?.graduationYear}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      Requested to learn: <span className="text-primary font-bold">"{req.skillName}"</span>
                    </p>
                    
                    {req.status === 'ACCEPTED' && req.sessions.length === 0 && (
                      <button
                        onClick={() => handleOpenSchedule(req)}
                        className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium"
                      >
                        Schedule Session 📅
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3 Content: Scheduled Sessions */}
      {activeTab === 'sessions' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
            📅 Active Scheduled Sessions
          </h3>

          {requestsLoading ? (
            <LoadingSkeleton type="list" count={2} />
          ) : !requests.some(r => r.sessions.length > 0) ? (
            <EmptyState emoji="📅" title="No active sessions" description="Accept a request and schedule a calendar session slot to track completion." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.flatMap(req => req.sessions.map(sess => {
                const isSender = req.senderId === user.id;
                const partnerProfile = isSender ? req.receiver.profile : req.sender.profile;
                const rated = isSender ? sess.ratingToReceiver !== null : sess.ratingToSender !== null;

                return (
                  <div key={sess.id} className="glass-panel border rounded-2xl p-5 shadow-premium flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🤝</span>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{req.skillName} Exchange</p>
                          <p className="text-xs text-gray-400">Partner: {partnerProfile?.name}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sess.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {sess.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-800/40 text-xs">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-slate-600 dark:text-gray-300 font-semibold">
                        Scheduled for: {new Date(sess.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    {sess.status === 'SCHEDULED' && !rated && (
                      <button
                        onClick={() => handleOpenRate(sess)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-950 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Complete Exchange & Rate Partner ✨
                      </button>
                    )}

                    {rated && (
                      <div className="flex items-center gap-1.5 p-2 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] text-green-600 dark:text-green-400 font-bold">
                        <Check className="w-4 h-4" />
                        <span>You rated your partner for this exchange. Waiting for session sync.</span>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          )}
        </div>
      )}

      {/* Exchange Request Modal */}
      {reqModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel border rounded-3xl p-6 shadow-premium flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setReqModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Propose Skill Exchange</h3>
            <p className="text-xs text-gray-400">Requesting learning matching with <strong className="text-slate-800 dark:text-white">{selectedPartner.name}</strong>.</p>

            <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Skill You Want To Learn *</label>
                <input
                  type="text"
                  placeholder="e.g. React.js"
                  value={exchangeSkill}
                  onChange={(e) => setExchangeSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Personal Message</label>
                <textarea
                  placeholder="Tell them what you can teach in return (e.g. C++ or Spanish) and when you're free..."
                  value={requestMsg}
                  onChange={(e) => setRequestMsg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium"
              >
                Send Propose request 📩
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel border rounded-3xl p-6 shadow-premium flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setScheduleModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Schedule Study Session</h3>
            <p className="text-xs text-gray-400">Lock down a date and time slot for matching.</p>

            <form onSubmit={handleScheduleSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Session Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium"
              >
                Schedule Session Slot 📅
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete & Rate Session Modal */}
      {rateModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel border rounded-3xl p-6 shadow-premium flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setRateModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Complete & Rate Partner</h3>
            <p className="text-xs text-gray-400">Rate your partner's helpfulness. Both ratings must be logged to complete session.</p>

            <form onSubmit={handleCompleteSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Partner Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSessionRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${num <= sessionRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Review Feedback</label>
                <textarea
                  placeholder="Describe your study session handoff quality (e.g. Alice explained React context very clearly)..."
                  value={sessionReview}
                  onChange={(e) => setSessionReview(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-premium"
              >
                Complete & Submit Rating
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
