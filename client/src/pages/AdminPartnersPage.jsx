import { useState } from 'react';
import { Building2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_PARTNERS = [
  { _id: 'p1', name: 'AICTE Director', organization: 'All India Council for Technical Education (AICTE)', email: 'partner@demo.com', status: 'Active', schemesCount: 6 },
  { _id: 'p2', name: 'Mahindra Foundation Trustee', organization: 'Mahindra Education Trust', email: 'scholarships@mahindra.org', status: 'Active', schemesCount: 4 },
  { _id: 'p3', name: 'LIC HFL Coordinator', organization: 'LIC Housing Finance Ltd', email: 'vidyadhan@lichfl.com', status: 'Pending Approval', schemesCount: 2 },
  { _id: 'p4', name: 'Tata Trust Admin', organization: 'Tata Education & Development Trust', email: 'trusts@tata.com', status: 'Active', schemesCount: 8 }
];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState(DEMO_PARTNERS);

  const handleApprove = (id) => {
    setPartners(prev => prev.map(p => p._id === id ? { ...p, status: 'Active' } : p));
    toast.success('✓ Partner organization approved!');
  };

  const handleSuspend = (id) => {
    setPartners(prev => prev.map(p => p._id === id ? { ...p, status: 'Suspended' } : p));
    toast.error('Partner account suspended');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Scholarship Partner Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Authorize partner accounts, approve corporate foundations, and monitor scheme review backlogs.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Organization</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Email</th>
                <th className="p-4">Schemes</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {partners.map(partner => (
                <tr key={partner._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white max-w-xs">{partner.organization}</td>
                  <td className="p-4 text-slate-300">{partner.name}</td>
                  <td className="p-4 font-mono text-slate-400">{partner.email}</td>
                  <td className="p-4 font-mono font-bold text-indigo-400">{partner.schemesCount} active</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      partner.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      partner.status === 'Suspended' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {partner.status !== 'Active' && (
                        <button onClick={() => handleApprove(partner._id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px]">Approve</button>
                      )}
                      {partner.status === 'Active' && (
                        <button onClick={() => handleSuspend(partner._id)} className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px]">Suspend</button>
                      )}
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
