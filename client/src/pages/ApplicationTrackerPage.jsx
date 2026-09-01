import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import SchemeCard, { handleOfficialWebsite } from '../components/dashboard/SchemeCard.jsx';
import { SectionHeader, ProgressBar, EmptyState, Spinner } from '../components/ui/index.jsx';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../utils/deadline.utils';
import { 
  FileCheck2, Clock, CheckCircle2, AlertCircle, XCircle, ExternalLink, Trash2, Send,
  AlertTriangle, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Upload, FileText, Check
} from 'lucide-react';
import { showToast } from '../utils/toastQueue';

const STAGES = [
  { id: 'submission',               label: 'Application Submission' },
  { id: 'document_verification',    label: 'Document Verification' },
  { id: 'eligibility_verification', label: 'Eligibility Verification' },
  { id: 'institute_verification',   label: 'Institute Verification' },
  { id: 'provider_review',          label: 'Provider Review' },
  { id: 'final_approval',           label: 'Final Approval' },
  { id: 'disbursement',             label: 'Disbursement' }
];

const STAGE_LABELS = {
  submission:               'Application Submission',
  document_verification:    'Document Verification',
  eligibility_verification: 'Eligibility Verification',
  institute_verification:   'Institute Verification',
  provider_review:          'Scholarship Provider Review',
  final_approval:           'Final Approval',
  disbursement:             'Scholarship Disbursement'
};

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'rejected', label: '❌ Action Needed / Rejected' },
  { id: 'correctionSubmitted', label: '🟡 Correction Submitted' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'underReview', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
];

export default function ApplicationTrackerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  
  // Selected Application for Details/Tracker Modal
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Fix Issue / Resolution Modal State
  const [fixModalApp, setFixModalApp] = useState(null);
  const [fixActionNote, setFixActionNote] = useState('');
  const [submittingFix, setSubmittingFix] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationAPI.getAll();
      setApplications(data.applications || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      showToast('Failed to load tracked applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await applicationAPI.delete(id);
      showToast('Application withdrawn successfully', 'info');
      await fetchApplications();
      if (selectedApp && selectedApp._id === id) setSelectedApp(null);
    } catch (err) {
      showToast('Failed to withdraw application', 'error');
    }
  };

  const handleResolveRejectionSubmit = async (e) => {
    e.preventDefault();
    if (!fixModalApp) return;

    setSubmittingFix(true);
    try {
      const { data } = await applicationAPI.resolveRejection(fixModalApp._id, {
        actionNote: fixActionNote.trim() || 'Uploaded corrected information and updated documents',
        updatedDocumentName: fixModalApp.affectedDocument || 'Document'
      });

      showToast(data.message || '✓ Correction submitted. Re-verification in progress!', 'success');
      setFixModalApp(null);
      setFixActionNote('');
      await fetchApplications();
      
      if (selectedApp && selectedApp._id === fixModalApp._id) {
        setSelectedApp(data.application);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit correction', 'error');
    } finally {
      setSubmittingFix(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rejected') return app.status === 'Rejected';
    if (activeTab === 'correctionSubmitted') return app.status === 'Correction Submitted';
    if (activeTab === 'submitted') return app.status === 'Submitted';
    if (activeTab === 'underReview') return app.status === 'Under Review';
    if (activeTab === 'approved') return app.status === 'Approved';
    return true;
  });

  // Calculate Stage Index helper for timeline rendering
  const getStageIndex = (stageKey) => {
    return STAGES.findIndex(s => s.id === stageKey);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      
      {/* ── 1. HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track stage-wise progress, audit logs, rejection details, and submit corrections.
          </p>
        </div>
        <button 
          className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 rounded-xl font-bold"
          onClick={() => navigate('/results')}
        >
          Explore More Scholarships →
        </button>
      </div>

      {/* ── 2. FILTER TABS ───────────────────────────────────── */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto scrollbar-hide pb-1 text-xs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-t-xl ${
              activeTab === tab.id
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {tab.label}
            {statusCounts[tab.id] !== undefined && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300">
                {statusCounts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── 3. CONTENT GRID ──────────────────────────────────── */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner className="w-8 h-8 text-blue-500" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No applications found"
          description="Start tracking your scholarship applications from the My Results or Schemes page."
          action={
            <button className="btn btn-primary px-5 py-2.5 text-xs font-bold rounded-xl" onClick={() => navigate('/results')}>
              Browse Scholarship Results
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredApplications.map((app) => {
            const scheme = app.scheme || {};
            const isRejected = app.status === 'Rejected';
            const isCorrectionSubmitted = app.status === 'Correction Submitted';
            const isApproved = app.status === 'Approved';
            const deadlineStatus = getDeadlineStatus(scheme);

            return (
              <div
                key={app._id}
                className={`card p-5 space-y-4 flex flex-col justify-between relative overflow-hidden rounded-2xl border transition-all ${
                  isRejected 
                    ? 'bg-red-950/20 border-red-900/40' 
                    : isCorrectionSubmitted
                    ? 'bg-amber-950/20 border-amber-900/40'
                    : isApproved
                    ? 'bg-emerald-950/20 border-emerald-900/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    {isRejected ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> 
                        Rejected at {STAGE_LABELS[app.rejectedAtStage] || 'Verification'}
                      </span>
                    ) : isCorrectionSubmitted ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        Correction Submitted (Re-verification in progress)
                      </span>
                    ) : isApproved ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        Approved — Disbursed
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        {app.status || 'Application Submitted'}
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${deadlineStatus.badgeClass}`}>
                      {deadlineStatus.label}
                    </span>
                  </div>

                  {/* Title & Ministry */}
                  <h3 className="font-bold text-base text-white line-clamp-2">
                    {scheme.name || 'Scholarship Program'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{scheme.ministry || 'Ministry of Education'}</p>

                  {/* Rejection Alert Box */}
                  {isRejected && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-red-900/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-red-400">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Rejection Reason:
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {app.rejectedAt ? new Date(app.rejectedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {app.rejectionReason}
                      </p>
                      
                      {app.affectedDocument && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Affected: <span className="text-white font-bold">{app.affectedDocument}</span>
                        </p>
                      )}

                      {/* Correctable Badge */}
                      <div className="pt-1 flex items-center justify-between">
                        {app.isCorrectable !== false ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🟡 Action Required — Issue can be corrected
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            🔴 Not Eligible — Criteria limit exceeded
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Readiness Progress Bar */}
                  {!isRejected && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-400">Application Readiness</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {app.readinessScore || 80}%
                        </span>
                      </div>
                      <ProgressBar
                        value={app.readinessScore || 80}
                        color={(app.readinessScore || 80) >= 80 ? 'success' : 'warning'}
                      />
                    </div>
                  )}

                  {/* Applied & Benefit Summary */}
                  <div className="mt-3 text-xs space-y-1 text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Benefit Amount:</span>
                      <span className="font-bold text-emerald-400">{scheme.amount || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applied Date:</span>
                      <span className="font-bold text-slate-200">
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Not submitted yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 items-center flex-wrap">
                    
                    {/* View Details / Timeline Modal Button */}
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="btn btn-ghost text-xs px-3 py-1.5 font-bold text-slate-300 hover:text-white border border-slate-700 bg-slate-800/80 rounded-xl"
                    >
                      Track & Timeline →
                    </button>

                    {/* Action Button: Fix Issue or Find Scholarships */}
                    {isRejected && app.isCorrectable !== false && (
                      <button
                        onClick={() => {
                          setFixModalApp(app);
                          setFixActionNote('');
                        }}
                        className="btn btn-primary text-xs px-3 py-1.5 font-bold flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Fix Issue
                      </button>
                    )}

                    {isRejected && app.isCorrectable === false && (
                      <button
                        onClick={() => navigate('/results')}
                        className="btn btn-primary text-xs px-3 py-1.5 font-bold flex items-center gap-1 rounded-xl shadow"
                      >
                        Find Other Scholarships
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleWithdraw(app._id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                    title="Withdraw application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. DETAILED TRACKER & TIMELINE MODAL ────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" 
            onClick={() => setSelectedApp(null)} 
          />

          <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-10 text-xs">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/80 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                  Application Timeline Audit
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug mt-0.5">
                  {selectedApp.scheme?.name || 'Scholarship Application'}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
              
              {/* STAGE-WISE TIMELINE VISUALIZER */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Stage-Wise Progress Journey</h4>
                
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  {STAGES.map((stage, idx) => {
                    const rejectedStageIdx = selectedApp.status === 'Rejected' ? getStageIndex(selectedApp.rejectedAtStage || 'document_verification') : -1;
                    const isCurrentStageRejected = selectedApp.status === 'Rejected' && rejectedStageIdx === idx;
                    const isPassed = selectedApp.status === 'Approved' || (rejectedStageIdx !== -1 ? idx < rejectedStageIdx : idx === 0);
                    const isNotReached = rejectedStageIdx !== -1 && idx > rejectedStageIdx;
                    const isPending = selectedApp.status !== 'Approved' && !isPassed && !isCurrentStageRejected;

                    return (
                      <div key={stage.id} className="flex items-start gap-3 relative">
                        {/* Connecting Line */}
                        {idx < STAGES.length - 1 && (
                          <div className={`absolute left-[13px] top-6 bottom-0 w-0.5 ${
                            isPassed ? 'bg-emerald-500' : 'bg-slate-800'
                          }`} />
                        )}

                        {/* Stage Node Icon */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                          isPassed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' 
                            : isCurrentStageRejected 
                            ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {isPassed ? '✓' : isCurrentStageRejected ? '✕' : idx + 1}
                        </div>

                        {/* Stage Info */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-xs ${
                              isPassed ? 'text-emerald-400' : isCurrentStageRejected ? 'text-red-400' : 'text-slate-400'
                            }`}>
                              {stage.label}
                            </span>
                            
                            {isPassed && <span className="text-[10px] text-emerald-500 font-mono font-bold">✓ Passed</span>}
                            {isCurrentStageRejected && <span className="text-[10px] text-red-400 font-mono font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800">❌ REJECTED</span>}
                            {isNotReached && <span className="text-[10px] text-slate-600 font-mono">○ Not Reached</span>}
                            {isPending && <span className="text-[10px] text-blue-400 font-mono">● In Progress</span>}
                          </div>

                          {isCurrentStageRejected && (
                            <p className="text-[11px] text-red-300 mt-1 font-medium bg-red-950/40 p-2 rounded-lg border border-red-900/30">
                              Application stopped at this stage: {selectedApp.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REJECTION DETAILS PANEL (IF REJECTED) */}
              {selectedApp.status === 'Rejected' && (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
                    <h4 className="font-extrabold text-sm text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      Stage Rejection Audit Details
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Rejected on: {selectedApp.rejectedAt ? new Date(selectedApp.rejectedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rejected Stage</span>
                      <p className="font-bold text-white mt-0.5">{STAGE_LABELS[selectedApp.rejectedAtStage] || 'Verification'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Affected Item / Document</span>
                      <p className="font-bold text-amber-300 mt-0.5">{selectedApp.affectedDocument || 'Profile Criteria'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Exact Reason</span>
                    <p className="text-xs text-slate-200 mt-0.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed font-mono">
                      {selectedApp.rejectionReason}
                    </p>
                  </div>

                  {/* AI-ASSISTED PLAIN LANGUAGE EXPLANATION */}
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
                    <h5 className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Why did this happen?
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {selectedApp.rejectedAtStage === 'document_verification' 
                        ? `The verification engine flagged your "${selectedApp.affectedDocument || 'Document'}" because its data or validity date did not match profile requirements.`
                        : selectedApp.rejectedAtStage === 'eligibility_verification'
                        ? `Your profile financial/academic parameters exceed the hard scheme limits configured for this scholarship.`
                        : `Your enrollment or verification details could not be validated by the authority.`}
                    </p>
                  </div>

                  {/* Actionable Advice */}
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
                    <h5 className="font-bold text-emerald-400 text-xs">Recommended Action:</h5>
                    <p className="text-[11px] text-slate-300">
                      {selectedApp.suggestedAction || 'Review your submitted information and upload updated documents.'}
                    </p>
                  </div>
                </div>
              )}

              {/* REJECTION HISTORY AUDIT LOG */}
              {selectedApp.rejectionHistory && selectedApp.rejectionHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Application Audit Trail</h4>
                  
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 font-mono text-[11px]">
                    {selectedApp.rejectionHistory.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-slate-200">{item.actionTaken || item.stage}</span>
                          <p className="text-[10px] text-slate-400">{item.reason}</p>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {item.date ? new Date(item.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center gap-3">
              <button 
                onClick={() => setSelectedApp(null)}
                className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>

              {selectedApp.status === 'Rejected' && selectedApp.isCorrectable !== false && (
                <button
                  onClick={() => {
                    setFixModalApp(selectedApp);
                    setSelectedApp(null);
                    setFixActionNote('');
                  }}
                  className="btn btn-primary px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow"
                >
                  Fix Issue & Re-submit →
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── 5. RE-APPLICATION / FIX ISSUE MODAL ────────────────── */}
      {fixModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" 
            onClick={() => setFixModalApp(null)} 
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 z-10 text-xs space-y-5 animate-scale-in">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Correction & Re-submission</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{fixModalApp.scheme?.name}</h3>
              </div>
              <button onClick={() => setFixModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1">
              <div className="font-bold text-amber-300">Affected Item: {fixModalApp.affectedDocument || 'Document'}</div>
              <p className="text-[11px] text-slate-300">{fixModalApp.rejectionReason}</p>
            </div>

            <form onSubmit={handleResolveRejectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Describe Correction / Notes for Re-verification:
                </label>
                <textarea
                  rows={3}
                  value={fixActionNote}
                  onChange={(e) => setFixActionNote(e.target.value)}
                  placeholder="e.g., Uploaded updated valid Income Certificate issued for FY 2026-27."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFixModalApp(null)}
                  className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFix}
                  className="btn btn-primary px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow flex items-center gap-2"
                >
                  {submittingFix ? <Spinner className="w-4 h-4" /> : 'Submit Correction →'}
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}
