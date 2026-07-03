import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Users, Search, Brain, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-mesh min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-primary w-fit text-xs font-bold uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" /> Exclusively for Verified Students
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            The Hub for Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Campus Life
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 dark:text-gray-400 max-w-lg leading-relaxed">
            CampusConnect bridges college students to trade goods, exchange coding or creative skills, report lost belongings, and analyze buyer reviews using advanced AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-premium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-premium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Join CampusConnect <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Interactive App Mockup */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 bg-gradient-to-r from-orange-400/20 to-primary/20 rounded-full blur-3xl" />
          
          <div className="relative glass-card border border-white/20 rounded-3xl p-6 shadow-premium max-w-sm w-full animate-float flex flex-col gap-5">
            {/* Top Bar */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/40 dark:border-slate-800/40">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">🚀 Student Dashboard</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold">ACTIVE</span>
            </div>

            {/* Simulated Widgets */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/30 border border-white/40 dark:border-slate-800">
                <span className="text-xl">🤝</span>
                <div className="text-left">
                  <p className="text-xs text-gray-400">Skill Exchange</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">React.js request from Bob</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/30 border border-white/40 dark:border-slate-800">
                <span className="text-xl">🛒</span>
                <div className="text-left">
                  <p className="text-xs text-gray-400">Marketplace</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Calculated TI-84 sold: $50</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/30 border border-white/40 dark:border-slate-800">
                <span className="text-xl">🤖</span>
                <div className="text-left">
                  <p className="text-xs text-gray-400">AI Trust Score</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Review evaluation: 94% Trustworthy</p>
                </div>
              </div>
            </div>
            
            {/* Reputation Meter */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Reputation Level</span>
                <span className="text-primary">Master Tier ✨</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-gradient-to-r from-primary to-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Grids */}
      <section className="bg-white/40 dark:bg-slate-900/40 border-y border-gray-200/30 dark:border-slate-800/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">One Unified Ecosystem</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              CampusConnect is carefully engineered to handle your college necessities. Four pillars, one cohesive dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-2xl border hover:border-primary/30 transition-all hover:shadow-lg flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-500/10 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Skill Exchange</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect with students offering coding, hardware, and design support. Form scheduling and rating networks.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-2xl border hover:border-primary/30 transition-all hover:shadow-lg flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-500/10 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Campus Marketplace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                List lab equipment, textbooks, or stationary. Connect with student sellers in direct chat securely.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-2xl border hover:border-primary/30 transition-all hover:shadow-lg flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-500/10 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Lost & Found Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Report lost items, list found keys or bags, answer verification questions, and reclaim belongings.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-6 rounded-2xl border hover:border-primary/30 transition-all hover:shadow-lg flex flex-col gap-4 text-left group">
              <div className="p-3 rounded-xl bg-orange-500/10 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">AI Review Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Power reviews using Google Gemini to extract pros/cons list, predict fake spam reviews, and measure seller ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-gray-200/30 dark:border-slate-800/30 text-center text-xs text-gray-400 dark:text-slate-500">
        © {new Date().getFullYear()} CampusConnect. Built with React + Express + Prisma + Gemini.
      </footer>
    </div>
  );
}
