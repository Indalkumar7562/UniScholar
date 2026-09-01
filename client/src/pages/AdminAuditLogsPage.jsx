import { useState } from 'react';
import { History, ShieldCheck, User, Lock, Clock } from 'lucide-react';

const DEMO_LOGS = [
  { _id: 'l1', user: 'System Admin Rahul', role: 'admin', action: 'Document Verification Update', target: 'USS-405F21', previousStatus: 'Pending', newStatus: 'Verified', date: '02 Sep 2026', time: '11:32 AM', remarks: 'All credentials verified' },
  { _id: 'l2', user: 'AICTE Partner Officer', role: 'partner', action: 'Stage Rejection Issued', target: 'USS-A0905F', previousStatus: 'Under Review', newStatus: 'Rejected', date: '02 Sep 2026', time: '10:15 AM', remarks: 'Expired Income Certificate' },
  { _id: 'l3', user: 'System Admin Rahul', role: 'admin', action: 'Correction Approved', target: 'USS-A0905F', previousStatus: 'Correction Submitted', newStatus: 'Re-verification Pending', date: '02 Sep 2026', time: '09:00 AM', remarks: 'Updated document attached' },
  { _id: 'l4', user: 'System Admin Rahul', role: 'admin', action: 'Partner Account Approved', target: 'LIC HFL Trust', previousStatus: 'Pending Approval', newStatus: 'Active', date: '01 Sep 2026', time: '04:20 PM', remarks: 'Corporate documents verified' },
];

export default function AdminAuditLogsPage() {
  const [logs] = useState(DEMO_LOGS);

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Audit Trail & Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Immutable recording of all administrative actions, verification decisions, and stage updates.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-sans">Timestamp</th>
                <th className="p-4 font-sans">Actor / Role</th>
                <th className="p-4 font-sans">Action</th>
                <th className="p-4 font-sans">Target ID</th>
                <th className="p-4 font-sans">Status Change</th>
                <th className="p-4 font-sans">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 text-slate-400">
                    <span className="text-white block font-bold">{log.date}</span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="font-bold text-white block">{log.user}</span>
                    <span className="text-[10px] font-mono text-blue-400 uppercase">[{log.role}]</span>
                  </td>
                  <td className="p-4 text-indigo-300 font-bold font-sans">{log.action}</td>
                  <td className="p-4 text-blue-400 font-bold">{log.target}</td>
                  <td className="p-4">
                    <span className="text-slate-400">{log.previousStatus}</span> → <span className="text-emerald-400 font-bold">{log.newStatus}</span>
                  </td>
                  <td className="p-4 text-slate-300 italic font-sans">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
