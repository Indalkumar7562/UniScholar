import { useState } from 'react';
import { FileText, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_PARTNER_DOCS = [
  { _id: 'pd1', student: 'Priya Sharma', docName: 'Income Certificate', status: 'Verified', date: '2026-08-20' },
  { _id: 'pd2', student: 'Rahul Verma', docName: '10th Marksheet', status: 'Under Review', date: '2026-08-25' },
  { _id: 'pd3', student: 'Karan Patel', docName: 'Domicile Certificate', status: 'Rejected', date: '2026-08-28', reason: 'Unclear document scan' }
];

export default function PartnerDocumentsPage() {
  const [docs, setDocs] = useState(DEMO_PARTNER_DOCS);

  const handleVerify = (id) => {
    setDocs(prev => prev.map(d => d._id === id ? { ...d, status: 'Verified' } : d));
    toast.success('✓ Document verified!');
  };

  const handleReject = (id) => {
    setDocs(prev => prev.map(d => d._id === id ? { ...d, status: 'Rejected', reason: 'Document requirement invalid' } : d));
    toast.error('Document rejected');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Document Review</h1>
          <p className="text-xs text-purple-400 font-bold mt-0.5">Audit credential documents uploaded for your organization's scholarship schemes.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Document</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4">Review Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {docs.map(doc => (
                <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{doc.student}</td>
                  <td className="p-4 font-bold text-purple-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" /> {doc.docName}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{doc.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      doc.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleVerify(doc._id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px]">✓ Verify</button>
                      <button onClick={() => handleReject(doc._id)} className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px]">✕ Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
