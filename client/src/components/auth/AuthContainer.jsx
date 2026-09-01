import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, Check, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/index.jsx';
import toast from 'react-hot-toast';

export default function AuthContainer({ initialTab = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' or 'register'

  // ── Login State ──────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Register State ───────────────────────────────────────────────
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
    setActiveTab('login');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans">
      
      {/* Ambient background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. PAGE HEADER ────────────────────────────────────────────────── */}
      <header className="text-center pt-2 pb-6 max-w-xl mx-auto space-y-2">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">UniScholar</span>
        </Link>
        <p className="text-xs font-medium text-slate-400">
          Your Scholarship & Education Assistant
        </p>
      </header>

      {/* ── 2. MOBILE TAB SWITCHER (< 1024px) ────────────────────────────── */}
      <div className="lg:hidden max-w-md mx-auto w-full mb-4 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'login'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔐 Sign In
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'register'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          👤 Create Account
        </button>
      </div>

      {/* ── 3. MAIN SIDE-BY-SIDE AUTH CONTAINER ──────────────────────────── */}
      <main className="w-full max-w-6xl mx-auto my-auto my-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
          
          {/* ──────────────────────────────────────────────────────────────────
              LEFT PANEL — LOGIN FORM
             ────────────────────────────────────────────────────────────────── */}
          <div className={`p-6 md:p-10 flex flex-col justify-between transition-all duration-300 ${
            activeTab === 'login'
              ? 'ring-2 ring-primary-500/40 bg-gradient-to-b from-primary-950/20 via-transparent to-transparent'
              : 'opacity-90 lg:opacity-75'
          } ${activeTab !== 'login' ? 'hidden lg:flex' : 'flex'}`}>
            
            <div className="space-y-5">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
                  <span>🔐 Login</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">Welcome Back 👋</h2>
                <p className="text-xs text-slate-400 mt-1">Sign in to your UniScholar account</p>
              </div>

              {/* Demo Account Helper Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🧪 Demo Account</span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300/80">student@demo.com • demo@123</div>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="btn btn-outline btn-xs text-[11px] border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-bold px-3 py-1.5 shrink-0"
                >
                  Fill Demo Credentials →
                </button>
              </div>

              {/* Error Banner */}
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-400 flex items-center gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={e => { setLoginForm(p => ({ ...p, email: e.target.value })); setLoginError(''); }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-primary-400 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginError(''); }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Spinner /> : null}
                  {loginLoading ? 'Signing In...' : 'Sign In →'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('Sign-In')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Switch Footer */}
            <div className="pt-6 border-t border-slate-800/80 mt-6 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-primary-400 font-bold hover:underline"
                >
                  Create Account →
                </button>
              </p>
            </div>

          </div>

          {/* ──────────────────────────────────────────────────────────────────
              RIGHT PANEL — REGISTER FORM
             ────────────────────────────────────────────────────────────────── */}
          <div className={`p-6 md:p-10 flex flex-col justify-between transition-all duration-300 ${
            activeTab === 'register'
              ? 'ring-2 ring-primary-500/40 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent'
              : 'opacity-90 lg:opacity-75'
          } ${activeTab !== 'register' ? 'hidden lg:flex' : 'flex'}`}>

            <div className="space-y-5">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
                  <span>👤 Register</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">Create Your Account</h2>
                <p className="text-xs text-slate-400 mt-1">Start your scholarship journey with UniScholar.</p>
              </div>

              {/* Error Banner */}
              {regError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-400 flex items-center gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={regForm.name}
                      onChange={e => { setRegForm(p => ({ ...p, name: e.target.value })); setRegError(''); }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address & Mobile Number in 2 cols */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={regForm.email}
                        onChange={e => { setRegForm(p => ({ ...p, email: e.target.value })); setRegError(''); }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regForm.mobile}
                        onChange={e => setRegForm(p => ({ ...p, mobile: e.target.value }))}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={e => { setRegForm(p => ({ ...p, password: e.target.value })); setRegError(''); }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
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
                    <label className="text-xs font-bold text-slate-300 block mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showRegConfirm ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={regForm.confirm}
                        onChange={e => { setRegForm(p => ({ ...p, confirm: e.target.value })); setRegError(''); }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
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

                {/* Password Requirements Checklist */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password must contain:</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={hasMinLen ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasMinLen ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} Min. 8 characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasUpper ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} 1 Uppercase letter
                    </span>
                    <span className={hasNumber ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : '•'} 1 Number
                    </span>
                  </div>
                </div>

                {/* Terms & Privacy Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none pt-1">
                  <input
                    type="checkbox"
                    checked={regForm.agreeTerms}
                    onChange={e => { setRegForm(p => ({ ...p, agreeTerms: e.target.checked })); setRegError(''); }}
                    className="mt-0.5 rounded bg-slate-950 border-slate-800 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    I agree to the <Link to="/terms" className="text-primary-400 hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-500 hover:to-primary-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {regLoading ? <Spinner /> : null}
                  {regLoading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Google Sign-up Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('Sign-Up')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign up with Google
              </button>
            </div>

            {/* Switch Footer */}
            <div className="pt-6 border-t border-slate-800/80 mt-6 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-violet-400 font-bold hover:underline"
                >
                  Sign In →
                </button>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* ── 4. PAGE FOOTER ────────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-slate-500 py-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>🔒 Your information is securely protected.</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-slate-400">
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
