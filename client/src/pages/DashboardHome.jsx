import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeAPI, eligibilityAPI, documentAPI, applicationAPI } from '../services/api';
import { Avatar, SkeletonCard, ProgressBar } from '../components/ui/index.jsx';
import StudentIdBadge from '../components/ui/StudentIdBadge.jsx';
import SchemeCard from '../components/dashboard/SchemeCard.jsx';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../utils/deadline.utils';
import { 
  ArrowRight, Search, CheckCircle2, AlertCircle, Clock, 
  FileText, FolderOpen, Sparkles, ShieldCheck, Compass, BookOpen, Layers
} from 'lucide-react';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [results, setResults] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [{ data: sd }, { data: allSd }, { data: rd }, { data: dd }, { data: appData }] = await Promise.all([
          schemeAPI.getAll({ limit: 4, sort: 'deadline' }),
          schemeAPI.getAll({ limit: 50 }),
          eligibilityAPI.getResults().catch(() => ({ data: null })),
          documentAPI.getAll().catch(() => ({ data: { documents: [] } })),
          applicationAPI.getAll().catch(() => ({ data: { applications: [] } })),
        ]);

        setSchemes(sd.schemes || []);
        setAllSchemes(allSd.schemes || []);
        setResults(rd.data);
        setDocuments(dd.documents || []);
        setApplications(appData.applications || []);
      } catch (err) {
        /* ignore fallback */
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Filter and sort active/future upcoming deadlines
  const upcomingDeadlines = allSchemes
    .filter((s) => !isExpired(s))
    .sort((a, b) => {
      const dA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : 0;
      const dB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : 0;
      return dA - dB;
    })
    .slice(0, 4);

  // Profile completion calculation
  const getProfileCompletionScore = () => {
    if (!profile) return 60;
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.age && profile.state) score += 20;
    if (profile.educationLevel && profile.stream) score += 20;
    if (profile.annualFamilyIncome !== undefined) score += 20;
    if (documents.length > 0) score += 20;
    return score;
  };

  const profilePct = getProfileCompletionScore();

  // Document Readiness calculation
  const requiredDocTypes = ['incomeCertificate', 'marksheet', 'aadhaar', 'domicile'];
  const uploadedDocTypes = documents.map(d => d.category);
  const readyDocsCount = requiredDocTypes.filter(type => uploadedDocTypes.includes(type)).length;

  const appReadinessPct = Math.round(
    (profilePct * 0.4) + ((readyDocsCount / 4) * 40) + (applications.length > 0 ? 20 : 10)
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">

      {/* ── LEVEL 1: WELCOME & PRIMARY ACTION SECTION ───────────────────────────── */}
      <div className="space-y-6">
        
        {/* Compact Welcome Card */}
        <div className="card glass-card p-6 border border-gray-150 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <div className="pt-1">
              <StudentIdBadge studentId={user?.studentId || 'USS-STU-2026-000001'} size="sm" />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
              Find scholarships matching your profile, track active applications, and never miss a deadline.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <Avatar name={user?.name || 'Student'} size="xl" src={user?.avatar} />
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold shadow-md shadow-primary-500/10"
            >
              Complete Profile <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Profile Completion Progress Card */}
        <div className="card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              <span className="text-gray-900 dark:text-slate-100">Profile Completion Status</span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{profilePct}%</span>
          </div>

          <ProgressBar value={profilePct} color={profilePct === 100 ? 'success' : 'primary'} className="h-2 rounded-full" />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Personal Details
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Academic Info
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Financial Info
              </span>
              <span className={readyDocsCount >= 2 ? 'flex items-center gap-1 text-emerald-600 font-semibold' : 'flex items-center gap-1 text-amber-500 font-semibold'}>
                {readyDocsCount >= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} Documents ({readyDocsCount}/4)
              </span>
            </div>

            <button onClick={() => navigate('/profile')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
              {profilePct === 100 ? 'View Profile →' : 'Complete Profile →'}
            </button>
          </div>
        </div>

        {/* What would you like to do? Primary Action Bar */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">What would you like to do?</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div
              onClick={() => navigate('/schemes')}
              className="card p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-gray-900 dark:text-slate-100 group-hover:text-primary-600">Find Scholarships</h3>
                <p className="text-[10px] text-gray-400 truncate">Discover matching schemes</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/eligibility')}
              className="card p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-gray-900 dark:text-slate-100 group-hover:text-emerald-600">Check Eligibility</h3>
                <p className="text-[10px] text-gray-400 truncate">Verify scheme qualification</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/applications')}
              className="card p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-gray-900 dark:text-slate-100 group-hover:text-purple-600">My Applications</h3>
                <p className="text-[10px] text-gray-400 truncate">Track submitted applications</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/vault')}
              className="card p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-gray-900 dark:text-slate-100 group-hover:text-amber-600">Documents</h3>
                <p className="text-[10px] text-gray-400 truncate">Manage required credentials</p>
              </div>
            </div>

          </div>
        </div>

      </div>


      {/* ── LEVEL 2: RECOMMENDED SCHOLARSHIPS (PRIMARY CENTERPIECE) ─────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>🎯 Recommended Scholarships</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Scholarships selected based on your academic profile and eligibility rules
            </p>
          </div>
          <button onClick={() => navigate('/schemes')} className="btn btn-ghost btn-xs text-xs font-bold text-primary-600 dark:text-primary-400">
            View All Schemes →
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : schemes.length === 0 ? (
          <div className="card p-8 text-center text-xs text-gray-400">
            No recommended scholarships found. Complete your profile to get matched!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {schemes.map((scheme) => (
              <SchemeCard 
                key={scheme._id} 
                scheme={scheme} 
                showEligibility={true}
                onViewDetails={() => navigate(`/schemes/${scheme._id}`)} 
              />
            ))}
          </div>
        )}
      </div>


      {/* ── LEVEL 3: TWO-COLUMN ROW (UPCOMING DEADLINES + MY APPLICATIONS) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Left Column: Upcoming Deadlines */}
        <div className="card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-gray-900 dark:text-slate-100">Upcoming Deadlines</h3>
              </div>
              <button onClick={() => navigate('/schemes')} className="text-[11px] font-bold text-primary-600 hover:underline">
                View All →
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.map((scheme) => {
                const daysRemaining = getDaysRemaining(scheme);
                const formattedDate = formatDate(scheme);
                return (
                  <div
                    key={scheme._id}
                    onClick={() => navigate(`/schemes/${scheme._id}`)}
                    className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">{scheme.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{formattedDate}</div>
                    </div>
                    <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      {daysRemaining}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => navigate('/schemes')} className="w-full btn btn-outline btn-xs text-[11px] py-1.5 mt-2">
            Explore All Deadlines →
          </button>
        </div>

        {/* Right Column: My Applications */}
        <div className="card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <h3 className="font-black text-sm text-gray-900 dark:text-slate-100">My Applications</h3>
              </div>
              <button onClick={() => navigate('/applications')} className="text-[11px] font-bold text-primary-600 hover:underline">
                View Tracker →
              </button>
            </div>

            <div className="space-y-2.5">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  onClick={() => navigate('/applications')}
                  className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">
                      {app.scheme?.name || 'Scholarship Scheme'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Applied: {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                    {app.status}
                  </span>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400">
                  No active applications. Start by selecting a recommended scholarship above!
                </div>
              )}
            </div>
          </div>

          <button onClick={() => navigate('/applications')} className="w-full btn btn-outline btn-xs text-[11px] py-1.5 mt-2">
            Open Application Tracker →
          </button>
        </div>

      </div>


      {/* ── LEVEL 4: TWO-COLUMN ROW (APPLICATION READINESS + DOCUMENTS READY) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Left: Application Readiness */}
        <div className="card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3">
            <h3 className="font-black text-sm text-gray-900 dark:text-slate-100">Application Readiness</h3>
            <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{appReadinessPct}%</span>
          </div>

          <ProgressBar value={appReadinessPct} color="success" className="h-2 rounded-full" />

          <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
            <div className="p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 flex justify-between">
              <span className="text-[11px] font-sans text-gray-400">Profile Details</span>
              <span className="font-bold text-emerald-600">✓ Ready</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 flex justify-between">
              <span className="text-[11px] font-sans text-gray-400">Eligibility Checks</span>
              <span className="font-bold text-emerald-600">✓ Passed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 flex justify-between">
              <span className="text-[11px] font-sans text-gray-400">Key Documents</span>
              <span className="font-bold text-amber-500">{readyDocsCount}/4 Ready</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 flex justify-between">
              <span className="text-[11px] font-sans text-gray-400">Form Checklist</span>
              <span className="font-bold text-purple-600">Complete</span>
            </div>
          </div>
        </div>

        {/* Right: Documents Ready Status */}
        <div className="card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3">
            <h3 className="font-black text-sm text-gray-900 dark:text-slate-100">Documents Status</h3>
            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{readyDocsCount} / 4 Verified</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> Aadhaar Card
            </div>
            <div className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> Academic Marksheet
            </div>
            <div className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 flex items-center gap-2">
              <span className="text-amber-500 font-bold">⚠</span> Income Certificate
            </div>
            <div className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 flex items-center gap-2">
              <span className="text-amber-500 font-bold">⚠</span> Domicile Certificate
            </div>
          </div>

          <button onClick={() => navigate('/vault')} className="w-full btn btn-outline btn-xs text-[11px] py-1.5">
            Open Document Vault →
          </button>
        </div>

      </div>


      {/* ── LEVEL 5: FOOTER PROMOTION (AI ADVISOR + STUDENT RESOURCES) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Left Column (1/3): AI Advisor Promotion */}
        <div className="card p-5 bg-gradient-to-br from-violet-900 via-primary-900 to-indigo-950 text-white border-0 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 text-violet-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>UniScholar AI Advisor</span>
            </div>
            <h3 className="font-extrabold text-base text-white">Need Scholarship Guidance?</h3>
            <p className="text-xs text-blue-200/80 leading-relaxed mt-1">
              Ask about eligibility criteria, upcoming deadlines, document verification, or tailored scheme recommendations.
            </p>
          </div>

          <button
            onClick={() => navigate('/ai-hub')}
            className="w-full py-2 px-4 rounded-xl bg-white text-slate-950 font-extrabold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            Ask AI Advisor <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Column (2/3): Student Resources */}
        <div className="lg:col-span-2 card p-5 border border-gray-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3">
            <h3 className="font-black text-sm text-gray-900 dark:text-slate-100">Student Resources</h3>
            <button onClick={() => navigate('/articles')} className="text-[11px] font-bold text-primary-600 hover:underline">
              View All Articles →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => navigate('/articles')}
              className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer text-center space-y-1"
            >
              <div className="text-xl">📚</div>
              <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Scholarship Guide</div>
              <p className="text-[10px] text-gray-400">Step-by-step info</p>
            </div>

            <div
              onClick={() => navigate('/support-programme')}
              className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer text-center space-y-1"
            >
              <div className="text-xl">📝</div>
              <div className="font-bold text-xs text-gray-900 dark:text-slate-100">How to Apply</div>
              <p className="text-[10px] text-gray-400">Application tips</p>
            </div>

            <div
              onClick={() => navigate('/vault')}
              className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer text-center space-y-1"
            >
              <div className="text-xl">📁</div>
              <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Document Guide</div>
              <p className="text-[10px] text-gray-400">Format & sizes</p>
            </div>

            <div
              onClick={() => navigate('/articles')}
              className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50 hover:bg-gray-100/60 transition-colors cursor-pointer text-center space-y-1"
            >
              <div className="text-xl">🛡️</div>
              <div className="font-bold text-xs text-gray-900 dark:text-slate-100">Fraud Awareness</div>
              <p className="text-[10px] text-gray-400">Stay protected</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
