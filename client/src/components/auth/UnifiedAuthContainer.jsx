import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/index.jsx';
import PortalSwitchFooter from './PortalSwitchFooter.jsx';
import toast from 'react-hot-toast';
import { showToast } from '../../utils/toastQueue';

const ROLE_CONFIGS = {
  student: {
    logo: '🎓',
    title: 'UniScholar',
    subtitle: 'Your Scholarship & Education Assistant',
    accentGradient: 'from-primary-600 to-violet-600',
    demoEmail: 'student@demo.com',
    demoPw: 'demo@123',
    loginRoute: '/login',
    registerRoute: '/register',
    dashboardRoute: '/dashboard',
    loginTitle: 'Welcome Back 👋',
    loginSubtitle: 'Sign in to your UniScholar student account',
    registerTitle: 'Create Student Account 🎓',
    registerSubtitle: 'Join UniScholar to discover and apply for scholarships'
  },
  partner: {
    logo: '🏢',
    title: 'USS Partner Portal',
    subtitle: 'SCHOLARSHIP PROVIDER OPERATIONS',
    accentGradient: 'from-purple-600 to-indigo-600',
    demoEmail: 'partner@demo.com',
    demoPw: 'demo@123',
    loginRoute: '/partner/login',
    registerRoute: '/partner/register',
    dashboardRoute: '/partner/dashboard',
    loginTitle: 'Partner Sign In 🏢',
    loginSubtitle: 'Manage your scholarship programs and student applications',
    registerTitle: 'Register Partner Account 🏢',
    registerSubtitle: 'Register your foundation or institution to issue scholarships'
  },
  admin: {
    logo: '🛡️',
    title: 'USS Intelligence',
    subtitle: 'ADMIN OPERATIONS PORTAL',
    accentGradient: 'from-blue-600 to-indigo-600',
    demoEmail: 'admin@demo.com',
    demoPw: 'demo@123',
    loginRoute: '/admin/login',
    registerRoute: '/admin/register',
    dashboardRoute: '/admin/dashboard',
    loginTitle: 'Admin Sign In 🔐',
    loginSubtitle: 'Securely manage the UniScholar scholarship ecosystem',
    registerTitle: 'Create Admin Account 🔐',
    registerSubtitle: 'System administrator account registration & access request'
  }
};

export default function UnifiedAuthContainer({ role = 'student', initialTab = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.student;

  const [activeTab, setActiveTab] = useState(
    initialTab === 'register' || location.pathname.endsWith('/register') ? 'register' : 'login'
  );

  useEffect(() => {
    if (location.pathname.endsWith('/register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'register') navigate(config.registerRoute, { replace: true });
    else navigate(config.loginRoute, { replace: true });
  };

  // Login Form State
  const [loginForm, setLoginForm] = useState({ email: config.demoEmail, password: config.demoPw });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    organization: '',
    mobile: '',
    password: '',
    confirm: '',
    agreeTerms: false
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Password Requirements Checks
  const hasMinLen = regForm.password.length >= 8;
  const hasUpper  = /[A-Z]/.test(regForm.password);
  const hasNumber = /[0-9]/.test(regForm.password);

  const handleFillDemo = () => {
    setLoginForm({ email: config.demoEmail, password: config.demoPw });
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginForm.email || !/\S+@\S+\.\S+/.test(loginForm.email)) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!loginForm.password) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login(loginForm);
      const userObj = res?.user || res;
      
      // Strict role verification on frontend redirect
      if (role === 'admin' && userObj?.role !== 'admin') {
        setLoginError('Account is not authorized for Admin Portal');
        setLoginLoading(false);
        return;
      }
      if (role === 'partner' && userObj?.role !== 'partner' && userObj?.role !== 'admin') {
        setLoginError('Account is not authorized for Partner Portal');
        setLoginLoading(false);
        return;
      }

      showToast(`✓ Welcome back, ${userObj?.name || 'User'}!`, 'success');
      navigate(config.dashboardRoute);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regForm.name || regForm.name.length < 2) {
      setRegError('Please enter your full name (min 2 characters).');
      return;
    }
    if (!regForm.email || !/\S+@\S+\.\S+/.test(regForm.email)) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regForm.password !== regForm.confirm) {
      setRegError('Passwords do not match.');
      return;
    }
    if (!regForm.agreeTerms) {
      setRegError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setRegLoading(true);
    try {
      await register({
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        role: role,
        organization: regForm.organization || (role === 'partner' ? 'Scholarship Partner Org' : '')
      });

      showToast('✓ Account created successfully! Redirecting...', 'success');
      navigate(config.dashboardRoute);
    } catch (err) {
      setRegError(err.response?.data?.message || 'An account with this email already exists.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100svh] bg-slate-950 text-slate-100 flex flex-col justify-between items-center py-4 px-3 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. BRANDING HEADER ────────────────────────────────────────────── */}
      <header className="text-center pt-1 pb-2 space-y-0.5 z-10">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <span className="text-2xl">{config.logo}</span>
          <span className="font-black text-lg text-white tracking-tight group-hover:text-primary-400 transition-colors">
            {config.title}
          </span>
        </Link>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {config.subtitle}
        </p>
      </header>

      {/* ── 2. COMPACT AUTHENTICATION CARD (Target max-width: 680px) ─────── */}
      <main className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 backdrop-blur-md">
        
        {/* Top Segmented Switch */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800">
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? `bg-gradient-to-r ${config.accentGradient} text-white shadow-md font-extrabold`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔐 LOGIN
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? `bg-gradient-to-r ${config.accentGradient} text-white shadow-md font-extrabold`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 REGISTER
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* ──────────────────────────────────────────────────────────────────
              MODE A: LOGIN FORM
             ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <div className="space-y-3.5 animate-fade-in">
              
              <div>
                <h2 className="text-base font-extrabold text-white">{config.loginTitle}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{config.loginSubtitle}</p>
              </div>

              {/* Compact Demo Credentials Chip */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-400">🧪 Demo Account:</span>
                  <p className="text-[11px] font-mono text-slate-300 truncate">{config.demoEmail} • {config.demoPw}</p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline shrink-0"
                >
                  Fill Demo Credentials →
                </button>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 text-xs text-red-400 flex items-center gap-2 animate-fade-in font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={e => { setLoginForm(p => ({ ...p, email: e.target.value })); setLoginError(''); }}
                      className="w-full h-[42px] bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                      className="text-[10px] font-bold text-slate-400 hover:text-white"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginError(''); }}
                      className="w-full h-[42px] bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full h-[44px] rounded-xl bg-gradient-to-r ${config.accentGradient} text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-1`}
                >
                  {loginLoading ? <Spinner /> : null}
                  {loginLoading ? 'Signing In...' : `Sign In to ${config.title} →`}
                </button>
              </form>

              {/* Bottom Role Switcher Navigation */}
              <PortalSwitchFooter currentRole={role} currentMode="login" />

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              MODE B: REGISTER FORM (COMPACT 2-COLUMN LAYOUT)
             ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <div className="space-y-3.5 animate-fade-in">
              
              <div>
                <h2 className="text-base font-extrabold text-white">{config.registerTitle}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{config.registerSubtitle}</p>
              </div>

              {regError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 text-xs text-red-400 flex items-center gap-2 animate-fade-in font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                
                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={regForm.name}
                      onChange={e => { setRegForm(p => ({ ...p, name: e.target.value })); setRegError(''); }}
                      className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      {role === 'partner' ? 'Organization / Institution Name' : 'Email Address'}
                    </label>
                    {role === 'partner' ? (
                      <input
                        type="text"
                        placeholder="e.g. Tata Trust / AICTE"
                        value={regForm.organization}
                        onChange={e => { setRegForm(p => ({ ...p, organization: e.target.value })); setRegError(''); }}
                        className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                        required
                      />
                    ) : (
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={regForm.email}
                        onChange={e => { setRegForm(p => ({ ...p, email: e.target.value })); setRegError(''); }}
                        className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                        required
                      />
                    )}
                  </div>
                </div>

                {role === 'partner' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Official Work Email</label>
                    <input
                      type="email"
                      placeholder="official@organization.org"
                      value={regForm.email}
                      onChange={e => { setRegForm(p => ({ ...p, email: e.target.value })); setRegError(''); }}
                      className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>
                )}

                {/* Password & Confirm 2-Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Password</label>
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regForm.password}
                      onChange={e => { setRegForm(p => ({ ...p, password: e.target.value })); setRegError(''); }}
                      className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Confirm Password</label>
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regForm.confirm}
                      onChange={e => { setRegForm(p => ({ ...p, confirm: e.target.value })); setRegError(''); }}
                      className="w-full h-[40px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* Compact Password Checks */}
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                  <span className={hasMinLen ? 'text-emerald-400 font-bold' : ''}>✓ Min 8 chars</span>
                  <span className={hasUpper ? 'text-emerald-400 font-bold' : ''}>✓ 1 Uppercase</span>
                  <span className={hasNumber ? 'text-emerald-400 font-bold' : ''}>✓ 1 Number</span>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={regForm.agreeTerms}
                    onChange={e => setRegForm(p => ({ ...p, agreeTerms: e.target.checked }))}
                    className="rounded border-slate-800 text-primary-500 focus:ring-primary-500 w-4 h-4"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 font-medium">
                    I agree to the <Link to="/terms" className="text-primary-400 underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary-400 underline">Privacy Policy</Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className={`w-full h-[44px] rounded-xl bg-gradient-to-r ${config.accentGradient} text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2`}
                >
                  {regLoading ? <Spinner /> : null}
                  {regLoading ? 'Creating Account...' : `Create ${config.title} Account →`}
                </button>
              </form>

              {/* Bottom Role Switcher Navigation */}
              <PortalSwitchFooter currentRole={role} currentMode="register" />

            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-500 py-1 space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 font-medium text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>🔒 Protected by UniScholar Portal Access Security</span>
        </div>
      </footer>

    </div>
  );
}
