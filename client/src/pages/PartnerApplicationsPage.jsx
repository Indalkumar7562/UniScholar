import { useState, useEffect } from 'react';
import { applicationAPI } from '../services/api';
import { STAGES, STAGE_LABELS, calculateTrackerState } from './ApplicationTrackerPage';
import { Search, Eye, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, FileText, Clock } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function PartnerApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  
  // Rejection / Action Modal State
  const [modalApp, setModalApp] = useState(null);
  const [actionType, setActionType] = useState('Approve'); // 'Approve', 'Reject', 'Request Correction'
  const [rejectStage, setRejectStage] = useState('provider_review');
  const [rejectionReason, setRejectionReason] = useState('');
  const [affectedDocument, setAffectedDocument] = useState('');
  const [isCorrectable, setIsCorrectable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationAPI.getAll();
      setApplications(data.applications || []);
    } catch (err) {
      toast.error('Failed to load partner applications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (app, initialAction) => {
    setModalApp(app);
    setActionType(initialAction);
    setRejectStage('provider_review');
    setRejectionReason('');
    setAffectedDocument('');
    setIsCorrectable(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!modalApp) return;

    if (actionType === 'Reject' && !rejectionReason.trim()) {
      toast.error('A non-blank rejection reason is strictly required before issuing rejection.');
      return;
    }

    setSubmitting(true);
    try {
      let status = 'Approved';
      if (actionType === 'Reject') status = 'Rejected';
      if (actionType === 'Request Correction') status = 'Correction Submitted';

      const payload = {
        status,
        rejectedAtStage: rejectStage,
        rejectionReason: actionType === 'Reject' ? rejectionReason.trim() : '',
        affectedDocument: actionType === 'Reject' ? (affectedDocument.trim() || 'Required Information') : '',
        isCorrectable: actionType === 'Reject' ? isCorrectable : true,
        notes: `Partner decision: ${actionType} at stage ${STAGE_LABELS[rejectStage]}`
      };

      await applicationAPI.updateStatus(modalApp._id, payload);
      toast.success(`✓ Application decision logged: ${actionType}`);
      setModalApp(null);
      await fetchApplications();
    } catch (err) {
      toast.error('Failed to process partner application decision');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    (app.scheme?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    app.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Application Verification</h1>
          <p className="text-xs text-purple-400 font-bold mt-0.5">Review student credentials, audit eligibility criteria, and render stage decisions.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-purple-500" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Application ID</th>
                  <th className="p-4">Scholarship Scheme</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Active Stage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredApplications.map(app => {
                  const tracker = calculateTrackerState(app);

                  return (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-400">USS-{app._id.slice(-6).toUpperCase()}</td>
                      <td className="p-4 font-bold text-white max-w-xs">{app.scheme?.name || 'Scholarship'}</td>
                      <td className="p-4 font-mono text-slate-400">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-200">{STAGE_LABELS[app.rejectedAtStage] || tracker.currentStageObj?.label || 'Provider Review'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          app.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenActionModal(app, 'Approve')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(app, 'Reject')}
                            className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {modalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setModalApp(null)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl z-10 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Partner Application Review</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{modalApp.scheme?.name}</h3>
              </div>
              <button onClick={() => setModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Decision Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('Approve')}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      actionType === 'Approve' ? 'bg-emerald-600 text-white border-emerald-500 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✓ Approve Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('Reject')}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      actionType === 'Reject' ? 'bg-red-600 text-white border-red-500 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✕ Reject Application
                  </button>
                </div>
              </div>

              {actionType === 'Reject' && (
                <div className="space-y-3 p-3.5 bg-red-950/30 border border-red-900/40 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-red-300 mb-1">Stage Where Rejection Occurs:</label>
                    <select
                      value={rejectStage}
                      onChange={e => setRejectStage(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                    >
                      {STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-red-300 mb-1">Mandatory Rejection Reason:</label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="e.g., Supporting income certificate credentials could not be verified by committee audit."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Affected Item / Document:</label>
                    <input
                      type="text"
                      value={affectedDocument}
                      onChange={e => setAffectedDocument(e.target.value)}
                      placeholder="e.g., Annual Family Income Certificate"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pIsCorr"
                      checked={isCorrectable}
                      onChange={e => setIsCorrectable(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="pIsCorr" className="text-xs font-bold text-amber-300">Allow student correction resubmission</label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalApp(null)} className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow">
                  {submitting ? <Spinner className="w-4 h-4" /> : 'Log Decision →'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
