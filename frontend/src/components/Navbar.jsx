import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, MessageSquare, LogOut, User, Shield, Menu, X } from 'lucide-react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout, theme, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch unread notifications
      api.get('/notifications')
        .then(res => {
          const unread = res.data.filter(n => !n.isRead).length;
          setUnreadNotifs(unread);
        })
        .catch(err => console.error('Error fetching navbar notifications:', err));
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200/40 dark:border-slate-800/40 glass-panel backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                CampusConnect
              </span>
              <span className="text-xl">🎓</span>
            </Link>
            
            {/* Desktop Menu */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                <Link
                  to="/marketplace"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/marketplace') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  Marketplace 🛒
                </Link>
                <Link
                  to="/skills"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/skills') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  Skill Exchange 🤝
                </Link>
                <Link
                  to="/lost-found"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/lost-found') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  Lost & Found 🔍
                </Link>
                <Link
                  to="/ai-analyzer"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/ai-analyzer') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  AI Review Analyzer 🤖
                </Link>
              </div>
            )}
          </div>

          {/* Right menu (User dashboard icons) */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/chat"
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={user.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full bg-orange-100 object-cover"
                    />
                    <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {user.profile?.name || 'User'}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200/50 dark:border-slate-800 glass-panel shadow-premium p-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Shield className="w-4 h-4 text-orange-500" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-gray-200/50 dark:border-slate-800 my-1.5" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-dark shadow-premium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up ✨
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/30 dark:border-slate-800/30 glass-panel p-4 flex flex-col gap-2">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/40 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>Marketplace 🛒</span>
          </Link>
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/40 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>Skill Exchange 🤝</span>
          </Link>
          <Link
            to="/lost-found"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/40 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>Lost & Found 🔍</span>
          </Link>
          <Link
            to="/ai-analyzer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/40 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>AI Review Analyzer 🤖</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
