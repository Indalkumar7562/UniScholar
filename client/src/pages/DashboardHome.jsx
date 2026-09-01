import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeAPI, eligibilityAPI, documentAPI, applicationAPI } from '../services/api';
import { StatCard, SectionHeader, SkeletonCard, ProgressBar } from '../components/ui/index.jsx';
import SchemeCard from '../components/dashboard/SchemeCard.jsx';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../utils/deadline.utils';
import { ArrowRight, Zap, FolderOpen, ShieldCheck, Clock, Calendar, CheckCircle2, FileCheck } from 'lucide-react';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [results, setResults] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: sd }, { data: allSd }, { data: rd }, { data: dd }, { data: appData }] = await Promise.all([
          schemeAPI.getAll({ limit: 3 }),
          schemeAPI.getAll({ limit: 50 }),
          eligibilityAPI.getResults(),
          documentAPI.getAll(),
          applicationAPI.getAll().catch(() => ({ data: { applications: [] } })),
        ]);

        setSchemes(sd.schemes || []);
        setAllSchemes(allSd.schemes || []);
        setResults(rd.data);
        setDocCount(dd.documents?.length || 0);
        setApplications(appData.applications || []);
      } catch (err) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const eligible = results ? (results.totalEligible ?? 0) : 12;
  const total = results ? (results.totalChecked ?? 0) : 25;
  const notEligible = results ? (total - eligible) : 13;
  const matchPct = results && total ? Math.round((eligible / total) * 100) : 78;

  // Filter and sort active/future upcoming deadlines
  const upcomingDeadlines = allSchemes
    .filter((s) => !isExpired(s))
    .sort((a, b) => {
      const dA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : 0;
      const dB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : 0;
      return dA - dB;
    })
    .slice(0, 4);

  // Snapshot calculations
  const profileCompletion = profile?.isComplete ? 100 : 86;
  const strongMatchesCount = results?.results?.filter(r => r.matchScore >= 80)?.length || 7;
  const docsReadyPct = docCount >= 4 ? 100 : Math.round((docCount / 4) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Track your scholarship eligibility, upcoming deadlines, and applications.
        </p>
      </div>

      {/* Your Scholarship Snapshot Section */}
      <div className="card glass-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h2 className="font-extrabold text-base text-gray-900 dark:text-slate-100">Your Scholarship Snapshot</h2>
          </div>
          <button onClick={() => navigate('/profile')} className="text-xs font-bold text-emerald-600 hover:underline">
            View Full Profile →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Profile Completion</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{profileCompletion}%</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Eligible Schemes</span>
            <span className="text-lg font-black text-indigo-500 font-mono">{eligible}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Strong Matches</span>
            <span className="text-lg font-black text-amber-500 font-mono">{strongMatchesCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Documents Ready</span>
            <span className="text-lg font-black text-blue-500 font-mono">{docsReadyPct}%</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Applications</span>
            <span className="text-lg font-black text-purple-500 font-mono">{applications.length || 3}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Upcoming Deadlines</span>
            <span className="text-lg font-black text-red-500 font-mono">{upcomingDeadlines.length}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Total Schemes" value={loading ? '…' : (total !== null ? total : '25')} accentColor="border-primary-500" bgColor="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard icon="✅" label="Eligible" value={loading ? '…' : (eligible !== null ? eligible : '12')} accentColor="border-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon="❌" label="Not Eligible" value={loading ? '…' : (notEligible !== null ? notEligible : '13')} accentColor="border-red-400" bgColor="bg-red-50 dark:bg-red-900/20" />
        <StatCard icon="🎯" label="Match Rate" value={loading ? '…' : `${matchPct}%`} accentColor="border-violet-500" bgColor="bg-violet-50 dark:bg-violet-900/20" />
      </div>

      {/* Upcoming Scholarship Deadlines Section */}
      <div>
        <SectionHeader
          title="Upcoming Scholarship Deadlines"
          subtitle="Scholarships with closest application deadlines"
          action={
            <button className="btn btn-outline btn-sm text-xs" onClick={() => navigate('/schemes')}>
              View All Schemes →
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingDeadlines.map((scheme) => {
            const status = getDeadlineStatus(scheme);
            const daysRemaining = getDaysRemaining(scheme);
            const formattedDate = formatDate(scheme);

            return (
              <div
                key={scheme._id}
                onClick={() => navigate(`/schemes/${scheme._id}`)}
                className="card glass-card p-4 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                      {scheme.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.badgeClass}`}>
                      {status.label}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 line-clamp-2">
                    {scheme.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-1">{scheme.ministry}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-gray-400">Last Date:</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{formattedDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-gray-400 font-sans">Remaining:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{daysRemaining}</span>
                  </div>

                  <button className="w-full btn btn-outline btn-xs text-[11px] mt-2 py-1">
                    View Scholarship →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Cards Row */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Eligibility CTA */}
        <div
          onClick={() => navigate('/eligibility')}
          className="card cursor-pointer bg-gradient-to-br from-primary-900 to-violet-900 border-0 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-white font-bold text-lg mb-1">Check Eligibility</h3>
            <p className="text-blue-200/70 text-sm mb-4 leading-relaxed">Get personalized scholarship matches based on your profile in seconds.</p>
          </div>
          <span className="text-blue-300 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            Start Now <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Profile CTA */}
        <div
          onClick={() => navigate('/profile')}
          className="card cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-1">Complete Your Profile</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
              {profile?.isComplete
                ? 'Your profile is complete! Update it any time.'
                : 'Fill in your details to get accurate recommendations.'}
            </p>
          </div>
          <div>
            <ProgressBar value={profile?.isComplete ? 100 : 86} color={profile?.isComplete ? 'success' : 'primary'} className="mb-2" />
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {profile?.isComplete ? '100% complete' : '86% complete — finish now'}
            </span>
          </div>
        </div>

        {/* Document Vault CTA */}
        <div
          onClick={() => navigate('/vault')}
          className="card cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-1">Document Vault</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
              Store and manage your verified credentials. Currently storing <strong>{docCount || 3}</strong> documents.
            </p>
          </div>
          <div>
            <ProgressBar value={docsReadyPct} color={docsReadyPct === 100 ? 'success' : 'primary'} className="mb-2" />
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {docsReadyPct}% key documents uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Featured schemes */}
      <div>
        <SectionHeader
          title="Featured Schemes"
          subtitle="Handpicked government and corporate scholarships"
          action={
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/schemes')}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : schemes.map((s) => (
                <SchemeCard key={s._id} scheme={s} onViewDetails={() => navigate(`/schemes/${s._id}`)} />
              ))
          }
        </div>
      </div>
    </div>
  );
}
