import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { 
  Search, Send, Calendar, Star, Check, X, 
  ShieldAlert, Award, AlertCircle, Users, Inbox, MessageSquare 
} from 'lucide-react';
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
      showToast('Skill exchange request sent.', 'success');
      setReqModalOpen(false);
      setRequestMsg('');
      fetchPartners();
    } catch (err) {
      console.error('Error proposing exchange:', err);
      showToast('Failed to send exchange request.', 'error');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.put(`/skills/request/${requestId}/respond`, { status });
      showToast(`Request ${status.toLowerCase()} successfully.`, 'success');
      fetchRequests();
    } catch (err) {
      console.error('Error responding to request:', err);
      showToast('Failed to record response.', 'error');
    }
  };

  const handleOpenSchedule = (req) => {
    setSelectedRequest(req);
    setScheduleModalOpen(true);
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!scheduleTime) {
      showToast('Please choose a valid time slot.', 'warning');
      return;
    }

    try {
      await api.post(`/skills/request/${selectedRequest.id}/schedule`, {
        scheduledAt: new Date(scheduleTime).toISOString()
      });
      showToast('Session scheduled and synced.', 'success');
      setScheduleModalOpen(false);
      setScheduleTime('');
      fetchRequests();
    } catch (err) {
      console.error('Error scheduling session:', err);
      showToast('Failed to schedule session slot.', 'error');
    }
  };

  const handleOpenRate = (session) => {
    setSelectedSession(session);
    setSessionRating(5);
    setSessionReview('');
    setRateModalOpen(true);
  };

  const handleCompleteSession = async (e) => {
    e.preventDefault();
    if (!sessionReview.trim()) return;

    try {
      await api.post(`/skills/session/${selectedSession.id}/rate`, {
        rating: sessionRating,
        review: sessionReview
      });
      showToast('Session rated! Reputation score adjusted.', 'success');
      setRateModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Error completing session:', err);
      showToast('Failed to complete session.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <PageHeader title="Skill Exchange Network" subtitle="Swap expertise, coding help, languages, and study advice with peers" icon={Users} />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 flex gap-4">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'browse'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <Search className="w-4 h-4" /> Find Study Partners
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <Inbox className="w-4 h-4" /> My Requests
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Scheduled Sessions
        </button>
      </div>

      {/* Tab 1 Content: Browse Partners */}
      {activeTab === 'browse' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[240px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search skills (e.g. React, C++, Physics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
            
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
            >
              <option value="OFFERED">Offering Skill (Learn from them)</option>
              <option value="WANTED">Wanted Skill (Teach them)</option>
            </select>

            <button type="submit" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all">
              Search
            </button>
          </form>

          {browseLoading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : partners.length === 0 ? (
            <EmptyState icon={Users} title="No partners found" description="Try searching for a different skill, or check if study partners have listed tags." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map(p => (
                <div key={p.id} className="glass-card p-6 flex flex-col justify-between gap-5 relative">
                  <div className="flex items-start gap-4">
                    <img
                      src={p.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl bg-orange-50 object-cover shadow-xs border border-gray-100"
                    />
                    <div className="text-left flex-1">
                      <h4 className="font-bold text-black dark:text-slate-100 flex items-center gap-1 text-base">
                        {p.name}
                        {p.skillRating > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 ml-1">
                            ★ {p.skillRating.toFixed(1)}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-600 font-semibold">{p.major || 'Student'} • Class of {p.graduationYear || 'N/A'}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        "{p.bio || 'Available for exchange requests.'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Skills Offered */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Teaches:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.filter(s => s.type === 'OFFERED').map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded-lg bg-green-500/10 border border-green-500/10 text-green-700 dark:text-green-300 text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills Wanted */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Wants:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.filter(s => s.type === 'WANTED').map(s => (
                          <span key={s.id} className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenRequest(p)}
                    className="w-full btn-primary py-2.5 text-xs rounded-xl"
                  >
                    Request Exchange
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
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" /> Received Requests
            </h3>

            {requestsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : requests.filter(r => r.receiverId === user.id).length === 0 ? (
              <EmptyState icon={Inbox} title="No received requests" description="Study partners will reach out here to exchange matching skills." />
            ) : (
              <div className="flex flex-col gap-4">
                {requests.filter(r => r.receiverId === user.id).map(req => (
                  <div key={req.id} className="glass-card p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.sender.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                          alt="Avatar"
                          className="w-9 h-9 rounded-lg bg-orange-50 object-cover border border-gray-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-black dark:text-slate-100">{req.sender.profile?.name}</p>
                          <p className="text-[10px] text-gray-600">Class of {req.sender.profile?.graduationYear}</p>
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

                    <p className="text-xs text-[#374151] dark:text-slate-300 leading-relaxed font-semibold">
                      wants to learn: <span className="text-primary font-bold">"{req.skillName}"</span>
                    </p>
                    
                    {req.message && (
                      <p className="text-xs text-gray-600 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800/40">
                        "{req.message}"
                      </p>
                    )}

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                          className="flex-1 btn-primary py-2 text-xs rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                          className="flex-1 py-2 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 text-[#374151] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {req.status === 'ACCEPTED' && req.sessions.length === 0 && (
                      <button
                        onClick={() => handleOpenSchedule(req)}
                        className="w-full btn-primary py-2 text-xs rounded-xl"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Session
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <Send className="w-4.5 h-4.5 text-primary" /> Sent Requests
            </h3>

            {requestsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : requests.filter(r => r.senderId === user.id).length === 0 ? (
              <EmptyState icon={Send} title="No sent requests" description="Reach out to students on the browsing tab to request skill matches." />
            ) : (
              <div className="flex flex-col gap-4">
                {requests.filter(r => r.senderId === user.id).map(req => (
                  <div key={req.id} className="glass-card p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.receiver.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                          alt="Avatar"
                          className="w-9 h-9 rounded-lg bg-orange-50 object-cover border border-gray-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-black dark:text-slate-100">{req.receiver.profile?.name}</p>
                          <p className="text-[10px] text-gray-600">Class of {req.receiver.profile?.graduationYear}</p>
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

                    <p className="text-xs text-[#374151] dark:text-slate-300 leading-relaxed font-semibold">
                      Requested to learn: <span className="text-primary font-bold">"{req.skillName}"</span>
                    </p>
                    
                    {req.status === 'ACCEPTED' && req.sessions.length === 0 && (
                      <button
                        onClick={() => handleOpenSchedule(req)}
                        className="w-full btn-primary py-2 text-xs rounded-xl"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Session
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
          <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Active Scheduled Sessions
          </h3>

          {requestsLoading ? (
            <LoadingSkeleton type="list" count={2} />
          ) : !requests.some(r => r.sessions.length > 0) ? (
            <EmptyState icon={Calendar} title="No active sessions" description="Accept a request and schedule a calendar session slot to track completion." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.flatMap(req => req.sessions.map(sess => {
                const isSender = req.senderId === user.id;
                const partnerProfile = isSender ? req.receiver.profile : req.sender.profile;
                const rated = isSender ? sess.ratingToReceiver !== null : sess.ratingToSender !== null;

                return (
                  <div key={sess.id} className="glass-card p-6 flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-primary">
                          <Users className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black dark:text-white">{req.skillName} Exchange</p>
                          <p className="text-xs text-gray-600 dark:text-slate-500">Partner: {partnerProfile?.name}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sess.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {sess.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 text-xs font-semibold">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-slate-600 dark:text-gray-300">
                        Scheduled for: {new Date(sess.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    {sess.status === 'SCHEDULED' && !rated && (
                      <button
                        onClick={() => handleOpenRate(sess)}
                        className="w-full btn-primary py-2.5 text-xs rounded-xl"
                      >
                        Complete Exchange & Rate Partner
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setReqModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h3 className="text-lg font-bold text-black dark:text-white">Propose Skill Exchange</h3>
            <p className="text-xs text-gray-600 dark:text-slate-500">Requesting learning matching with <strong className="text-black dark:text-white">{selectedPartner.name}</strong>.</p>

            <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Skill You Want To Learn *</label>
                <input
                  type="text"
                  placeholder="e.g. React.js"
                  value={exchangeSkill}
                  onChange={(e) => setExchangeSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Personal Message</label>
                <textarea
                  placeholder="Tell them what you can teach in return (e.g. C++ or Spanish) and when you're free..."
                  value={requestMsg}
                  onChange={(e) => setRequestMsg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs rounded-xl"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setScheduleModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h3 className="text-lg font-bold text-black dark:text-white">Schedule Study Session</h3>
            <p className="text-xs text-gray-600 dark:text-slate-500">Lock down a date and time slot for matching.</p>

            <form onSubmit={handleScheduleSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Session Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs rounded-xl"
              >
                Schedule Session Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete & Rate Session Modal */}
      {rateModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setRateModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h3 className="text-lg font-bold text-black dark:text-white">Complete & Rate Partner</h3>
            <p className="text-xs text-gray-600 dark:text-slate-500">Rate your partner's helpfulness. Both ratings must be logged to complete session.</p>

            <form onSubmit={handleCompleteSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Partner Rating</label>
                <div className="flex gap-1.5 mt-1">
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
                <label className="text-xs font-bold text-gray-600 uppercase">Review Feedback</label>
                <textarea
                  placeholder="Describe your study session handoff quality (e.g. Alice explained React context very clearly)..."
                  value={sessionReview}
                  onChange={(e) => setSessionReview(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs rounded-xl bg-green-600 hover:bg-green-700"
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
