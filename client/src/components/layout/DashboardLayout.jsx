import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/index.jsx';
import { notificationAPI } from '../../services/api';
import { t } from '../../utils/translate';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, User, CheckCircle, BookOpen,
  Trophy, LogOut, Menu, X, Moon, Sun, GraduationCap,
  Sparkles, Shield, Bell, Globe, Check
} from 'lucide-react';
import ChatbotWidget from '../chatbot/ChatbotWidget.jsx';


const BASE_NAV_ITEMS = [
  { to: '/dashboard',   labelKey: 'dashboard',        icon: LayoutDashboard },
  { to: '/profile',     labelKey: 'myProfile',        icon: User },
  { to: '/eligibility', labelKey: 'checkEligibility', icon: CheckCircle },
  { to: '/schemes',     labelKey: 'browseSchemes',    icon: BookOpen },
  { to: '/results',     labelKey: 'myResults',        icon: Trophy },
  { to: '/ai-hub',      labelKey: 'aiHub',            icon: Sparkles },
];

export default function DashboardLayout({ children }) {
  const { user, profile, logout, darkMode, setDarkMode, language, setLanguage } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-r border-gray-100 dark:border-slate-700
        flex flex-col transition-transform duration-300 overflow-y-auto
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-slate-100 leading-none">USS Intelligence</div>
              <div className="text-[10px] text-primary-500 dark:text-primary-400 font-bold mt-1 tracking-wider uppercase">Portal AI</div>
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4">
          <div className="px-5 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            {t('mainMenu', language)}
          </div>
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active bg-primary-50/70 dark:bg-primary-900/20 border-l-4 border-l-primary-500 rounded-l-none' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm font-semibold">{t(labelKey, language)}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 mb-3 px-1">
            <Avatar name={user?.name || 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{user?.name}</div>
              <div className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
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
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 px-4 lg:px-6 h-16 flex items-center gap-3 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>

          {/* User Profile Progress State Banner */}
          <div className="flex-1">
            {profile?.isComplete ? (
              <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1 rounded-full animate-pulse-slow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                {t('profileComplete', language)}
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 px-3 py-1 rounded-full cursor-pointer hover:underline" onClick={() => navigate('/profile')}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping"></span>
                {t('profileIncomplete', language)}
              </span>
            )}
          </div>

          {/* ── Multilingual Translation Dropdown ───────────────── */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-gray-600 dark:text-slate-300"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{language}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl py-1.5 animate-slide-up">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'gu', label: 'ગુજરાતી' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center justify-between"
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── In-App Alerts Notification Center Dropdown ───────── */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative text-gray-600 dark:text-slate-300"
              title={t('notifications', language)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{t('notifications', language)}</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
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
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getAlertStyle(notif.type)}`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 dark:text-slate-100 mt-1">{notif.title}</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-slate-300"
            title="Toggle dark mode"
          >
            {darkMode
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          <div className="border-l border-gray-100 dark:border-slate-700 h-6 mx-1"></div>
          <Avatar name={user?.name || 'U'} size="sm" />
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

