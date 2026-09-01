import { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import { FileText, CheckCircle2, XCircle, AlertTriangle, Eye, ShieldCheck, RefreshCw } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const DEMO_DOCUMENTS = [
  { _id: 'd1', studentName: 'Priya Sharma', docName: 'Income Certificate', type: 'Income Proof', status: 'Verified', date: '2026-08-20' },
  { _id: 'd2', studentName: 'Rahul Verma', docName: '10th Marksheet', type: 'Academic Marksheet', status: 'Pending', date: '2026-08-25' },
  { _id: 'd3', studentName: 'Karan Patel', docName: 'Domicile Certificate', type: 'Residence Proof', status: 'Rejected', date: '2026-08-28', rejectionReason: 'Document scan is blurry' },
  { _id: 'd4', studentName: 'Ananya Das', docName: 'Aadhaar Card', type: 'Identity Proof', status: 'Verified', date: '2026-08-15' },
];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState(DEMO_DOCUMENTS);
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleVerify = (id) => {
    setDocuments(prev => prev.map(d => d._id === id ? { ...d, status: 'Verified' } : d));
    toast.success('✓ Document verified successfully!');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setDocuments(prev => prev.map(d => d._id === rejectModalDoc._id ? { ...d, status: 'Rejected', rejectionReason: rejectReason.trim() } : d));
    toast.error(`❌ Document "${rejectModalDoc.docName}" rejected.`);
    setRejectModalDoc(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Document Verification Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Audit student credential uploads, verify validity, or issue rejection requests.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Document Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {documents.map(doc => (
                <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{doc.studentName}</td>
                  <td className="p-4 font-bold text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> {doc.docName}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{doc.type}</td>
                  <td className="p-4 font-mono text-slate-400">{doc.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      doc.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleVerify(doc._id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        ✓ Verify
                      </button>
                      <button
                        onClick={() => { setRejectModalDoc(doc); setRejectReason(''); }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setRejectModalDoc(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl z-10 text-xs">
            <h3 className="text-base font-extrabold text-white">❌ Reject Document: {rejectModalDoc.docName}</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rejection Reason (Required):</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g., The document scan is expired or illegible."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectModalDoc(null)} className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
