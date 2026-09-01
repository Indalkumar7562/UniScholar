import { useState, useEffect } from 'react';
import { adminAPI, documentAPI } from '../services/api';
import { 
  FileText, CheckCircle2, AlertTriangle, Eye, XCircle, Search, 
  Clock, ExternalLink, ShieldCheck, Check, X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, RefreshCw
} from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const DEFAULT_REQUIRED = ['Aadhaar / ID Proof', 'Income Certificate', '10th Marksheet', '12th Marksheet', 'Domicile Certificate'];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected document for detailed Inspector Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [fileLoadError, setFileLoadError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

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

  const getFullFileUrl = (doc) => {
    if (!doc) return '';
    const token = localStorage.getItem('uss_token');
    
    // Prefer direct authenticated view URL if ObjectId present
    if (doc._id && !doc._id.startsWith('mock')) {
      return `${documentAPI.getViewUrl(doc._id)}`;
    }
    
    // Fallback to static uploads server path
    const pathStr = doc.filePath || doc.fileUrl || '';
    if (!pathStr) return '';
    if (pathStr.startsWith('http')) return pathStr;
    const cleanPath = pathStr.startsWith('/') ? pathStr : `/${pathStr}`;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${cleanPath}`;
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

  const isPdf = (doc) => {
    if (!doc) return false;
    const name = (doc.name || doc.originalName || doc.filePath || '').toLowerCase();
    const mime = (doc.mimeType || '').toLowerCase();
    return mime.includes('pdf') || name.endsWith('.pdf');
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
          <p className="text-xs text-slate-400 mt-0.5">Inspect actual student credential files before approval. Approving all required documents automatically advances applications to Eligibility Verification.</p>
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
                  <th className="p-4">Version</th>
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
                    <td className="p-4 font-mono font-bold text-purple-400">v{doc.version || 1}</td>
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
                          onClick={() => { setSelectedDoc(doc); setFileLoadError(false); setZoomLevel(100); setRotation(0); }}
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

      {/* DETAILED REAL DOCUMENT PREVIEW INSPECTOR MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[95vh] overflow-y-auto">
            
            {/* Inspector Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Real Document Inspector: {selectedDoc.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Uploaded by {selectedDoc.user?.name || 'Student'} ({selectedDoc.user?.email || 'N/A'}) • Version {selectedDoc.version || 1}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Controls & Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Controls:</span>
                <button 
                  onClick={() => setZoomLevel(p => Math.min(p + 25, 200))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" /> +
                </button>
                <button 
                  onClick={() => setZoomLevel(p => Math.max(p - 25, 50))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" /> -
                </button>
                <button 
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate
                </button>
                <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 bg-slate-900 rounded-md">
                  {zoomLevel}% | {rotation}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getFullFileUrl(selectedDoc)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold rounded-xl flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab ↗
                </a>
                <a
                  href={documentAPI.getDownloadUrl(selectedDoc._id)}
                  download={selectedDoc.originalName || selectedDoc.name}
                  className="btn btn-ghost px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" /> Download Document 📥
                </a>
              </div>
            </div>

            {/* ── REAL UPLOADED FILE PREVIEW CANVAS ───────────────────────── */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 min-h-[400px] flex items-center justify-center relative overflow-auto">
              
              {fileLoadError ? (
                /* Fallback for Broken or Unavailable File */
                <div className="text-center space-y-3 py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-800/50 flex items-center justify-center mx-auto text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">⚠ Document Unavailable</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Unable to load the uploaded file from server storage ({selectedDoc.originalName || selectedDoc.name}).
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button 
                      onClick={() => setFileLoadError(false)} 
                      className="btn btn-ghost px-3 py-1.5 text-xs text-blue-400 flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
                    </button>
                    <button 
                      onClick={() => { setRejectModalDoc(selectedDoc); setRejectionReason('File unreadable or unavailable on server.'); }}
                      className="btn px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl"
                    >
                      Request Re-upload →
                    </button>
                  </div>
                </div>
              ) : isPdf(selectedDoc) ? (
                /* Embedded PDF Viewer */
                <iframe
                  src={getFullFileUrl(selectedDoc)}
                  title={selectedDoc.name}
                  onError={() => setFileLoadError(true)}
                  className="w-full h-[460px] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                /* Scalable Image Previewer */
                <div className="overflow-auto max-h-[480px] w-full flex items-center justify-center p-2">
                  <img
                    src={getFullFileUrl(selectedDoc)}
                    alt={selectedDoc.name}
                    onError={() => setFileLoadError(true)}
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    className="max-h-[440px] w-auto object-contain rounded-xl shadow-2xl"
                  />
                </div>
              )}

            </div>

            {/* Document Version History & Portfolio Audit */}
            {selectedDoc.versionHistory && selectedDoc.versionHistory.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider block">📜 Document Version History</span>
                <div className="space-y-1 text-xs font-mono">
                  {selectedDoc.versionHistory.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-400 bg-slate-900 p-2 rounded-lg">
                      <span>Version {v.version || i + 1} ({new Date(v.uploadedAt).toLocaleDateString()})</span>
                      <span className={`font-bold ${v.status === 'Verified' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {v.status} {v.rejectionReason ? `• ${v.rejectionReason}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Decision Action Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">
                Decision will automatically re-evaluate application stage progression.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selectedDoc)}
                  className="btn btn-primary px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Approve Document ✓
                </button>
                <button
                  onClick={() => { setRejectModalDoc(selectedDoc); setRejectionReason(''); }}
                  className="btn px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg"
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
                <button type="submit" className="btn btn-primary px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">Confirm Rejection & Request Re-upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
