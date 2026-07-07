import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { 
  Search, PlusCircle, AlertCircle, FileText, Check, X, 
  ShieldAlert, Award, Calendar, MapPin, Inbox, HelpCircle, 
  CheckCircle2, User 
} from 'lucide-react';
import api from '../api/axios';

export default function LostFound() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('lost'); // 'lost', 'found', 'my-claims', 'report'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  // Report Form States
  const [reportType, setReportType] = useState('LOST'); // 'LOST' or 'FOUND'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Claim Modal States
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('LOST');
  const [claimAnswer, setClaimAnswer] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Claims Management States
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'ID Cards', 'Keys', 'Others'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'lost' ? '/lostfound/lost' : '/lostfound/found';
      const res = await api.get(endpoint, {
        params: { category, query }
      });
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching lost/found items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    setClaimsLoading(true);
    try {
      const res = await api.get('/lostfound/user/claims');
      setMyClaims(res.data.myClaims);
      setReceivedClaims(res.data.receivedClaims);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lost' || activeTab === 'found') {
      fetchItems();
    } else if (activeTab === 'my-claims') {
      fetchClaims();
    }
  }, [activeTab, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handlePostReport = async (e) => {
    e.preventDefault();
    if (!title || !description || !location || !eventDate || !verificationQuestion) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setSubmittingReport(true);
    try {
      const endpoint = reportType === 'LOST' ? '/lostfound/lost' : '/lostfound/found';
      const payload = {
        title,
        description,
        category: newCategory,
        location,
        imageUrl,
        verificationQuestion,
        eventDate: new Date(eventDate).toISOString()
      };

      await api.post(endpoint, payload);
      showToast('Report filed successfully.', 'success');
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setImageUrl('');
      setVerificationQuestion('');
      setActiveTab(reportType.toLowerCase());
    } catch (err) {
      console.error('Error posting lost/found report:', err);
      showToast('Failed to log report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleOpenClaim = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setClaimAnswer('');
    setClaimModalOpen(true);
  };

  const handlePostClaim = async (e) => {
    e.preventDefault();
    if (!claimAnswer.trim()) {
      showToast('Please write your claim answer details.', 'warning');
      return;
    }

    setSubmittingClaim(true);
    try {
      await api.post(`/lostfound/claim/${selectedItem.id}`, {
        itemType: selectedItemType,
        answer: claimAnswer
      });
      showToast('Belonging claim filed. The reporter has been notified.', 'success');
      setClaimModalOpen(false);
      setClaimAnswer('');
      fetchItems();
    } catch (err) {
      console.error('Error filing claim:', err);
      showToast(err.response?.data?.error || 'Failed to file claim ownership.', 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleModerateClaim = async (claimId, status) => {
    try {
      await api.put(`/lostfound/claim/${claimId}/moderate`, { status });
      showToast(`Claim moderated: ${status.toLowerCase()}.`, 'success');
      fetchClaims();
    } catch (err) {
      console.error('Error moderating claim:', err);
      showToast('Failed to record moderation choice.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <PageHeader title="Lost & Found Portal" subtitle="Report misplaced items or browse items found across campus grounds" icon={Search} />

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'lost' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-[#374151] dark:hover:text-gray-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-500" /> Lost Items
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'found' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-[#374151] dark:hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Found Items
        </button>
        <button
          onClick={() => setActiveTab('my-claims')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'my-claims' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-[#374151] dark:hover:text-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" /> Claims Moderation
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'report' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-[#374151] dark:hover:text-gray-200'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-primary" /> Report Lost/Found
        </button>
      </div>

      {/* Filters (only for lost/found tabs) */}
      {(activeTab === 'lost' || activeTab === 'found') && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-gray-700 hover:text-primary dark:text-gray-350 border-gray-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search keyword/location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Items list rendering (Lost/Found tabs) */}
      {(activeTab === 'lost' || activeTab === 'found') && (
        loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No ${activeTab} items reported`}
            description={`Everything seems in order. Post a report if you found or lost something!`}
            actionText="Report Item Now"
            onAction={() => setActiveTab('report')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="glass-card overflow-hidden flex flex-col justify-between text-left">
                <div>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400'}
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-6 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase bg-orange-50 dark:bg-orange-950/20 px-2.5 py-0.5 rounded border border-orange-500/10 w-fit">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#000000] dark:text-white line-clamp-1 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#374151] dark:text-slate-400 line-clamp-3 leading-relaxed mt-1">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-col gap-1 text-[11px] text-gray-600 dark:text-slate-500 font-semibold mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(item.lostAt || item.foundAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {item.reporterId === user.id ? (
                    <div className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-black border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-center">
                      Reported by You
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenClaim(item, activeTab.toUpperCase())}
                      className="w-full btn-primary py-2.5 text-xs rounded-xl"
                    >
                      {activeTab === 'lost' ? 'Report Found / Return' : 'Claim Ownership'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Claims Moderation */}
      {activeTab === 'my-claims' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claims user received on their items */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" /> Received Claims (Verify Ownership)
            </h3>
            
            {claimsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : receivedClaims.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No claims received" description="Claims filed by classmates on your reported items will appear here for verification." />
            ) : (
              <div className="flex flex-col gap-4">
                {receivedClaims.map(claim => (
                  <div key={claim.id} className="glass-card p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">
                          Claimed item: {claim.lostItem?.title || claim.foundItem?.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                          <User className="w-3 h-3 text-slate-600" /> Claimant: {claim.claimer.profile?.name}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        claim.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs flex flex-col gap-1.5">
                      <span className="font-bold text-primary flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Verification Question:</span>
                      <p className="italic text-gray-700 dark:text-slate-400">"{claim.lostItem?.verificationQuestion || claim.foundItem?.verificationQuestion}"</p>
                      <div className="border-t border-gray-100 dark:border-slate-800 my-1" />
                      <span className="font-bold text-black dark:text-white">Claimant's Answer:</span>
                      <p className="font-semibold text-[#374151] dark:text-slate-300">"{claim.answer}"</p>
                    </div>

                    {claim.status === 'PENDING' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleModerateClaim(claim.id, 'APPROVED')}
                          className="flex-1 btn-primary py-2 text-xs rounded-xl bg-green-600 hover:bg-green-700"
                        >
                          Approve (Hand Over)
                        </button>
                        <button
                          onClick={() => handleModerateClaim(claim.id, 'REJECTED')}
                          className="flex-1 py-2 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 text-[#374151] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject Answer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Claims user sent */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-primary" /> Your Submitted Claims
            </h3>

            {claimsLoading ? (
              <LoadingSkeleton type="list" count={2} />
            ) : myClaims.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No claims submitted" description="Claims you file on others' items will appear here with verification logs." />
            ) : (
              <div className="flex flex-col gap-4">
                {myClaims.map(claim => (
                  <div key={claim.id} className="glass-card p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">
                          Misplaced: {claim.lostItem?.title || claim.foundItem?.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-500 mt-1">Reporter: {claim.lostItem?.reporter?.profile?.name || claim.foundItem?.reporter?.profile?.name}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        claim.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#374151] dark:text-slate-400">
                      Your answer: "{claim.answer}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Report Item Form */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto w-full glass-card p-6 md:p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-[#000000] dark:text-white">Report Misplaced/Found Belongings</h3>

          <form onSubmit={handlePostReport} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#374151] dark:text-slate-400 uppercase tracking-wider">Report Type *</label>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setReportType('LOST')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    reportType === 'LOST' 
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-600 shadow-xs' 
                      : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-400 bg-white dark:bg-slate-900'
                  }`}
                >
                  Lost Item
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('FOUND')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    reportType === 'FOUND' 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500 text-green-600 shadow-xs' 
                      : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-400 bg-white dark:bg-slate-900'
                  }`}
                >
                  Found Item
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Item Title *</label>
              <input
                type="text"
                placeholder="e.g. Leather Pencil Case"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none font-semibold"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Clothing">Clothing</option>
                  <option value="ID Cards">ID Cards</option>
                  <option value="Keys">Keys</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Event Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none font-semibold"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Photo Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Ownership Verification Question *</label>
              <input
                type="text"
                placeholder="e.g. What color is the folder sticker inside, or what keys are attached?"
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Item Description *</label>
              <textarea
                placeholder="Describe condition, size, any special markings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none h-24 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingReport}
              className="w-full mt-2 btn-primary py-2.5"
            >
              {submittingReport ? 'Filing Report...' : 'Publish Report Listing'}
            </button>
          </form>
        </div>
      )}

      {/* Submit Claim Answer Modal */}
      {claimModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-left relative animate-float">
            <button onClick={() => setClaimModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h3 className="text-lg font-bold text-[#000000] dark:text-white">Verify Ownership Claim</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">Answer the reporter's question to claim this object.</p>

            <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs flex flex-col gap-1">
              <span className="font-bold text-primary flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Owner's Verification Question:</span>
              <p className="italic text-black dark:text-slate-200 font-bold">"{selectedItem.verificationQuestion}"</p>
            </div>

            <form onSubmit={handlePostClaim} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Your Answer *</label>
                <textarea
                  placeholder="Type your verification details here..."
                  value={claimAnswer}
                  onChange={(e) => setClaimAnswer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingClaim}
                className="w-full btn-primary py-2.5 text-xs rounded-xl"
              >
                {submittingClaim ? 'Filing Claim...' : 'Submit Claim Answer'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
