import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeAPI, eligibilityAPI } from '../services/api';
import { StatCard, SectionHeader, SkeletonCard, ProgressBar } from '../components/ui/index.jsx';
import SchemeCard from '../components/dashboard/SchemeCard.jsx';
import { ArrowRight, Zap } from 'lucide-react';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const navigate           = useNavigate();
  const [schemes, setSchemes]   = useState([]);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: sd }, { data: rd }] = await Promise.all([
          schemeAPI.getAll({ limit: 3 }),
          eligibilityAPI.getResults(),
        ]);
        setSchemes(sd.schemes || []);
        setResults(rd.data);
      } catch {/* ignore */} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const eligible    = results?.totalEligible ?? 0;
  const total       = results?.totalChecked ?? 0;
  const notEligible = total - eligible;
  const matchPct    = total ? Math.round((eligible / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Track your scholarship eligibility and manage your applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Total Schemes"   value={loading ? '…' : total || '—'}       accentColor="border-primary-500" bgColor="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard icon="✅" label="Eligible"         value={loading ? '…' : eligible || '—'}    accentColor="border-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon="❌" label="Not Eligible"     value={loading ? '…' : notEligible || '—'} accentColor="border-red-400"     bgColor="bg-red-50 dark:bg-red-900/20" />
        <StatCard icon="🎯" label="Match Rate"       value={loading ? '…' : total ? `${matchPct}%` : '—'} accentColor="border-violet-500" bgColor="bg-violet-50 dark:bg-violet-900/20" />
      </div>

      {/* CTA cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Eligibility CTA */}
        <div
          onClick={() => navigate('/eligibility')}
          className="card cursor-pointer bg-gradient-to-br from-primary-900 to-violet-900 border-0 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group"
        >
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-white font-bold text-lg mb-1">Check Eligibility</h3>
          <p className="text-blue-200/70 text-sm mb-4 leading-relaxed">Get personalized scholarship matches based on your profile in seconds.</p>
          <span className="text-blue-300 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Start Now <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Profile CTA */}
        <div
          onClick={() => navigate('/profile')}
          className="card cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group"
        >
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-1">Complete Your Profile</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            {profile?.isComplete
              ? 'Your profile is complete! Update it any time.'
              : 'Fill in your details to get accurate recommendations.'}
          </p>
          <ProgressBar value={profile?.isComplete ? 100 : 55} color={profile?.isComplete ? 'success' : 'primary'} className="mb-2" />
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {profile?.isComplete ? '100% complete' : '55% complete — finish now'}
          </span>
        </div>
      </div>

      {/* Last results summary */}
      {results && (
        <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">Last Eligibility Check</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {eligible} eligible out of {total} schemes · {new Date(results.checkedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button className="btn btn-success btn-sm" onClick={() => navigate('/results')}>
              View Results <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Featured schemes */}
      <div>
        <SectionHeader
          title="Featured Schemes"
          subtitle="Handpicked government scholarships"
          action={
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/schemes')}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : schemes.map(s => (
                <SchemeCard key={s._id} scheme={s} onViewDetails={() => navigate(`/schemes/${s._id}`)} />
              ))
          }
        </div>
      </div>
    </div>
  );
}
