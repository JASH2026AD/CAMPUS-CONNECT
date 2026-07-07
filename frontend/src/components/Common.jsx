import React from 'react';
import { RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Premium Pulsing Loading Skeleton
export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderItem = (key) => {
    if (type === 'card') {
      return (
        <div key={key} className="glass-card rounded-2xl p-6 w-full flex flex-col gap-4 animate-pulse">
          <div className="w-full h-48 bg-gray-100 dark:bg-slate-800/80 rounded-xl" />
          <div className="h-6 w-3/4 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
          <div className="h-4 w-1/2 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
          <div className="flex gap-2 mt-2">
            <div className="h-9 w-1/4 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-9 w-1/4 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
          </div>
        </div>
      );
    }
    
    if (type === 'list') {
      return (
        <div key={key} className="p-4 flex gap-4 items-center animate-pulse border-b border-gray-100 dark:border-slate-800/60">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800/80" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-5 w-1/3 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-slate-800/80 rounded-lg" />
          </div>
        </div>
      );
    }

    if (type === 'chat') {
      return (
        <div key={key} className="flex flex-col gap-4 animate-pulse p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800/80" />
            <div className="h-10 w-2/5 bg-gray-100 dark:bg-slate-800/80 rounded-xl" />
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="h-10 w-1/3 bg-orange-100 dark:bg-orange-950/20 rounded-xl" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800/80" />
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
  icon: Icon,
  emoji = '📪',
  title = 'No items found',
  description = 'There are no active entries listed at the moment.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl my-6">
      {Icon ? (
        <Icon className="w-12 h-12 text-slate-600 dark:text-slate-600 mb-4" />
      ) : (
        <span className="text-5xl mb-4 select-none">{emoji}</span>
      )}
      <h3 className="text-xl font-bold text-[#000000] dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-[#374151] dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Common Page Header
export const PageHeader = ({ title, subtitle, icon: Icon, emoji }) => {
  return (
    <div className="flex flex-col gap-1.5 mb-8">
      <div className="flex items-center gap-3">
        {Icon ? (
          <Icon className="w-8 h-8 text-primary" />
        ) : (
          emoji && <span className="text-3xl select-none">{emoji}</span>
        )}
        <h1 className="text-3xl sm:text-[36px] font-bold tracking-tight text-[#000000] dark:text-slate-50">
          {title}
        </h1>
      </div>
      {subtitle && <p className="text-base text-[#374151] dark:text-slate-400 leading-relaxed font-normal">{subtitle}</p>}
    </div>
  );
};
