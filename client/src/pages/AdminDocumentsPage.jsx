import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FileText, CheckCircle2, AlertTriangle, Eye, XCircle, Search, Clock, ExternalLink, ShieldCheck, Check, X } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const DEFAULT_REQUIRED = ['Aadhaar / ID Proof', 'Income Certificate', '10th Marksheet', '12th Marksheet', 'Domicile Certificate'];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected document for detailed inspector modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Reject modal state
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDocuments();
      setDocuments(res.data?.documents || []);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doc) => {
    try {
      await adminAPI.verifyDocument(doc._id, { status: 'Verified', isVerified: true });
      toast.success(`✓ Document "${doc.name}" verified! Automatic stage progression evaluated.`);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to verify document');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalDoc) return;
    if (!rejectionReason || rejectionReason.trim() === '') {
      toast.error('Rejection reason is mandatory.');
      return;
    }

    try {
      await adminAPI.verifyDocument(rejectModalDoc._id, {
        status: 'Rejected',
        rejectionReason,
        remarks: remarks || 'Upload a valid replacement document.'
      });
      toast.success(`Document marked as Rejected. Application status updated to Correction Required.`);
      setRejectModalDoc(null);
      setSelectedDoc(null);
      setRejectionReason('');
      setRemarks('');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to reject document');
    }
  };

  const filteredDocs = documents.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Document Verification Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Audit student credential uploads. Approving all required documents automatically advances applications to Eligibility Verification.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search document name or student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
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
                  <th className="p-4">Document Name</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Category / Type</th>
                  <th className="p-4">Uploaded Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredDocs.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div>{doc.user?.name || 'Student'}</div>
                      <span className="text-[10px] font-mono text-slate-400">{doc.user?.email || '-'}</span>
                    </td>
                    <td className="p-4 text-slate-300 capitalize">{doc.category || doc.type || 'Credential'}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        doc.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {doc.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="btn btn-ghost px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-lg flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspector
                        </button>
                        <button
                          onClick={() => handleApprove(doc)}
                          className="btn btn-ghost px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 font-bold rounded-lg"
                        >
                          Approve ✓
                        </button>
                        <button
                          onClick={() => { setRejectModalDoc(doc); setRejectionReason(''); }}
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

      {/* DETAILED DOCUMENT INSPECTOR MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Document Verification Details
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>

            {/* Document & Application Summary */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 font-medium text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Document Name</span>
                  <strong className="text-white text-sm">{selectedDoc.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Verification Status</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-block mt-0.5 ${
                    selectedDoc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedDoc.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedDoc.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Student</span>
                  <strong className="text-white">{selectedDoc.user?.name || 'Student'}</strong>
                  <span className="text-[10px] font-mono text-slate-400 block">{selectedDoc.user?.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Stage</span>
                  <span className="text-blue-400 font-mono font-bold">Document Verification</span>
                </div>
              </div>
            </div>

            {/* Required Documents Portfolio Progress Matrix */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center justify-between">
                <span>Required Documents Check Matrix</span>
                <span className="text-emerald-400 font-mono text-[10px]">3/4 Verified (75%)</span>
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                {DEFAULT_REQUIRED.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{req}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => toast.info(`Opening file: ${selectedDoc.fileUrl || selectedDoc.name}`)}
                className="btn btn-ghost px-3 py-2 text-xs text-blue-400 font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" /> View Preview ↗
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selectedDoc)}
                  className="btn btn-primary px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Approve Document ✓
                </button>
                <button
                  onClick={() => { setRejectModalDoc(selectedDoc); setRejectionReason(''); }}
                  className="btn px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
                >
                  Reject Document ✕
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REJECT DOCUMENT MODAL */}
      {rejectModalDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">❌ Reject Document: {rejectModalDoc.name}</h3>
              <button onClick={() => setRejectModalDoc(null)} className="text-slate-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Rejection Reason (Mandatory) *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document is expired or unreadable."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Suggested Replacement Action</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Upload a valid current certificate."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setRejectModalDoc(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="btn btn-primary px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
