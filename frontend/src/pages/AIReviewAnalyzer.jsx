import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Common';
import { Brain, Star, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function AIReviewAnalyzer() {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      showToast('Please paste or type some review text first.', 'warning');
      return;
    }

    setLoading(true);
    try {
      showToast('Google Gemini is auditing content details... 🧠', 'info');
      // Call general analyze endpoint
      const res = await api.post('/marketplace/analyze', { comment: inputText });
      setResult(res.data);
      showToast('Review evaluated successfully! ✨', 'success');
    } catch (err) {
      console.error('Error analyzing review:', err);
      showToast('Failed to evaluate review text.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Negative': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Neutral':
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const sampleReviews = [
    {
      text: "Scam listing! Item is completely broken and the seller refused to refund my cash. Avoid this user at all costs!",
      label: "Negative/Spam Example"
    },
    {
      text: "The textbook is in absolute perfect condition. Handed it over on time at the library. Awesome trade!",
      label: "Positive/Genuine Example"
    },
    {
      text: "CLICK HERE to earn free points! Buy now at www.promolink.com/campus connect free points. Scam code 123",
      label: "Ad/Spam Promo Code"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 text-left">
      <PageHeader title="AI Review Analyzer" subtitle="Leverage Google Gemini to instantly audit reviews, flag fake spam, and measure trust scores" emoji="🤖" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Input Sandbox */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card border rounded-2xl p-6 shadow-premium flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Evaluation Sandbox
            </h3>
            
            <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Review Text *</label>
                <textarea
                  placeholder="Paste transaction feedback, buyer reviews, or listing descriptions to inspect..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-slate-800 dark:text-white focus:outline-none h-36 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  'Run Audit Analysis 🧠'
                )}
              </button>
            </form>
          </div>

          {/* Quick Sandbox Presets */}
          <div className="glass-card border rounded-2xl p-6 shadow-premium flex flex-col gap-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Sample Presets</h4>
            <div className="flex flex-col gap-2">
              {sampleReviews.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(sample.text)}
                  className="text-left p-2.5 rounded-lg bg-white/40 dark:bg-slate-900/20 hover:bg-primary/5 hover:border-primary/20 border border-gray-200/40 dark:border-slate-800/40 text-[10px] text-slate-600 dark:text-gray-300 font-medium transition-all"
                >
                  <strong className="text-primary block mb-0.5">{sample.label}</strong>
                  "{sample.text.substring(0, 50)}..."
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Reports */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Audit Report</h3>
          
          {!result ? (
            <div className="flex flex-col items-center justify-center p-12 text-center glass-card border rounded-2xl min-h-[300px]">
              <Brain className="w-12 h-12 text-gray-300 mb-4 animate-float" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Awaiting Input</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Paste a review on the left and run analysis to view the extracted sentiment, trust scores, and pros/cons tags.</p>
            </div>
          ) : (
            <div className="glass-card border rounded-3xl p-6 md:p-8 shadow-premium flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-primary/10 to-orange-400/5 rounded-full blur-3xl" />
              
              {/* Header metrics */}
              <div className="flex justify-between items-start gap-4 flex-wrap relative z-10">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Extracted Sentiment</span>
                  <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-extrabold border ${getSentimentStyle(result.sentiment)} mt-1`}>
                    {result.sentiment || 'Neutral'}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* Trust Rating Gauge */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trust Index</span>
                    <span className={`text-2xl font-black ${result.trustPercentage >= 70 ? 'text-emerald-500' : 'text-amber-500'} mt-0.5`}>
                      {result.trustPercentage || 100}%
                    </span>
                  </div>

                  {/* Spam Probability Gauge */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spam Probability</span>
                    <span className={`text-2xl font-black ${result.spamProbability > 0.6 ? 'text-rose-500' : 'text-slate-700 dark:text-white'} mt-0.5`}>
                      {Math.round((result.spamProbability || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200/40 dark:border-slate-800/40 my-1 relative z-10" />

              {/* AI Summary */}
              <div className="flex flex-col gap-2 text-left relative z-10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Executive Summary</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 italic bg-white/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-gray-200/30 dark:border-slate-800/50 leading-relaxed">
                  "{result.summary || 'No summary extracted.'}"
                </p>
              </div>

              {/* Pros & Cons list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
                {/* Pros */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Strengths / Pros
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.pros && (Array.isArray(result.pros) ? result.pros : result.pros.split(',')).map((pro, idx) => (
                      <li key={idx} className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500">•</span> {pro.trim()}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5" /> Weaknesses / Cons
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.cons && (Array.isArray(result.cons) ? result.cons : result.cons.split(',')).map((con, idx) => (
                      <li key={idx} className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-rose-500">•</span> {con.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Spam Warning */}
              {result.spamProbability > 0.6 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-3 relative z-10 text-left mt-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-sm text-rose-700 dark:text-rose-400">High Spam Probability Detected</p>
                    <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400/80 font-medium">This text contains commercial promo codes, suspect URL structures, or repetitive review copy matching spam index criteria.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
