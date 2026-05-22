import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eligibilityAPI } from '../services/api';
import { SectionHeader, SpinnerBlue, ProgressBar } from '../components/ui/index.jsx';
import { CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  'Loading your profile…',
  'Scanning income criteria…',
  'Matching categories…',
  'Checking education levels…',
  'Verifying state eligibility…',
  'Calculating match scores…',
  'Finalizing results…',
];

export default function EligibilityPage() {
  const { profile } = useAuth();
  const navigate     = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx]   = useState(0);

  const runCheck = async () => {
    if (!profile?.isComplete) {
      toast.error('Please complete your profile first');
      return;
    }
    setLoading(true);
    setProgress(0);
    setStepIdx(0);

    // Animate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p > 90) { clearInterval(interval); p = 90; }
      setProgress(Math.round(p));
      setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
    }, 280);

    try {
      const { data } = await eligibilityAPI.check();
      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));
      toast.success(data.message);
      navigate('/results');
    } catch (err) {
      clearInterval(interval);
      toast.error(err.response?.data?.message || 'Check failed. Try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const fields = [
    { label: 'Name',       value: profile?.fullName,       icon: '👤' },
    { label: 'Age',        value: profile?.age ? `${profile.age} years` : null, icon: '🎂' },
    { label: 'Category',   value: profile?.category,       icon: '🏷️' },
    { label: 'Education',  value: profile?.educationLevel, icon: '🎓' },
    { label: 'Income',     value: profile?.annualFamilyIncome !== undefined ? `₹${Number(profile.annualFamilyIncome).toLocaleString('en-IN')}` : null, icon: '💰' },
    { label: 'State',      value: profile?.state,          icon: '📍' },
  ];

  return (
    <div className="max-w-xl animate-fade-in">
      <SectionHeader
        title="Check Eligibility"
        subtitle="We'll scan all active schemes and show your personalized matches"
      />

      {/* Profile summary */}
      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="font-bold text-sm text-gray-700 dark:text-slate-300">Your Profile Summary</h3>
        </div>

        {!profile ? (
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">No profile found. Please complete your profile first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{icon} {label}</p>
                <p className={`text-sm font-semibold truncate ${!value ? 'text-red-400' : 'text-gray-800 dark:text-slate-200'}`}>
                  {value || 'Not set'}
                </p>
              </div>
            ))}
          </div>
        )}

        {profile && !profile.isComplete && (
          <div className="flex items-start gap-3 p-3 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">Profile incomplete. Results may be inaccurate.</p>
          </div>
        )}
      </div>

      {/* Progress animation */}
      {loading && (
        <div className="card mb-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <SpinnerBlue size="sm" /> {STEPS[stepIdx]}
            </span>
            <span className="text-sm font-bold text-primary-600">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <div className="flex flex-wrap gap-2 pt-1">
            {STEPS.slice(0, 4).map((s, i) => (
              <span key={i} className={`text-[11px] font-medium flex items-center gap-1 ${i <= stepIdx ? 'text-emerald-500' : 'text-gray-300 dark:text-slate-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${i <= stepIdx ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-600'}`} />
                {s.replace('…', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action card */}
      <div className="card text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-2">Ready to Check?</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
          We'll match your profile against all active government schemes and show you exactly what you're eligible for.
        </p>
        <button
          onClick={runCheck}
          disabled={loading || !profile}
          className="btn btn-primary btn-lg w-full justify-center gap-2"
        >
          {loading ? (
            <><SpinnerBlue size="sm" className="!border-white/30 !border-t-white" /> Analyzing Eligibility…</>
          ) : (
            <>🔍 Check My Eligibility <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
          🔒 Based on officially notified government schemes
        </p>
      </div>
    </div>
  );
}
