import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sun, Moon, Bell, MessageSquare, LogOut, User, Shield, Menu, X, 
  GraduationCap, ShoppingBag, Users, Search, Brain 
} from 'lucide-react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout, theme, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`sticky top-0 z-40 w-full border-b border-gray-200/40 dark:border-slate-800/40 glass-panel backdrop-blur-md transition-all duration-200 ${scrolled ? 'shadow-sm border-gray-200/80 dark:border-slate-800' : 'shadow-none'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo and Nav Links */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-[#000000] dark:text-white tracking-tight">
                CampusConnect
              </span>
            </Link>
            
            {/* Desktop Menu */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-1.5">
                <Link
                  to="/marketplace"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive('/marketplace') 
                      ? 'text-primary bg-slate-100 dark:bg-slate-800' 
                      : 'text-[#374151] dark:text-slate-300 hover:text-[#000000] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5 text-[#374151] dark:text-slate-300" />
                  Marketplace
                </Link>
                <Link
                  to="/skills"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive('/skills') 
                      ? 'text-primary bg-slate-100 dark:bg-slate-800' 
                      : 'text-[#374151] dark:text-slate-300 hover:text-[#000000] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1.5 text-[#374151] dark:text-slate-300" />
                  Skill Exchange
                </Link>
                <Link
                  to="/lost-found"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive('/lost-found') 
                      ? 'text-primary bg-slate-100 dark:bg-slate-800' 
                      : 'text-[#374151] dark:text-slate-300 hover:text-[#000000] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Search className="w-4 h-4 mr-1.5 text-[#374151] dark:text-slate-300" />
                  Lost & Found
                </Link>
                <Link
                  to="/ai-analyzer"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive('/ai-analyzer') 
                      ? 'text-primary bg-slate-100 dark:bg-slate-800' 
                      : 'text-[#374151] dark:text-slate-300 hover:text-[#000000] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Brain className="w-4 h-4 mr-1.5 text-[#374151] dark:text-slate-300" />
                  AI Review Analyzer
                </Link>
              </div>
            )}
          </div>

          {/* Right menu (User dashboard icons) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-black hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/chat"
                  className="relative p-1.5 rounded-lg text-black hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </Link>

                <Link
                  to="/notifications"
                  className="relative p-1.5 rounded-lg text-black hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={user.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Profile"
                      className="w-7 h-7 rounded-full bg-orange-100 object-cover border border-gray-200 dark:border-slate-750"
                    />
                    <span className="hidden sm:inline text-xs font-semibold text-black dark:text-slate-300">
                      {user.profile?.name || 'User'}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-[#374151] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#000000] dark:hover:text-white transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        My Profile
                      </Link>
                      
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-[#374151] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-orange-500" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-gray-200/60 dark:border-slate-800 my-1.5" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-rose-650 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg text-black hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-black dark:text-slate-200 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark transition-all transform hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 shadow-sm">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm font-semibold hover:text-primary transition-colors text-black dark:text-slate-200"
          >
            <ShoppingBag className="w-4 h-4 text-[#374151] dark:text-slate-300" />
            <span>Marketplace</span>
          </Link>
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm font-semibold hover:text-primary transition-colors text-black dark:text-slate-200"
          >
            <Users className="w-4 h-4 text-[#374151] dark:text-slate-300" />
            <span>Skill Exchange</span>
          </Link>
          <Link
            to="/lost-found"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm font-semibold hover:text-primary transition-colors text-black dark:text-slate-200"
          >
            <Search className="w-4 h-4 text-[#374151] dark:text-slate-300" />
            <span>Lost & Found</span>
          </Link>
          <Link
            to="/ai-analyzer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-sm font-semibold hover:text-primary transition-colors text-black dark:text-slate-200"
          >
            <Brain className="w-4 h-4 text-[#374151] dark:text-slate-300" />
            <span>AI Review Analyzer</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
