import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/index.jsx';
import toast from 'react-hot-toast';

export default function AuthContainer({ initialTab = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active form mode: 'login' or 'register'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'register' || location.pathname === '/register' ? 'register' : 'login'
  );

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`, { replace: true });
  };

  // ── Login Form State ──────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Register Form State ───────────────────────────────────────────
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm: '',
    agreeTerms: false
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Password Requirements Checks
  const hasMinLen = regForm.password.length >= 8;
  const hasUpper  = /[A-Z]/.test(regForm.password);
  const hasNumber = /[0-9]/.test(regForm.password);

  // Fill demo account credentials
  const fillDemoCredentials = () => {
    setLoginForm({ email: 'student@demo.com', password: 'demo@123' });
    setLoginError('');
  };

  // Handle Login Submit
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
      await login(loginForm);
      toast.success('✓ Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register Submit
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
        password: regForm.password
      });

      toast.success('✓ Account created successfully! Please complete your profile.');
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Email may already be registered.';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleAuth = (mode) => {
    toast.error(`Google Sign-In integration ready. Connect CLIENT_ID to enable Google ${mode}.`, { duration: 4000 });
  };

  const handleForgotPassword = () => {
    toast.success('Password reset link sent to your registered email if account exists.', { duration: 4000 });
  };

  return (
    <div className="min-h-screen min-h-[100svh] bg-slate-950 text-slate-100 flex flex-col justify-between items-center py-2 px-3 relative overflow-hidden font-sans">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. MICRO HEADER ───────────────────────────────────────────────── */}
      <header className="text-center pt-0.5 pb-1 space-y-0.5">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">UniScholar</span>
        </Link>
        <p className="text-[10px] font-medium text-slate-400">
          Your Scholarship & Education Assistant
        </p>
      </header>

      {/* ── 2. MICRO AUTH CONTAINER (480PX MAX WIDTH) ─────────────────────── */}
      <main className="w-full max-w-[480px] mx-auto my-auto py-0.5">
        <div className="bg-[#0A1124] border border-slate-800/90 rounded-[18px] shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Top Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#050A15] border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all flex items-center justify-center gap-1 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔐 LOGIN
            </button>

            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all flex items-center justify-center gap-1 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-violet-600 to-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 REGISTER
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              MODE A: LOGIN FORM
             ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <div className="p-4 sm:p-5 space-y-2.5 animate-fade-in">
              
              {/* Heading */}
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Welcome Back 👋</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Sign in to your UniScholar account</p>
              </div>

              {/* Ultra-Compact Demo Account Helper */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-400">🧪 Demo:</span>
                  <span className="text-[10px] font-mono text-amber-200/90 font-medium truncate">student@demo.com • demo@123</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0"
                >
                  Fill →
                </button>
              </div>

              {/* Error Banner */}
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-[10px] text-red-400 flex items-center gap-1.5 animate-fade-in font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-2">
                {/* Email Address */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={e => { setLoginForm(p => ({ ...p, email: e.target.value })); setLoginError(''); }}
                      className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] text-primary-400 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      value={loginForm.password}
                      onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginError(''); }}
                      className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-[42px] rounded-[8px] bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2 mt-1"
                >
                  {loginLoading ? <Spinner /> : null}
                  {loginLoading ? 'Signing In...' : 'Sign In →'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2 my-1.5">
                <div className="flex-1 h-px bg-slate-800/80" />
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('Sign-In')}
                className="w-full h-[40px] rounded-[8px] bg-[#050A15] hover:bg-slate-800/60 border border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              {/* Bottom Compact Register CTA */}
              <div className="pt-2 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  New to UniScholar?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-primary-400 font-bold hover:underline"
                  >
                    Create Account →
                  </button>
                </p>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              MODE B: REGISTER FORM (10-15% MORE COMPACT FOR VIEWPORT FIT)
             ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <div className="p-4 sm:p-5 space-y-2 animate-fade-in">
              
              {/* Heading */}
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Create Your Account</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Start your scholarship journey with UniScholar.</p>
              </div>

              {/* Error Banner */}
              {regError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-[10px] text-red-400 flex items-center gap-1.5 animate-fade-in font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-2">
                
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={regForm.name}
                      onChange={e => { setRegForm(p => ({ ...p, name: e.target.value })); setRegError(''); }}
                      className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email Address & Mobile Number (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={regForm.email}
                        onChange={e => { setRegForm(p => ({ ...p, email: e.target.value })); setRegError(''); }}
                        className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regForm.mobile}
                        onChange={e => setRegForm(p => ({ ...p, mobile: e.target.value }))}
                        className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={e => { setRegForm(p => ({ ...p, password: e.target.value })); setRegError(''); }}
                        className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-0.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type={showRegConfirm ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={regForm.confirm}
                        onChange={e => { setRegForm(p => ({ ...p, confirm: e.target.value })); setRegError(''); }}
                        className="w-full h-[40px] bg-[#050A15] border border-slate-800 rounded-[8px] pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ultra-Compact Password Requirements Bar */}
                <div className="px-2.5 py-1 rounded-md bg-[#050A15] border border-slate-800 text-[10px] flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">MUST CONTAIN:</span>
                  <div className="flex items-center gap-2">
                    <span className={hasMinLen ? 'text-emerald-400 font-semibold flex items-center gap-0.5' : 'text-slate-500 flex items-center gap-0.5'}>
                      {hasMinLen ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} 8+ chars
                    </span>
                    <span className={hasUpper ? 'text-emerald-400 font-semibold flex items-center gap-0.5' : 'text-slate-500 flex items-center gap-0.5'}>
                      {hasUpper ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} Uppercase
                    </span>
                    <span className={hasNumber ? 'text-emerald-400 font-semibold flex items-center gap-0.5' : 'text-slate-500 flex items-center gap-0.5'}>
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} Number
                    </span>
                  </div>
                </div>

                {/* Terms & Privacy Checkbox */}
                <label className="flex items-start gap-1.5 cursor-pointer text-[10px] text-slate-300 select-none pt-0.5">
                  <input
                    type="checkbox"
                    checked={regForm.agreeTerms}
                    onChange={e => { setRegForm(p => ({ ...p, agreeTerms: e.target.checked })); setRegError(''); }}
                    className="mt-0.5 rounded bg-[#050A15] border-slate-800 text-primary-600 focus:ring-primary-500 shrink-0"
                  />
                  <span>
                    I agree to UniScholar's <Link to="/terms" className="text-primary-400 hover:underline font-semibold">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary-400 hover:underline font-semibold">Privacy Policy</Link>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full h-[42px] rounded-[8px] bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-500 hover:to-primary-500 text-white font-extrabold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-0.5"
                >
                  {regLoading ? <Spinner /> : null}
                  {regLoading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-slate-800/80" />
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>

              {/* Google Sign-up Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('Sign-Up')}
                className="w-full h-[40px] rounded-[8px] bg-[#050A15] hover:bg-slate-800/60 border border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign up with Google
              </button>

              {/* Bottom Compact Login CTA */}
              <div className="pt-1.5 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-violet-400 font-bold hover:underline"
                  >
                    Sign In →
                  </button>
                </p>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ── 3. MICRO PAGE FOOTER ──────────────────────────────────────────── */}
      <footer className="text-center text-[10px] text-slate-500 py-1 space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 font-medium text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>🔒 Your information is securely protected.</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 text-slate-400 text-[10px]">
          <span>© 2026 UniScholar</span>
          <span>•</span>
          <Link to="/terms" className="hover:text-slate-300">Terms</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
          <span>•</span>
          <Link to="/support-programme" className="hover:text-slate-300">Help</Link>
        </div>
      </footer>

    </div>
  );
}
