import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schemeAPI, userAPI, applicationAPI, userAPI as profileAPI, documentAPI } from '../services/api';
import { SpinnerBlue, Badge, Spinner, ProgressBar } from '../components/ui/index.jsx';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../utils/deadline.utils';
import { 
  ArrowLeft, Bookmark, ExternalLink, CheckCircle, FileText, BookOpen, IndianRupee, 
  Calendar, Clock, Bot, Scale, CheckSquare, AlertTriangle, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [readinessScore, setReadinessScore] = useState(82);
  const [checklist, setChecklist] = useState({
    profile: true,
    eligibility: true,
    aadhaar: false,
    marksheet: false,
    income: false,
    submitted: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await schemeAPI.getById(id);
        setScheme(data.scheme);

        // Fetch user profile and documents to calculate live checklist
        try {
          const { data: profData } = await profileAPI.getProfile();
          const { data: docData } = await documentAPI.getAll();
          
          const docs = docData.documents || [];
          const hasAadhaar = docs.some(d => d.name.toLowerCase().includes('aadhaar') || d.category === 'Identity');
          const hasMarksheet = docs.some(d => d.name.toLowerCase().includes('marksheet') || d.category === 'Academic');
          const hasIncome = docs.some(d => d.name.toLowerCase().includes('income') || d.category === 'Income');

          setChecklist({
            profile: profData.profile?.isComplete || true,
            eligibility: true,
            aadhaar: hasAadhaar,
            marksheet: hasMarksheet,
            income: hasIncome,
            submitted: false,
          });

          // Calculate readiness score
          let score = 40; // profile + eligibility base
          if (hasAadhaar) score += 15;
          if (hasMarksheet) score += 15;
          if (hasIncome) score += 15;
          setReadinessScore(score);
        } catch (err) {}

      } catch {
        toast.error('Scholarship scheme not found');
        navigate('/schemes');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleBookmark = async () => {
    try {
      const { data } = await userAPI.toggleBookmark(id);
      setBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch { toast.error('Failed to update bookmark'); }
  };

  const handleApply = async () => {
    if (expired) {
      toast.error('Applications for this scholarship are closed.');
      return;
    }
    setApplying(true);
    try {
      await applicationAPI.upsert({ schemeId: id, status: 'Submitted' });
      setApplying(false);
      setApplied(true);
      setChecklist(prev => ({ ...prev, submitted: true }));
      toast.success('Application tracked and submitted successfully! 🎉');
    } catch (err) {
      setApplying(false);
      toast.error('Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinnerBlue size="lg" />
      </div>
    );
  }

  if (!scheme) return null;
  const c = scheme.eligibilityCriteria || {};
  const deadlineStatus = getDeadlineStatus(scheme);
  const daysRemaining = getDaysRemaining(scheme);
  const formattedDeadline = formatDate(scheme);
  const formattedOpenDate = formatDate(scheme.applicationOpenDate || new Date());
  const expired = isExpired(scheme);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button className="btn btn-ghost btn-sm gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Schemes
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/ai-advisor?scheme=${scheme._id}`)} 
            className="btn btn-ghost btn-sm text-xs gap-1"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" /> Ask AI
          </button>
          <button 
            onClick={() => navigate('/comparison')} 
            className="btn btn-ghost btn-sm text-xs gap-1"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-500" /> Compare
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="card glass-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">{scheme.category}</Badge>
            <Badge variant="gray">{scheme.ministry}</Badge>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${deadlineStatus.badgeClass}`}>
              {deadlineStatus.label}
            </span>
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all ${bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 leading-snug">
            {scheme.name}
          </h1>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Official Scheme Provider: <span className="font-semibold text-gray-700 dark:text-slate-300">{scheme.ministry}</span>
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
          {scheme.description}
        </p>

        {/* Core Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Financial Support</span>
            </div>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{scheme.amount}</p>
          </div>

          <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Frequency</span>
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{scheme.frequency}</p>
          </div>

          <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700/60 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Days Remaining</span>
            </div>
            <p className={`text-sm font-extrabold ${expired ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {daysRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Important Dates Section */}
      <div className="card glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/80 pb-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Important Dates</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Application Opens</span>
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{formattedOpenDate}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Application Last Date</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formattedDeadline}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 block">Current Status</span>
            <span className={`text-xs font-bold ${expired ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {expired ? '🔴 Applications Closed' : '🟢 Applications Open'}
            </span>
          </div>
        </div>
      </div>

      {/* Application Checklist & Readiness */}
      <div className="card glass-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Application Checklist & Readiness</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Readiness: {readinessScore}%
          </span>
        </div>

        <ProgressBar value={readinessScore} color={readinessScore >= 80 ? 'success' : 'warning'} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={checklist.profile ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.profile ? '✓' : '□'}</span>
            <span className={checklist.profile ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Student Profile Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklist.eligibility ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.eligibility ? '✓' : '□'}</span>
            <span className={checklist.eligibility ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Eligibility Criteria Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklist.aadhaar ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.aadhaar ? '✓' : '□'}</span>
            <span className={checklist.aadhaar ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Aadhaar Card Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklist.marksheet ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.marksheet ? '✓' : '□'}</span>
            <span className={checklist.marksheet ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Academic Marksheet Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklist.income ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.income ? '✓' : '□'}</span>
            <span className={checklist.income ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Income Certificate Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={checklist.submitted ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{checklist.submitted ? '✓' : '□'}</span>
            <span className={checklist.submitted ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}>Final Application Tracker Sync</span>
          </div>
        </div>
      </div>

      {/* Eligibility criteria */}
      <div className="card glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/80 pb-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Eligibility Criteria Breakdown</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          {[
            { k: 'Age Range',    v: `${c.minAge || 0} – ${c.maxAge >= 99 ? 'Any' : c.maxAge} years` },
            { k: 'Max Income Limit', v: c.maxAnnualIncome >= 9999999 ? 'No limit' : `₹${c.maxAnnualIncome?.toLocaleString('en-IN')}` },
            { k: 'Categories',   v: (c.categories?.includes('All') || !c.categories?.length) ? 'All categories' : c.categories?.join(', ') },
            { k: 'Education Level', v: c.educationLevels?.length ? c.educationLevels.join(', ') : 'Any level' },
            { k: 'Eligible States', v: (c.states?.includes('All') || !c.states?.length) ? 'Pan India' : c.states?.join(', ') },
            { k: 'Gender Criteria', v: (c.genders?.includes('All') || !c.genders?.length) ? 'All genders' : c.genders?.join(', ') },
          ].map(({ k, v }) => (
            <div key={k} className="flex gap-2 p-2 rounded-xl bg-gray-50/50 dark:bg-slate-800/30">
              <span className="text-gray-400 dark:text-slate-500 font-semibold min-w-[100px] flex-shrink-0">{k}:</span>
              <span className="text-gray-800 dark:text-slate-200 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required documents */}
      <div className="card glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/80 pb-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          <h2 className="font-bold text-sm text-gray-900 dark:text-slate-100">Required Documents Checklist</h2>
        </div>
        <ul className="space-y-2">
          {scheme.requiredDocuments?.map((doc, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Application Submission Section */}
      <div className="card glass-card p-6 text-center space-y-4">
        {expired ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-center space-y-2">
            <div className="text-3xl">🔴</div>
            <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Application Closed</h3>
            <p className="text-xs text-red-500 dark:text-red-400 max-w-sm mx-auto">
              The application deadline ({formattedDeadline}) for this scheme has passed. You can still save or compare this scholarship for future notification alerts.
            </p>
          </div>
        ) : applied ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <div className="text-4xl">🎉</div>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Application Tracked & Submitted!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 max-w-xs mx-auto">
              Track real-time progress and verification updates under your <strong>My Applications</strong> page.
            </p>
            <button 
              onClick={() => navigate('/applications')}
              className="btn btn-primary btn-sm text-xs mt-3"
            >
              Go to Application Tracker →
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-slate-100">🚀 Ready to Apply?</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Check that your profile and documents are up to date before submitting your application.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <button 
                onClick={handleApply} 
                disabled={applying} 
                className="btn btn-primary flex-1 py-3 gap-2 justify-center text-xs"
              >
                {applying ? <Spinner /> : <Send className="w-4 h-4" />}
                {applying ? 'Submitting…' : 'Track & Apply Scholarship'}
              </button>
              <a 
                href={scheme.officialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline flex-1 py-3 gap-2 justify-center text-xs"
              >
                Official Portal <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
