import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="bg-mesh min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card p-8 flex flex-col items-center text-center gap-6">
        <Compass className="w-20 h-20 text-primary animate-pulse" />
        
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-[#000000] dark:text-white tracking-tight">Page Misplaced</h2>
          <p className="text-sm text-[#374151] dark:text-slate-400 leading-relaxed max-w-xs mt-1">
            We couldn't verify this path. The campus resource might have been claimed, sold, or moved to a different domain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex-1 btn-primary py-2.5 text-xs rounded-xl"
          >
            <Home className="w-4 h-4" /> Go to Hub
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 btn-secondary py-2.5 text-xs rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Return Back
          </button>
        </div>
      </div>
    </div>
  );
}
