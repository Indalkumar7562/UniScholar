import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eligibilityAPI } from '../services/api';
import { SectionHeader, EmptyState, SkeletonCard } from '../components/ui/index.jsx';
import SchemeCard, { handleApplyOfficialPortal } from '../components/dashboard/SchemeCard.jsx';
import { 
  RefreshCw, Search, CheckCircle2, XCircle, 
  AlertTriangle, BookOpen, ExternalLink, X, Filter
} from 'lucide-react';
import { showToast } from '../utils/toastQueue';
import { getDeadlineStatus, formatDate, isExpired } from '../utils/deadline.utils';

const FILTER_TAGS = [
  { key: 'all',          label: 'All Matches' },
  { key: 'eligible',     label: 'Eligible' },
  { key: 'strong',       label: 'Strong Match' },
  { key: 'closing',      label: 'Closing Soon' },
  { key: 'govt',         label: 'Government' },
  { key: 'private',      label: 'Private' }
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Selected Scheme for Modal
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  // Control body scrolling when modal is open
  useEffect(() => {
    if (selectedScheme) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedScheme]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const { data } = await eligibilityAPI.getResults();
      setResults(data.data);
    } catch (err) {
      showToast('Failed to load eligibility records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runRecheck = async () => {
    setLoading(true);
    try {
      const { data } = await eligibilityAPI.check();
      showToast(data.message || 'Eligibility check refreshed!', 'success');
      await loadResults();
    } catch (err) {
      showToast(err.response?.data?.message || 'Please complete your profile before checking eligibility', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-4 md:p-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <EmptyState
          icon="🔍"
          title="No Results Checked Yet"
          description="Launch our welfare rule matching engine to discover scholarships matching your current profile."
          action={
            <button className="btn btn-primary px-6 py-2.5 rounded-xl font-bold" onClick={() => navigate('/eligibility')}>
              Launch Eligibility Check →
            </button>
          }
        />
      </div>
    );
  }

  // Map scheme details + result matching indicators
  const allSchemes = results.results?.map(r => {
    if (!r.scheme) return null;
    const deadlineObj = getDeadlineStatus(r.scheme);
    return {
      ...r.scheme,
      eligible: r.eligible,
      matchScore: r.matchScore,
      matchedCriteria: r.matchedCriteria || [],
      missingCriteria: r.missingCriteria || [],
      missingDocuments: r.missingDocuments || [],
      rejectionReasons: r.rejectionReasons || [],
      suggestions: r.suggestions || [],
      isClosingSoon: deadlineObj.isApproaching || deadlineObj.isUrgent
    };
  }).filter(Boolean) || [];

  // Summary Metrics
  const totalMatchesCount = allSchemes.length;
  const eligibleCount = allSchemes.filter(s => s.eligible).length;
  const strongMatchesCount = allSchemes.filter(s => s.matchScore >= 80).length;
  const closingSoonCount = allSchemes.filter(s => s.isClosingSoon).length;

  // Filter Pipeline
  const filteredSchemes = allSchemes
    .filter(s => {
      // Quick Tabs Filter
      if (activeTab === 'eligible' && !s.eligible) return false;
      if (activeTab === 'strong' && s.matchScore < 80) return false;
      if (activeTab === 'closing' && !s.isClosingSoon) return false;
      if (activeTab === 'govt' && (s.category === 'Private' || (s.tags && s.tags.includes('private')))) return false;
      if (activeTab === 'private' && s.category !== 'Private' && !(s.tags && s.tags.includes('private'))) return false;

      // Category Dropdown
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;

      // Education Dropdown
      if (educationFilter !== 'all') {
        const edus = s.eligibilityCriteria?.educationLevels || [];
        if (!edus.includes(educationFilter) && !edus.includes('All')) return false;
      }

      // Gender Dropdown
      if (genderFilter !== 'all') {
        const genders = s.eligibilityCriteria?.genders || [];
        if (!genders.includes(genderFilter) && !genders.includes('All')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const descMatch = (s.description || '').toLowerCase().includes(q);
        const catMatch = (s.category || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      
      {/* ── 1. HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Scholarship Results</h1>
          <p className="text-xs text-slate-400 mt-1">Scholarships matched to your profile based on eligibility criteria.</p>
        </div>
        <button 
          className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 rounded-xl font-bold shadow-md"
          onClick={runRecheck}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Check Eligibility
        </button>
      </div>

      {/* ── 2. SUMMARY METRICS ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center">
          <p className="text-xl font-black text-blue-400 font-mono">{totalMatchesCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Matches</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center">
          <p className="text-xl font-black text-emerald-400 font-mono">{eligibleCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Eligible</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center">
          <p className="text-xl font-black text-purple-400 font-mono">{strongMatchesCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Strong Matches</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center">
          <p className="text-xl font-black text-amber-400 font-mono">{closingSoonCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Closing Soon</p>
        </div>
      </div>

      {/* ── 3. SEARCH & FILTER CONTROLS ──────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        
        {/* Search Bar + Quick Pills */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {FILTER_TAGS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Minority">Minority</option>
            </select>
          </div>

          {/* Education Level Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Education Level</label>
            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Education Levels</option>
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="Diploma">Diploma</option>
              <option value="Graduation">Graduation</option>
              <option value="Post Graduation">Post Graduation</option>
            </select>
          </div>

          {/* Gender Dropdown */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

        </div>

      </div>

      {/* ── 4. SCHOLARSHIP CARDS GRID ────────────────────────── */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="text-4xl">🔎</div>
          <h3 className="text-lg font-bold text-white">No scholarships found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try changing your filters or completing your profile to discover more opportunities.
          </p>
          <button 
            className="btn btn-primary px-5 py-2 rounded-xl text-xs font-bold"
            onClick={() => navigate('/profile')}
          >
            Complete Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map(s => (
            <SchemeCard
              key={s._id}
              scheme={s}
              showEligibility
              onViewDetails={(scheme) => setSelectedScheme(scheme)}
            />
          ))}
        </div>
      )}

      {/* ── 5. CLEAN CENTERED SCHOLARSHIP DETAILS MODAL ──────── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          
          {/* Subtle Dark Overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" 
            onClick={() => setSelectedScheme(null)} 
          />

          {/* Centered Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-10 text-xs animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                  {selectedScheme.ministry || 'Ministry of Education'}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug mt-0.5">
                  {selectedScheme.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
              
              {/* Match Score & Benefit Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Match Score</span>
                  <div className="text-lg font-black text-emerald-400 font-mono">{selectedScheme.matchScore}% Match</div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedScheme.matchScore >= 80 ? 'Strong Profile Match' : 'Moderate Match'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scholarship Amount</span>
                  <div className="text-lg font-black text-white font-mono">{selectedScheme.amount}</div>
                  <span className="text-[10px] text-slate-500 font-medium">{selectedScheme.frequency || 'Yearly Benefit'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Application Deadline</span>
                  <div className="text-sm font-bold text-white mt-0.5">{formatDate(selectedScheme)}</div>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${getDeadlineStatus(selectedScheme).badgeClass}`}>
                    {getDeadlineStatus(selectedScheme).label}
                  </span>
                </div>
              </div>

              {/* About Scholarship */}
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">About the Scholarship</h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedScheme.description || selectedScheme.shortDescription}
                </p>
              </div>

              {/* Eligibility Criteria Audit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Eligibility Criteria Checklist
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
                  {selectedScheme.matchedCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-400 font-medium text-xs">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                      <span>{c}</span>
                    </div>
                  ))}
                  {selectedScheme.missingCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-400 font-medium text-xs">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              {selectedScheme.requiredDocuments && selectedScheme.requiredDocuments.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Required Documents</h4>
                  <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-1.5">
                    {selectedScheme.requiredDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Requirements Alert */}
              {selectedScheme.missingDocuments && selectedScheme.missingDocuments.length > 0 && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Missing Profile Documents ({selectedScheme.missingDocuments.length})
                  </div>
                  <ul className="list-disc pl-5 text-amber-400 text-xs space-y-0.5">
                    {selectedScheme.missingDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Modal Sticky Footer Action Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex gap-3 items-center">
              <button 
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="btn btn-ghost px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
              
              <button
                type="button"
                onClick={(e) => handleApplyOfficialPortal(selectedScheme, e)}
                disabled={isExpired(selectedScheme)}
                className={`btn btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg rounded-xl ${isExpired(selectedScheme) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isExpired(selectedScheme) ? 'Application Closed' : 'Apply on Official Portal'} <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
