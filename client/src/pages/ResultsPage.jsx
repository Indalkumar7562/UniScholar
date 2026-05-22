import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eligibilityAPI } from '../services/api';
import { SectionHeader, EmptyState, SkeletonCard, ProgressBar } from '../components/ui/index.jsx';
import SchemeCard from '../components/dashboard/SchemeCard.jsx';
import { 
  RefreshCw, Search, Sparkles, CheckCircle2, XCircle, 
  AlertTriangle, BookOpen, ExternalLink, X, FileCheck, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'all',          label: 'All Schemes' },
  { key: 'eligible',     label: 'Fully Eligible' },
  { key: 'recommended',  label: 'Highly Recommended' },
  { key: 'lowMatch',     label: 'Low Match Rate' }
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Drawer Details state
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const { data } = await eligibilityAPI.getResults();
      setResults(data.data);
    } catch (err) {
      toast.error('Failed to load eligibility records');
    } finally {
      setLoading(false);
    }
  };

  const runRecheck = async () => {
    setLoading(true);
    try {
      const { data } = await eligibilityAPI.check();
      toast.success(data.message || 'Eligibility check refreshed!');
      await loadResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please complete your profile before checking eligibility');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <EmptyState
        icon="🔍"
        title="No Results Checked Yet"
        description="Launch our welfare rule matching engine to discover scholarships matching your current profile."
        action={
          <button className="btn btn-primary px-6" onClick={() => navigate('/eligibility')}>
            Launch Eligibility Check →
          </button>
        }
      />
    );
  }

  // Map scheme details + result matching indicators
  const allSchemes = results.results?.map(r => {
    if (!r.scheme) return null;
    return {
      ...r.scheme,
      eligible: r.eligible,
      matchScore: r.matchScore,
      matchedCriteria: r.matchedCriteria || [],
      missingCriteria: r.missingCriteria || [],
      missingDocuments: r.missingDocuments || [],
      eligibilityProbability: r.eligibilityProbability || 0,
      confidenceScore: r.confidenceScore || 0,
      rejectionReasons: r.rejectionReasons || [],
      suggestions: r.suggestions || []
    };
  }).filter(Boolean) || [];

  const eligible = allSchemes.filter(s => s.eligible);
  const ineligible = allSchemes.filter(s => !s.eligible);
  const recommended = allSchemes.filter(s => s.matchScore >= 75);
  const lowMatch = allSchemes.filter(s => s.matchScore < 75);

  const displayed = allSchemes
    .filter(s => {
      if (filter === 'eligible' && !s.eligible) return false;
      if (filter === 'recommended' && s.matchScore < 75) return false;
      if (filter === 'lowMatch' && s.matchScore >= 75) return false;
      if (search && !s.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore); // highest match first

  return (
    <div className="space-y-6 animate-fade-in relative">
      <SectionHeader
        title="Welfare Eligibility Results"
        subtitle={`Audit timestamp: ${new Date(results.checkedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
        action={
          <button className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5" onClick={runRecheck}>
            <RefreshCw className="w-3.5 h-3.5" /> Re-Check Eligibility
          </button>
        }
      />

      {/* Statistics Banner */}
      <div className="card glass-card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          <div className="text-center md:border-r border-gray-150 dark:border-slate-700/80">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{eligible.length}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mt-1">Eligible Programs</p>
          </div>
          <div className="text-center md:border-r border-gray-150 dark:border-slate-700/80">
            <p className="text-3xl font-black text-red-500 font-mono">{ineligible.length}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mt-1">Missed Matches</p>
          </div>
          <div className="text-center md:border-r border-gray-150 dark:border-slate-700/80">
            <p className="text-3xl font-black text-gray-800 dark:text-white font-mono">{allSchemes.length}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mt-1">Checked</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
              <span>Welfare Matching Rate</span>
              <span className="text-primary-600 font-mono">{allSchemes.length ? Math.round((eligible.length / allSchemes.length) * 100) : 0}%</span>
            </div>
            <ProgressBar value={allSchemes.length ? (eligible.length / allSchemes.length) * 100 : 0} color="success" />
          </div>
        </div>
      </div>

      {/* Filter and search navigation */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`chip px-4 py-2 ${filter === f.key ? 'chip-active' : ''}`}
            >
              {f.label}
              <span className="ml-1 text-[9px] font-bold bg-gray-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-gray-600 dark:text-slate-400">
                {f.key === 'all' ? allSchemes.length : f.key === 'eligible' ? eligible.length : f.key === 'recommended' ? recommended.length : lowMatch.length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            className="input pl-9 text-xs" 
            placeholder="Search matching schemes..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Schemes Grid */}
      {displayed.length === 0 ? (
        <EmptyState icon="🔎" title="No results fit criteria" description="Try selecting another filter or complete more details in your profile." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map(s => (
            <div 
              key={s._id} 
              className="relative cursor-pointer"
              onClick={() => setSelectedScheme(s)}
            >
              <SchemeCard 
                scheme={s}
                showEligibility
                onViewDetails={() => setSelectedScheme(s)}
              />
              <div className="absolute bottom-3 right-20 text-[9px] font-bold bg-primary-50 dark:bg-primary-950/20 text-primary-600 px-2 py-0.5 rounded-full">
                Match: {s.matchScore}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-Out Detail Drawer ─────────────────────────── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedScheme(null)} />
          
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-800 shadow-2xl border-l border-gray-150 dark:border-slate-700/80 flex flex-col animate-slide-up text-xs">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 dark:border-slate-700 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">{selectedScheme.ministry}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 mt-1 leading-snug">{selectedScheme.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6 scrollbar-hide">
              
              {/* Radial Score Rings */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="text-lg font-black text-primary-600 dark:text-primary-400 font-mono">{selectedScheme.matchScore}%</div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mt-0.5">Rules Match</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="text-lg font-black text-amber-500 font-mono">{selectedScheme.confidenceScore}%</div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mt-0.5">Confidence</span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{selectedScheme.eligibilityProbability}%</div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mt-0.5">Probability</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-gray-700 dark:text-slate-350 mb-1">About the Program</h4>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-[11px]">{selectedScheme.description}</p>
              </div>

              {/* Matched vs Missed criteria */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 dark:text-slate-350 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  Criteria Check Audit
                </h4>

                <div className="space-y-2">
                  {selectedScheme.matchedCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                  {selectedScheme.missingCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-500 font-medium">
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents */}
              {selectedScheme.missingDocuments.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl space-y-2">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Required Missing Documents ({selectedScheme.missingDocuments.length})
                  </div>
                  <ul className="list-disc pl-5 text-amber-600 dark:text-amber-400 space-y-1">
                    {selectedScheme.missingDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Suggestion / Rejection advice */}
              {!selectedScheme.eligible && (selectedScheme.rejectionReasons.length > 0 || selectedScheme.suggestions.length > 0) && (
                <div className="card border-l-4 border-l-violet-600 space-y-3 bg-gradient-to-r from-violet-50/50 to-white dark:from-violet-950/10 dark:to-slate-800">
                  <h4 className="font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI Actionable Welfare Suggestions
                  </h4>
                  
                  {selectedScheme.rejectionReasons.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-700 dark:text-slate-350">Rejection Details:</div>
                      {selectedScheme.rejectionReasons.map((r, i) => (
                        <p key={i} className="text-gray-500 dark:text-slate-400 leading-normal">• {r}</p>
                      ))}
                    </div>
                  )}

                  {selectedScheme.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-700/60 p-2.5 rounded-xl border border-violet-100 dark:border-slate-750">
                      <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 dark:text-slate-200 font-semibold">{s}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Footer Apply Links */}
            <div className="p-5 border-t border-gray-150 dark:border-slate-700 flex gap-3">
              <button 
                onClick={() => setSelectedScheme(null)}
                className="btn btn-ghost flex-1 py-2.5"
              >
                Close details
              </button>
              
              {selectedScheme.officialLink && (
                <a 
                  href={selectedScheme.officialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary flex-1 py-2.5 flex items-center justify-center gap-1 bg-gradient-to-r from-primary-600 to-violet-600 text-white"
                >
                  Apply Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
