import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { History, Shield, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs();
      setLogs(res.data?.auditLogs || []);
    } catch (err) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">Immutable record of administrative actions, status updates, decisions, and security events.</p>
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
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action Executed</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Status Change</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">No audit log records recorded yet.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-white">
                        <div>{log.userName || 'System Admin'}</div>
                        <span className="text-[10px] font-mono text-blue-400 uppercase">{log.role || 'admin'}</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{log.action}</td>
                      <td className="p-4 font-mono text-slate-300">
                        {log.targetType}: {log.targetId ? `#${String(log.targetId).slice(-6)}` : '-'}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {log.previousStatus || log.newStatus ? `${log.previousStatus || 'Initiated'} → ${log.newStatus || 'Completed'}` : '-'}
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">{log.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
