import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShoppingBag, Users, Search, Brain, 
  ShieldCheck, Sparkles, Award, GraduationCap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-mesh min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[100px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Content */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          {/* Subtle Announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-[#374151] dark:text-slate-200 w-fit text-xs font-semibold">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Exclusively for Verified College Students
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-[-0.02em] text-[#000000] dark:text-white leading-[1.15]">
            The Hub for Your <br className="hidden sm:inline" />
            <span className="text-primary">Campus Life</span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#374151] dark:text-slate-400 max-w-xl leading-relaxed">
            CampusConnect bridges college students to trade goods, exchange coding or creative skills, report lost belongings, and analyze buyer reviews using advanced AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Join CampusConnect <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Hero Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200/20 dark:border-slate-800/25 mt-8">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-[#000000] dark:text-white">500+</span>
              <span className="text-xs text-[#374151] dark:text-slate-400 font-medium">Verified Students</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-[#000000] dark:text-white">120+</span>
              <span className="text-xs text-[#374151] dark:text-slate-400 font-medium">Items Listed</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-[#000000] dark:text-white">80+</span>
              <span className="text-xs text-[#374151] dark:text-slate-400 font-medium">Skill Exchanges</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-[#000000] dark:text-white">35+</span>
              <span className="text-xs text-[#374151] dark:text-slate-400 font-medium">Lost Items Returned</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Interactive App Mockup */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="absolute w-72 h-72 bg-gradient-to-r from-orange-400/5 to-primary/5 rounded-full blur-3xl" />
          
          <div className="relative glass-card w-full max-w-sm rounded-2xl p-6 shadow-sm border border-gray-200/30 dark:border-slate-800/20 flex flex-col gap-5">
            {/* Top Bar */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-[#000000] dark:text-white">Student Hub</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-500/20">
                ACTIVE
              </span>
            </div>

            {/* Simulated Widgets */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-orange-100/50 dark:bg-orange-950/20 text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Skill Exchange</p>
                  <p className="text-xs font-bold text-[#000000] dark:text-slate-200">React request from Bob</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-orange-100/50 dark:bg-orange-950/20 text-primary">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Marketplace</p>
                  <p className="text-xs font-bold text-[#000000] dark:text-slate-200">TI-84 calculator listed: $50</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-orange-100/50 dark:bg-orange-950/20 text-primary">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] text-[#374151] dark:text-slate-400 font-semibold uppercase tracking-wider">Gemini Trust Score</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-450">98% Verified Seller rating</p>
                </div>
              </div>
            </div>
            
            {/* Reputation Meter */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold text-black dark:text-slate-300">
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-primary" /> Reputation Level</span>
                <span className="text-xs text-primary font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Elite Partner
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Grids */}
      <section className="bg-slate-50/60 dark:bg-slate-900/40 border-y border-gray-200/20 dark:border-slate-800/20 py-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-[36px] font-bold text-[#000000] dark:text-white tracking-tight">One Unified Ecosystem</h2>
            <p className="text-base text-[#374151] dark:text-slate-400 leading-relaxed mt-2">
              CampusConnect is carefully engineered to handle your college necessities. Four pillars, one cohesive dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#000000] dark:text-slate-150">Skill Exchange</h3>
              <p className="text-sm text-[#374151] dark:text-slate-450 leading-relaxed">
                Connect with students offering coding, hardware, and design support. Form scheduling and rating networks.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#000000] dark:text-slate-150">Campus Marketplace</h3>
              <p className="text-sm text-[#374151] dark:text-slate-450 leading-relaxed">
                List lab equipment, textbooks, or stationary. Connect with student sellers in direct chat securely.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#000000] dark:text-slate-150">Lost & Found Portal</h3>
              <p className="text-sm text-[#374151] dark:text-slate-450 leading-relaxed">
                Report lost items, list found keys or bags, answer verification questions, and reclaim belongings.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#000000] dark:text-slate-150">AI Review Analyzer</h3>
              <p className="text-sm text-[#374151] dark:text-slate-450 leading-relaxed">
                Power reviews using Google Gemini to extract pros/cons list, predict fake spam reviews, and measure seller ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-gray-200/25 dark:border-slate-800/25 text-center text-xs text-gray-600 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} CampusConnect. Built with React + Express + Prisma + Gemini.
      </footer>
    </div>
  );
}
