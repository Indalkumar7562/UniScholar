import { useState, useEffect } from 'react';
import { applicationAPI } from '../services/api';
import { STAGES, STAGE_LABELS, calculateTrackerState } from './ApplicationTrackerPage';
import { Search, Eye, RefreshCw, XCircle, CheckCircle2, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Update Status Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateStage, setUpdateStage] = useState('document_verification');
  const [updateAction, setUpdateAction] = useState('Passed');
  const [rejectionReason, setRejectionReason] = useState('');
  const [affectedDocument, setAffectedDocument] = useState('');
  const [isCorrectable, setIsCorrectable] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationAPI.getAll();
      setApplications(data.applications || []);
    } catch (err) {
      toast.error('Failed to load applications list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (app) => {
    setSelectedApp(app);
    setUpdateStage(app.rejectedAtStage || 'document_verification');
    setUpdateAction(app.status === 'Rejected' ? 'Rejected' : 'Passed');
    setRejectionReason(app.rejectionReason || '');
    setAffectedDocument(app.affectedDocument || '');
    setIsCorrectable(app.isCorrectable !== false);
    setRemarks('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (updateAction === 'Rejected' && !rejectionReason.trim()) {
      toast.error('A clear rejection reason is required before confirming rejection.');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        status: updateAction === 'Passed' ? 'Approved' : updateAction === 'Rejected' ? 'Rejected' : 'Under Review',
        rejectedAtStage: updateStage,
        rejectionReason: updateAction === 'Rejected' ? rejectionReason.trim() : '',
        affectedDocument: updateAction === 'Rejected' ? (affectedDocument.trim() || 'Uploaded Document') : '',
        isCorrectable: updateAction === 'Rejected' ? isCorrectable : true,
        notes: remarks || `Admin updated stage ${STAGE_LABELS[updateStage]} to ${updateAction}`
      };

      await applicationAPI.updateStatus(selectedApp._id, payload);
      toast.success(`✓ Application updated for stage ${STAGE_LABELS[updateStage]}`);
      setSelectedApp(null);
      await fetchApplications();
    } catch (err) {
      toast.error('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const schemeName = app.scheme?.name || '';
    const matchesSearch = schemeName.toLowerCase().includes(search.toLowerCase()) ||
                          app.status.toLowerCase().includes(search.toLowerCase());
    
    if (stageFilter === 'all') return matchesSearch;
    if (stageFilter === 'rejected') return matchesSearch && app.status === 'Rejected';
    if (stageFilter === 'approved') return matchesSearch && app.status === 'Approved';
    return matchesSearch && app.rejectedAtStage === stageFilter;
  });

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Application Pipeline Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review, verify, reject, or disburse student scholarship applications.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by scholarship or status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-bold"
        >
          <option value="all">All Stages & Statuses</option>
          <option value="rejected">❌ Rejected Applications</option>
          <option value="approved">✓ Approved Applications</option>
          {STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-blue-500" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Application ID</th>
                  <th className="p-4">Scholarship Scheme</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Current Active Stage</th>
                  <th className="p-4">Overall Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredApplications.map(app => {
                  const tracker = calculateTrackerState(app);
                  const activeStageLabel = STAGE_LABELS[app.rejectedAtStage] || tracker.currentStageObj?.label || 'Document Verification';

                  return (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-400">USS-{app._id.slice(-6).toUpperCase()}</td>
                      <td className="p-4 font-bold text-white max-w-xs">{app.scheme?.name || 'Scholarship Scheme'}</td>
                      <td className="p-4 font-mono text-slate-400">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-200">{activeStageLabel}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          app.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenUpdateModal(app)}
                          className="btn btn-primary text-[11px] py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                        >
                          Update Stage / Verify →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stage Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setSelectedApp(null)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl z-10 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Update Application Stage & Audit</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{selectedApp.scheme?.name}</h3>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Application Stage</label>
                <select
                  value={updateStage}
                  onChange={e => setUpdateStage(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Stage Action Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUpdateAction('Passed')}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      updateAction === 'Passed' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✓ Passed / Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateAction('Rejected')}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      updateAction === 'Rejected' ? 'bg-red-600 text-white border-red-500 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ❌ Rejected
                  </button>
                </div>
              </div>

              {updateAction === 'Rejected' && (
                <div className="space-y-3 p-3.5 bg-red-950/30 border border-red-900/40 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-red-300 mb-1">Exact Rejection Reason (Required):</label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="e.g., Uploaded Income Certificate is expired or illegible."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Affected Item / Document Name:</label>
                    <input
                      type="text"
                      value={affectedDocument}
                      onChange={e => setAffectedDocument(e.target.value)}
                      placeholder="e.g., Income Certificate"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCorr"
                      checked={isCorrectable}
                      onChange={e => setIsCorrectable(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isCorr" className="text-xs font-bold text-amber-300">Issue is correctable by student (allow replacement)</label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Audit Log Remarks (Optional):</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g., Verified by Admin Rahul on 02 Sep 2026."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                <button type="submit" disabled={updating} className="btn btn-primary px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow">
                  {updating ? <Spinner className="w-4 h-4" /> : 'Confirm Update & Record Audit →'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
