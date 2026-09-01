import { useState } from 'react';
import { Bell, ShieldAlert, Building2, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_NOTIFS = [
  { _id: 'n1', title: 'New Partner Registration', desc: 'LIC HFL Foundation requested partner authorization.', type: 'partner', date: '10 mins ago', read: false },
  { _id: 'n2', title: 'Scholarship Submitted for Review', desc: 'Mahindra Trust submitted "Saksham Scholarship 2026".', type: 'scheme', date: '1 hour ago', read: false },
  { _id: 'n3', title: 'Stage Rejection Logged', desc: 'AICTE Partner rejected application USS-A0905F at Document Verification.', type: 'rejection', date: '3 hours ago', read: true },
  { _id: 'n4', title: 'System Backup Complete', desc: 'Database audit records successfully backed up.', type: 'system', date: '1 day ago', read: true },
];

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);

  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Notification Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time platform alerts, partner verification requests, and system updates.</p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-ghost text-xs px-3 py-1.5 font-bold text-blue-400">
          Mark All Read ✓
        </button>
      </div>

      <div className="space-y-3">
        {notifs.map(n => (
          <div key={n._id} className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
            !n.read ? 'bg-blue-950/30 border-blue-800/50' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-blue-400">
                {n.type === 'partner' ? <Building2 className="w-4 h-4" /> : n.type === 'scheme' ? <BookOpen className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{n.title}</h4>
                <p className="text-slate-300 text-xs mt-0.5">{n.desc}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">{n.date}</span>
              </div>
            </div>

            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
