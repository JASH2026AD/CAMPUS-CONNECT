import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { MessageSquare, Check, Trash, Flag, Star, ShieldAlert, BadgePercent, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function ProductDetails() {
  const { itemId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report modal states
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchItemDetails = async () => {
    try {
      const res = await api.get(`/marketplace/${itemId}`);
      setItem(res.data);
    } catch (err) {
      console.error('Error fetching marketplace item detail:', err);
      showToast('Listing not found or has been removed.', 'error');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const handleMarkAsSold = async () => {
    if (!window.confirm('Are you sure you want to mark this item as sold?')) return;
    try {
      await api.put(`/marketplace/${itemId}/sold`);
      showToast('Item marked as sold! Reputation points awarded. 🎉', 'success');
      fetchItemDetails();
    } catch (err) {
      console.error('Error marking item sold:', err);
      showToast('Failed to update listing status.', 'error');
    }
  };

  const handleChatSeller = async () => {
    try {
      // Create an initial message or just redirect to chat with query params
      // Our chat page will automatically open a conversation with the contact
      navigate(`/chat?contactId=${item.sellerId}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Review comment cannot be empty.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      showToast('AI Review Analyzer is evaluating review content... 🧠', 'info');
      await api.post(`/marketplace/${itemId}/review`, {
        rating,
        comment
      });
      showToast('Review evaluated by Gemini AI and posted successfully! ✨', 'success');
      setComment('');
      setRating(5);
      fetchItemDetails();
    } catch (err) {
      console.error('Error posting review:', err);
      showToast('Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportListing = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setSubmittingReport(true);
    try {
      await api.post(`/marketplace/${itemId}/report`, {
        reason: reportReason
      });
      showToast('Listing reported to campus moderation team.', 'success');
      setReportOpen(false);
      setReportReason('');
    } catch (err) {
      console.error('Report error:', err);
      showToast('Failed to file report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  const isSeller = item.sellerId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 text-left">
      <Link to="/marketplace" className="text-xs font-bold text-primary hover:underline transition-colors w-fit">
        ← Back to Marketplace
      </Link>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/20 shadow-premium p-4">
          <img
            src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={item.title}
            className="w-full h-80 md:h-[420px] object-cover rounded-2xl"
          />
        </div>

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-bold text-primary bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20 uppercase">
                {item.category}
              </span>
              
              {item.status === 'SOLD' && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 text-xs font-bold">
                  SOLD 🤝
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {item.title}
            </h1>
            
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              ${item.price.toFixed(2)}
            </p>
          </div>

          <div className="border-t border-gray-200/40 dark:border-slate-800/40 my-1" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Description</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Seller profile overview */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-gray-200/30 dark:border-slate-800/50 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img
                src={item.seller?.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                alt="Seller"
                className="w-11 h-11 rounded-xl bg-orange-50 object-cover"
              />
              <div className="text-left">
                <p className="text-xs text-gray-400 font-bold">Seller Profile</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.seller?.profile?.name || 'Student'}
                </p>
                <p className="text-[10px] text-gray-400">
                  {item.seller?.profile?.major || 'General studies'}
                </p>
              </div>
            </div>

            {/* Ratings & badges */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex flex-col items-center">
                <span className="text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {item.seller?.profile?.marketplaceRating > 0 ? item.seller.profile.marketplaceRating.toFixed(1) : 'New'}
                </span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase">Rating</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-500">
                  {item.seller?.profile?.trustScore || 100}%
                </span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase">Trust Score</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-primary">
                  {item.seller?.profile?.reputationScore || 0}
                </span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase">Reputation</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {isSeller ? (
              item.status === 'AVAILABLE' && (
                <button
                  onClick={handleMarkAsSold}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow-premium transition-all"
                >
                  <Check className="w-5 h-5" /> Mark as Sold
                </button>
              )
            ) : (
              <>
                <button
                  onClick={handleChatSeller}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-premium transition-all"
                >
                  <MessageSquare className="w-5 h-5" /> Chat with Seller
                </button>
                
                <button
                  onClick={() => setReportOpen(true)}
                  className="p-3 text-gray-500 hover:bg-rose-500/10 hover:text-rose-500 border border-gray-300 dark:border-slate-800 rounded-xl transition-all"
                  title="Report Listing"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Analyzer System (AI Review Reviewer Showcase) */}
      <div className="border-t border-gray-200/40 dark:border-slate-800/40 my-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Review Form */}
        <div className="lg:col-span-1 glass-card border rounded-2xl p-6 shadow-premium flex flex-col gap-4 text-left">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Leave Seller Review</h3>
          <p className="text-xs text-gray-400">Your feedback will be automatically evaluated by the CampusConnect AI review moderator.</p>

          {!isSeller ? (
            <form onSubmit={handleAddReview} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${num <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Comment *</label>
                <textarea
                  placeholder="Tell us about the transaction quality, product speed, or seller communication..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Analyzing & Posting...' : 'Submit Feedback 🧠'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-xl text-center">
              <span className="text-xs text-slate-500 font-bold">You are the seller of this listing. You cannot write a self-review.</span>
            </div>
          )}
        </div>

        {/* Right Column: Reviews Log with Gemini AI Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            AI Review Reviews 🤖
          </h3>

          {(!item.reviews || item.reviews.length === 0) ? (
            <EmptyState emoji="⭐" title="No reviews yet" description="Be the first to leave a verified review. Reviews are scanned by Google Gemini for authenticity." />
          ) : (
            <div className="flex flex-col gap-4">
              {item.reviews.map(review => {
                const isSpam = review.spamProbability > 0.6;
                const sentimentColors = {
                  Positive: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                  Negative: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                  Neutral: 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                };

                return (
                  <div key={review.id} className="glass-panel border rounded-2xl p-5 shadow-premium flex flex-col gap-3 relative text-left">
                    {/* Header: User & Rating */}
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          👤 {review.reviewer?.profile?.name || 'Verified Student'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-400 font-semibold">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                      "{review.comment}"
                    </p>

                    {/* AI Review Analyzer Breakdown section */}
                    <div className="mt-2 p-3 bg-white/60 dark:bg-slate-900/40 border border-gray-200/40 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                          🧠 AI Assessment Breakdown
                        </span>
                        
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${sentimentColors[review.sentiment] || sentimentColors.Neutral}`}>
                          {review.sentiment || 'Neutral'}
                        </span>
                      </div>

                      {/* AI Summary */}
                      {review.summary && (
                        <p className="text-[11px] italic text-slate-500 dark:text-gray-400 leading-relaxed">
                          <strong className="text-[10px] uppercase font-bold text-gray-400 not-italic block mb-0.5">AI Summary</strong>
                          "{review.summary}"
                        </p>
                      )}

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] leading-relaxed">
                        {review.pros && (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-emerald-500 uppercase tracking-wide">Pros Listed:</span>
                            <p className="text-slate-500 dark:text-gray-400">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-rose-500 uppercase tracking-wide">Cons Listed:</span>
                            <p className="text-slate-500 dark:text-gray-400">{review.cons}</p>
                          </div>
                        )}
                      </div>

                      {/* Trust & Spam probabilities */}
                      <div className="flex justify-between items-center text-[10px] font-semibold border-t border-gray-200/20 dark:border-slate-800/40 pt-2 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                          🛡️ Trust Score: <span className="font-bold text-slate-700 dark:text-white">{review.trustPercentage || 100}%</span>
                        </span>
                        
                        <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                          🚨 Spam Likelihood: <span className={`font-bold ${isSpam ? 'text-rose-500' : 'text-slate-700 dark:text-white'}`}>{Math.round((review.spamProbability || 0) * 100)}%</span>
                        </span>
                      </div>

                      {/* Warning Flag */}
                      {isSpam && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          <ShieldAlert className="w-4.5 h-4.5" />
                          <span>AI WARNING: Suspended Spam Review pattern detected. Seller trust profile adjusted.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel border rounded-3xl p-6 shadow-premium flex flex-col gap-4 text-left relative animate-float">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Report Marketplace Listing</h3>
            
            <form onSubmit={handleReportListing} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Reason for Report *</label>
                <textarea
                  placeholder="e.g. Inappropriate item, pricing scam, illegal seller behavior..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-24 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-premium transition-all disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'File Violation Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
