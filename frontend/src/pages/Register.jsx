import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Calendar, BookOpen, Key, CheckCircle } from 'lucide-react';

export default function Register() {
  const { register, verifyEmail } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationTarget, setVerificationTarget] = useState('');
  const [mockCode, setMockCode] = useState(''); // Displayed in UI for easy local testing!
  const [loading, setLoading] = useState(false);

  // If redirecting from login due to unverified email
  useEffect(() => {
    if (location.state?.verifyEmail) {
      setEmail(location.state.verifyEmail);
      setVerificationTarget(location.state.verifyEmail);
      setIsVerifying(true);
      showToast('Please verify your email code below.', 'info');
    }
  }, [location.state]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!email.endsWith('.edu') && !email.endsWith('college.edu')) {
      showToast('Only college emails ending in .edu are allowed.', 'error');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name, major, graduationYear);
    setLoading(false);

    if (result.success) {
      showToast('Account initialized! Please verify your email.', 'success');
      setVerificationTarget(email);
      setMockCode(result.data.verificationCode); // Cache mock code for local testing display
      setIsVerifying(true);
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode) {
      showToast('Please enter the verification code.', 'warning');
      return;
    }

    setLoading(true);
    const result = await verifyEmail(verificationTarget, verifyCode);
    setLoading(false);

    if (result.success) {
      showToast('Email verified successfully! You can now log in.', 'success');
      navigate('/login');
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="bg-mesh min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card border rounded-3xl p-8 shadow-premium flex flex-col gap-6">
        
        {!isVerifying ? (
          <>
            {/* Register Header */}
            <div className="text-center flex flex-col gap-2">
              <span className="text-4xl">🎓</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Create Account</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join the exclusive verified student community</p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Alice Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">College Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="alice@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Major</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. CS"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grad Year</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      placeholder="2027"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                    />
                  </div>
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
                  'Create Account ✨'
                )}
              </button>
            </form>

            {/* Switch to login */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Verification Header */}
            <div className="text-center flex flex-col gap-2">
              <span className="text-4xl">🔑</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Verify Email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We logged a 6-digit verification code to the console for <span className="font-semibold text-slate-800 dark:text-white">{verificationTarget}</span>.
              </p>
            </div>

            {/* For easy testing, print it inside a beautiful micro-card */}
            {mockCode && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center flex flex-col gap-1">
                <span className="text-xs text-primary font-bold uppercase tracking-wider">Local Testing Environment</span>
                <span className="text-lg font-mono font-bold text-slate-800 dark:text-white select-all">{mockCode}</span>
                <span className="text-[10px] text-gray-400">Copy this code to quickly verify email!</span>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">6-Digit Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Key className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-mono tracking-widest text-center"
                    required
                  />
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
                    <CheckCircle className="w-5 h-5" /> Verify & Activate
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => setIsVerifying(false)}
              className="text-sm font-bold text-primary hover:underline hover:text-primary-dark text-center transition-colors"
            >
              ← Go back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
