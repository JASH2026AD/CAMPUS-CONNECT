import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="bg-mesh min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card border rounded-3xl p-8 shadow-premium flex flex-col items-center text-center gap-6">
        <span className="text-8xl select-none animate-float">🧭</span>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-black text-primary">404</h1>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Page Misplaced!</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
            We couldn't verify this path. The campus resource might have been claimed, sold, or moved to a different domain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-premium transition-all transform hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" /> Go to Hub
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-gray-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return Back
          </button>
        </div>
      </div>
    </div>
  );
}
