import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200';
      case 'error':
        return 'border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200';
      case 'info':
      default:
        return 'border-blue-500/20 bg-blue-500/10 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200';
    }
  };

  const getToastEmoji = (type) => {
    switch (type) {
      case 'success': return '✨';
      case 'error': return '💥';
      case 'warning': return '⚠️';
      case 'info':
      default: return '📢';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl border glass-panel shadow-md pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 ${getToastStyles(toast.type)}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
