import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, Eye, CheckCircle2, AlertTriangle, XCircle, Clock, Filter, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import StudentIdBadge from '../components/ui/StudentIdBadge.jsx';
import toast from 'react-hot-toast';

const STAGES = [
  'submission',
  'document_verification',
  'eligibility_verification',
  'institute_verification',
  'provider_review',
  'final_approval',
  'disbursement'
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Stage update modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: 'Approved',
    rejectedAtStage: 'document_verification',
    rejectionReason: '',
    affectedDocument: 'Income Certificate',
    isCorrectable: true,
    suggestedAction: 'Upload a current Income Certificate.',
    remarks: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getApplications();
      setApplications(res.data?.applications || []);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (app, defaultStatus = 'Approved') => {
    setSelectedApp(app);
    setUpdateForm({
      status: defaultStatus,
      rejectedAtStage: app.rejectedAtStage || 'document_verification',
      rejectionReason: app.rejectionReason || '',
      affectedDocument: app.affectedDocument || 'Income Certificate',
      isCorrectable: app.isCorrectable !== undefined ? app.isCorrectable : true,
      suggestedAction: app.suggestedAction || 'Upload a current valid document.',
      remarks: ''
    });
  };

  const handleSaveStage = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (updateForm.status === 'Rejected' && (!updateForm.rejectionReason || updateForm.rejectionReason.trim() === '')) {
      toast.error('Rejection reason is mandatory.');
      return;
    }

    try {
      await adminAPI.updateApplicationStage(selectedApp._id, updateForm);
      toast.success(`✓ Application updated to ${updateForm.status}`);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const filteredApps = applications.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch = (a.user?.name || '').toLowerCase().includes(q) || 
                          (a.scheme?.name || '').toLowerCase().includes(q) ||
                          (a.user?.studentId || '').toLowerCase().includes(q) ||
                          (String(a.applicationId || a._id)).toLowerCase().includes(q);
    const matchesStage = stageFilter === 'All' || a.status === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Application Pipeline Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control the 7 sequential application stages, audit status changes, and issue rejection reviews.</p>
        </div>
      </div>

      {/* Controls: Search & Stage Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Student ID, App ID, student or scheme..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs px-3 py-2 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Correction Submitted">Correction Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">App ID & Date</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Target Scholarship</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredApps.map(app => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <StudentIdBadge studentId={app.user?.studentId || 'USS-STU-2026-000001'} size="sm" />
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-purple-400">APP-2026-{String(app.applicationId || app._id).slice(-6).toUpperCase()}</div>
                      <span className="text-[10px] text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div>{app.user?.name || 'Student'}</div>
                      <span className="text-[10px] font-mono text-slate-400">{app.user?.email || '-'}</span>
                    </td>
                    <td className="p-4 font-bold text-white max-w-xs truncate">
                      {app.scheme?.name || 'Scholarship Scheme'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-mono text-[10px] font-bold capitalize">
                        {(app.rejectedAtStage || 'submission').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        app.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(app, 'Approved')}
                          className="btn btn-ghost px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 font-bold rounded-lg"
                        >
                          Approve ✓
                        </button>
                        <button
                          onClick={() => handleOpenModal(app, 'Rejected')}
                          className="btn btn-ghost px-2 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 font-bold rounded-lg"
                        >
                          Reject ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAGE & REJECTION UPDATE MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">
                ⚙️ Update Application Decision: #USS-{String(selectedApp._id).slice(-6).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Decision Status</label>
                  <select
                    value={updateForm.status}
                    onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Correction Submitted">Correction Submitted</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Target Stage</label>
                  <select
                    value={updateForm.rejectedAtStage}
                    onChange={e => setUpdateForm(p => ({ ...p, rejectedAtStage: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {updateForm.status === 'Rejected' && (
                <div className="space-y-3 p-4 bg-red-950/20 border border-red-900/40 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-4 h-4" /> Rejection Details (Mandatory)
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Rejection Reason *</label>
                    <input
                      type="text"
                      value={updateForm.rejectionReason}
                      onChange={e => setUpdateForm(p => ({ ...p, rejectionReason: e.target.value }))}
                      placeholder="e.g. Income certificate is expired or unreadable."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Affected Document</label>
                      <input
                        type="text"
                        value={updateForm.affectedDocument}
                        onChange={e => setUpdateForm(p => ({ ...p, affectedDocument: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Correctable Status</label>
                      <select
                        value={updateForm.isCorrectable ? 'true' : 'false'}
                        onChange={e => setUpdateForm(p => ({ ...p, isCorrectable: e.target.value === 'true' }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      >
                        <option value="true">🟡 Correctable (Action Required)</option>
                        <option value="false">🔴 Non-Correctable (Ineligible)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Suggested Next Action</label>
                    <input
                      type="text"
                      value={updateForm.suggestedAction}
                      onChange={e => setUpdateForm(p => ({ ...p, suggestedAction: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Admin Remarks / Audit Note</label>
                <textarea
                  rows={2}
                  value={updateForm.remarks}
                  onChange={e => setUpdateForm(p => ({ ...p, remarks: e.target.value }))}
                  placeholder="Internal audit notes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="btn btn-primary px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl">Save Stage Decision →</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
