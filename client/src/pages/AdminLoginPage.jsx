import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, Mail, Lock, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: 'admin@demo.com', password: 'demo@123' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setForm({ email: 'admin@demo.com', password: 'demo@123' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter admin email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form);
      if (user && user.role !== 'admin') {
        toast.error('Account is not authorized for Admin Portal');
        navigate('/dashboard');
        return;
      }
      toast.success('🔐 Welcome to Admin Portal!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center py-6 px-4 font-sans relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="text-center space-y-1 z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-2">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">USS Intelligence</h1>
        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Admin Operations Portal</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">🔐 Admin Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Manage scholarships, applications, users, and platform operations.</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-blue-400">🧪 Demo Credentials:</span>
            <p className="font-mono text-slate-300 text-[11px]">admin@demo.com • demo@123</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 underline shrink-0"
          >
            Fill Demo
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@demo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => toast.info('Contact system administrator to reset credentials.')}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-400"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : 'Sign In to Admin Portal →'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex flex-col gap-2 text-center text-xs text-slate-400">
          <Link to="/partner/login" className="text-purple-400 font-bold hover:underline">
            Are you a Scholarship Partner? Partner Login →
          </Link>
          <Link to="/login" className="text-slate-400 hover:text-white font-medium flex items-center justify-center gap-1 mt-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Login
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-500 z-10">UniScholar System Operations • Restricted Administrative System</p>

    </div>
  );
}
