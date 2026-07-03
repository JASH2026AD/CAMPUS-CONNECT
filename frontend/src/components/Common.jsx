import React from 'react';
import { RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Premium Pulsing Loading Skeleton
export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderItem = (key) => {
    if (type === 'card') {
      return (
        <div key={key} className="glass-card rounded-2xl p-5 w-full flex flex-col gap-4 animate-pulse">
          <div className="w-full h-48 bg-gray-200/50 dark:bg-slate-700/50 rounded-xl" />
          <div className="h-6 w-3/4 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
          <div className="h-4 w-1/2 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-1/4 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
            <div className="h-8 w-1/4 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      );
    }
    
    if (type === 'list') {
      return (
        <div key={key} className="glass-panel border-b border-gray-200/30 dark:border-slate-800/30 p-4 flex gap-4 items-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200/50 dark:bg-slate-700/50" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-5 w-1/3 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
            <div className="h-4 w-2/3 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      );
    }

    if (type === 'chat') {
      return (
        <div key={key} className="flex flex-col gap-4 animate-pulse p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-slate-700/50" />
            <div className="h-10 w-2/5 bg-gray-200/50 dark:bg-slate-700/50 rounded-xl" />
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="h-10 w-1/3 bg-primary/20 rounded-xl" />
            <div className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-slate-700/50" />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
      {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
    </div>
  );
};

// Premium Empty State Display
export const EmptyState = ({
  emoji = '📪',
  title = 'No items found',
  description = 'There are no active entries listed at the moment.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl my-6">
      <span className="text-6xl mb-4 animate-float select-none">{emoji}</span>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-premium transition-all transform hover:-translate-y-0.5"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Common Page Header
export const PageHeader = ({ title, subtitle, emoji }) => {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <div className="flex items-center gap-2">
        {emoji && <span className="text-3xl select-none">{emoji}</span>}
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>}
    </div>
  );
};
