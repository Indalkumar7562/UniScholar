import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import PortalSwitchFooter from '../components/auth/PortalSwitchFooter.jsx';
import toast from 'react-hot-toast';

export default function PartnerRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirm: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.organization || !form.password) {
      setError('Please fill in all partner details.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'partner',
        organization: form.organization
      });
      toast.success('🏢 Partner registration successful! Welcome.');
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Partner registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center py-6 px-4 font-sans relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="text-center space-y-1 z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 mb-2">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">USS Partner Portal</h1>
        <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Scholarship Provider Onboarding</p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-white">🏢 Create Partner Account</h2>
          <p className="text-xs text-slate-400 mt-1">Register your foundation or organization to manage scholarship programs.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Contact Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dr. Rajesh Kumar"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Organization / Trust Name</label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm(p => ({ ...p, organization: e.target.value }))}
              placeholder="e.g. Tata Education & Development Trust"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Work Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="official@organization.org"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Confirm</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Spinner /> : 'Register Partner Account →'}
          </button>
        </form>

        {/* Unified Role Switcher Footer */}
        <PortalSwitchFooter currentRole="partner" currentMode="register" />
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-500 z-10">UniScholar Partner Operations • Authorized Provider Portal</p>

    </div>
  );
}
