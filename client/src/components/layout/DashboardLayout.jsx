import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/index.jsx';
import { notificationAPI } from '../../services/api';
import { t } from '../../utils/translate';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, User, CheckCircle, BookOpen,
  Trophy, LogOut, Menu, X, Moon, Sun, GraduationCap,
  Sparkles, Shield, Bell, Globe, Check, Grid,
  Compass, Laptop, FileText, DollarSign, Award, Heart, FileCheck
} from 'lucide-react';
import ChatbotWidget from '../chatbot/ChatbotWidget.jsx';

const BASE_NAV_ITEMS = [
  { to: '/dashboard',    labelKey: 'dashboard',        icon: LayoutDashboard },
  { to: '/profile',      labelKey: 'myProfile',        icon: User },
  { to: '/applications', labelKey: 'myApplications',  icon: FileCheck },
  { to: '/eligibility',  labelKey: 'checkEligibility', icon: CheckCircle },
  { to: '/schemes',      labelKey: 'browseSchemes',    icon: BookOpen },
  { to: '/results',      labelKey: 'myResults',        icon: Trophy },
  { to: '/ai-hub',       labelKey: 'aiHub',            icon: Sparkles },
];

const SECONDARY_NAV_ITEMS = [
  { to: '/services',          label: 'Student Services',       icon: Heart },
  { to: '/career',            label: 'Career Guidance',        icon: Compass },
  { to: '/loan',              label: 'Education Loans',        icon: DollarSign },
  { to: '/degrees',           label: 'Online Degrees',         icon: Laptop },
  { to: '/articles',          label: 'News & Articles',        icon: FileText },
  { to: '/results-public',    label: 'Public Results',         icon: Award },
  { to: '/support-programme', label: 'Support Programme',      icon: Sparkles },
  { to: '/partner',           label: 'Become A Partner',       icon: Shield },
];

export default function DashboardLayout({ children }) {
  const { user, profile, logout, darkMode, setDarkMode, language, setLanguage } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  // Fetch and poll user alerts/notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000); // poll every 25s
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success(t('markAllRead', language));
      setNotifOpen(false);
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Compile active navigation list
  const navItems = [...BASE_NAV_ITEMS];
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', labelKey: 'adminDashboard', icon: Shield });
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300';
      case 'warning': return 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300';
      case 'error': return 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300';
      default: return 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300';
    }
  };

  const exploreItems = [
    { name: 'Browse Schemes', desc: 'Find active scholarship listings', path: '/schemes', icon: '🎓' },
    { name: 'Eligibility Check', desc: 'Verify eligibility metrics', path: '/eligibility', icon: '🎯' },
    { name: 'Document Vault', desc: 'Securely store documents', path: '/vault', icon: '📁' },
    { name: 'AI Hub Simulator', desc: 'Test AI OCR scanning', path: '/ai-hub', icon: '✨' },
    { name: 'Support Program', desc: 'Scholarship guidance 2026-27', path: '/support-programme', icon: '🎗️' },
    { name: 'Student Services', desc: 'Mentoring & counselling', path: '/services', icon: '🤝' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 z-50
        bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-r border-gray-100 dark:border-slate-700
        flex flex-col transition-transform duration-300 overflow-y-auto
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-slate-100 leading-none">USS Intelligence</div>
              <div className="text-[10px] text-primary-500 dark:text-primary-400 font-bold mt-1 tracking-wider uppercase">Portal AI</div>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Dynamic User Profile Card in Sidebar Header */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-primary-500/10 via-violet-500/5 to-transparent border border-primary-500/20">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} size="md" src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-gray-900 dark:text-slate-100 truncate">{user?.name}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {profile?.isComplete ? '100% Verified' : '86% Profile Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Nav Links */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            {t('mainMenu', language)}
          </div>
          <div className="space-y-1">
            {navItems.map(({ to, labelKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-l-primary-500 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-xs font-semibold">{t(labelKey, language)}</span>
              </NavLink>
            ))}
          </div>

          {/* Secondary Nav Links (Services & Resources) */}
          <div className="mt-6">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Services & Resources
            </div>
            <div className="space-y-1">
              {SECONDARY_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-l-primary-500 font-bold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-xs font-semibold">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
          <button
            onClick={handleLogout}
            className="btn btn-ghost w-full text-xs py-2 gap-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" /> {t('signOut', language)}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>

            {/* Mobile Brand Logo */}
            <Link to="/" className="lg:hidden flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xs text-gray-900 dark:text-white">UniScholar</span>
            </Link>

            {/* Explore dropdown */}
            <div className="relative shrink-0 hidden md:block">
              <button
                onClick={() => { setExploreOpen(!exploreOpen); setLangOpen(false); setNotifOpen(false); }}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                  exploreOpen
                    ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-950/30 dark:border-primary-900'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Explore
              </button>
              {exploreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExploreOpen(false)} />
                  <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 shadow-2xl rounded-2xl p-4 grid grid-cols-1 gap-2 z-50 animate-slide-up">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Quick Links</div>
                    {exploreItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group"
                      >
                        <div className="text-xl bg-gray-50 dark:bg-slate-900 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Buddy4Study style Top Links - visible on XL screen only */}
            <div className="hidden xl:flex items-center gap-1.5 ml-4">
              {[
                { name: 'Scholarships', path: '/schemes' },
                { name: 'Student Services', path: '/services' },
                { name: 'Education Loans', path: '/loan' },
                { name: 'Online Degrees', path: '/degrees' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-gray-650 dark:text-slate-350 hover:text-primary-600 dark:hover:text-primary-450 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Profile Completeness Alert / Progress */}
            <div className="hidden md:block ml-3">
              {profile?.isComplete ? (
                <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1 rounded-full animate-pulse-slow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  {t('profileComplete', language)}
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 px-3 py-1 rounded-full cursor-pointer hover:underline" onClick={() => navigate('/profile')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping"></span>
                  {t('profileIncomplete', language)}
                </span>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            
            {/* Buddy4Study style yellow highlighted Programme Badge Button */}
            <Link
              to="/support-programme"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider uppercase px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-400/10 transition-all hover:scale-105 active:scale-95 duration-200 border-l-4 border-amber-600 hidden sm:flex"
            >
              <span>SUPPORT PROGRAMME</span>
            </Link>

            {/* Multilingual Translation Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setExploreOpen(false); }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-gray-600 dark:text-slate-350"
                title="Change Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase">{language}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl py-1.5 z-50 animate-slide-up">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'gu', label: 'ગુજરાતી' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center justify-between"
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setExploreOpen(false); }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative text-gray-600 dark:text-slate-350"
                title={t('notifications', language)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl overflow-hidden z-50 animate-slide-up">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('notifications', language)}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {t('markAllRead', language)}
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700 scrollbar-hide">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-slate-500">
                        {t('noNotifications', language)}
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkRead(notif._id)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${notif.read ? 'bg-white hover:bg-gray-50/50 dark:bg-slate-800 dark:hover:bg-slate-700/20' : 'bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getAlertStyle(notif.type)}`}>
                              {notif.type}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-gray-800 dark:text-slate-100 mt-1">{notif.title}</div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-350"
              title="Toggle dark mode"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            <div className="border-l border-gray-150 dark:border-slate-700 h-6 mx-0.5"></div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifOpen(false); setLangOpen(false); setExploreOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Avatar name={user?.name || 'U'} size="sm" src={user?.avatar} />
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl p-2 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700/80 mb-1">
                      <div className="text-xs font-black text-gray-900 dark:text-slate-100 truncate">{user?.name}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{user?.email}</div>
                    </div>

                    <button
                      onClick={() => { navigate('/profile'); setProfileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-primary-500" />
                      <span>{t('myProfile', language)}</span>
                    </button>

                    <button
                      onClick={() => { navigate('/applications'); setProfileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>{t('myApplications', language)}</span>
                    </button>

                    <button
                      onClick={() => { navigate('/profile'); setProfileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span>Account Settings</span>
                    </button>

                    <div className="border-t border-gray-100 dark:border-slate-700/80 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('signOut', language)}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in overflow-y-auto">
          {children}
        </main>
        <ChatbotWidget />
      </div>
    </div>
  );
}
