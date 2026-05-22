import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schemeAPI, userAPI } from '../services/api';
import { SpinnerBlue, Badge, Spinner } from '../components/ui/index.jsx';
import { ArrowLeft, Bookmark, ExternalLink, CheckCircle, FileText, BookOpen, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchemeDetailPage() {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const [scheme, setScheme]  = useState(null);
  const [loading, setLoading]   = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [applying, setApplying]     = useState(false);
  const [applied, setApplied]       = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await schemeAPI.getById(id);
        setScheme(data.scheme);
      } catch {
        toast.error('Scheme not found');
        navigate('/schemes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookmark = async () => {
    try {
      const { data } = await userAPI.toggleBookmark(id);
      setBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch { toast.error('Failed to update bookmark'); }
  };

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      toast.success('Application submitted successfully! 🎉');
    }, 1500);
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

  return (
    <div className="max-w-2xl animate-fade-in">
      <button className="btn btn-ghost btn-sm mb-6 gap-1.5" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Header card */}
      <div className="card mb-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">{scheme.category}</Badge>
            <Badge variant="gray">{scheme.ministry}</Badge>
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all ${bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 leading-snug mb-3">
          {scheme.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-5">
          {scheme.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Amount',    value: scheme.amount,    icon: IndianRupee },
            { label: 'Frequency', value: scheme.frequency, icon: BookOpen },
            { label: 'Status',    value: scheme.isActive ? 'Active' : 'Inactive', icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility criteria */}
      <div className="card mb-5 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h2 className="font-bold text-sm text-gray-800 dark:text-slate-200">Eligibility Criteria</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {[
            { k: 'Age Range',    v: `${c.minAge || 0} – ${c.maxAge >= 99 ? 'Any' : c.maxAge} years` },
            { k: 'Max Income',   v: c.maxAnnualIncome >= 9999999 ? 'No limit' : `₹${c.maxAnnualIncome?.toLocaleString('en-IN')}` },
            { k: 'Categories',   v: (c.categories?.includes('All') || !c.categories?.length) ? 'All categories' : c.categories?.join(', ') },
            { k: 'Education',    v: c.educationLevels?.length ? c.educationLevels.join(', ') : 'Any level' },
            { k: 'States',       v: (c.states?.includes('All') || !c.states?.length) ? 'Pan India' : c.states?.join(', ') },
            { k: 'Gender',       v: (c.genders?.includes('All') || !c.genders?.length) ? 'All genders' : c.genders?.join(', ') },
          ].map(({ k, v }) => (
            <div key={k} className="flex gap-2 text-sm">
              <span className="text-gray-400 dark:text-slate-500 font-semibold min-w-[90px] flex-shrink-0">{k}:</span>
              <span className="text-gray-700 dark:text-slate-300 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required documents */}
      <div className="card mb-5 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-sm text-gray-800 dark:text-slate-200">Required Documents</h2>
        </div>
        <ul className="space-y-2">
          {scheme.requiredDocuments?.map((doc, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Apply */}
      <div className="card text-center">
        <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-2">⚡ Apply Now</h3>
        {applied ? (
          <div className="animate-bounce-in bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Application Submitted!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">You'll receive a confirmation email shortly.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">
              Ensure you have all required documents ready before applying.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleApply} disabled={applying} className="btn btn-success flex-1 py-3 gap-2 justify-center">
                {applying ? <Spinner /> : null}
                {applying ? 'Submitting…' : '🚀 Apply for this Scholarship'}
              </button>
              <a href={scheme.officialLink} target="_blank" rel="noreferrer"
                className="btn btn-outline flex-1 py-3 gap-2 justify-center">
                Official Site <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
