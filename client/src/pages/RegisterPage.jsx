import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

// ✅ ✅ MOVE COMPONENT OUTSIDE (IMPORTANT FIX)
const InputField = ({ label, type = 'text', icon: Icon, placeholder, value, onChange, error }) => (
  <div>
    <label className="label">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input pl-10 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.name || form.name.length < 2)
      e.name = 'Name must be at least 2 characters';

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email';

    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters';

    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });

      navigate('/profile');
      toast.success('Welcome! Please complete your profile.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Start discovering scholarships for free
          </p>
        </div>

        {/* Form */}
        <div className="card shadow-card-hover">
          <form onSubmit={handleSubmit} className="space-y-4">

            <InputField
              label="Full Name"
              icon={User}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              error={errors.name}
            />

            <InputField
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              error={errors.email}
            />

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={e => setField('confirm', e.target.value)}
                  className={`input pl-10 ${errors.confirm ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-2 gap-2"
            >
              {loading && <Spinner />}
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← Back to Home
          </Link>
        </p>

      </div>
    </div>
  );
}