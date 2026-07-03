import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Logged in successfully! Welcome back. ✨', 'success');
      navigate('/dashboard');
    } else {
      // Check if user is not verified
      if (result.error.includes('verified')) {
        showToast('Please verify your college email first.', 'warning');
        navigate('/register', { state: { verifyEmail: email } });
      } else {
        showToast(result.error, 'error');
      }
    }
  };

  return (
    <div className="bg-mesh min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card border rounded-3xl p-8 shadow-premium flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <span className="text-4xl">🎓</span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Log in to enter the student exchange network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">College Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Forgot?
              </Link>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-premium transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          New here?{' '}
          <Link
            to="/register"
            className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
          >
            Create an account ✨
          </Link>
        </div>
      </div>
    </div>
  );
}
