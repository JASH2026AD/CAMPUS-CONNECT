import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react';

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
    setLoading(true); // Keep spinner visible until navigate handles it
    setLoading(false);

    if (result.success) {
      showToast('Logged in successfully! Welcome back.', 'success');
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
      <div className="max-w-md w-full glass-card p-8 flex flex-col gap-6 text-left">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <GraduationCap className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-3xl font-bold text-[#000000] dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-[#374151] dark:text-slate-400">Log in to enter the student exchange network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-[#374151] dark:text-slate-400 uppercase tracking-wider">College Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-600 dark:text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#374151] dark:text-slate-400 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Forgot?
              </Link>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-600 dark:text-slate-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-600 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-primary py-2.5"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-[#374151] dark:text-slate-400">
          New here?{' '}
          <Link
            to="/register"
            className="font-bold text-primary hover:text-primary-dark transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
