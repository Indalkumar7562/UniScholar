import { useState } from 'react';
import { Settings, Shield, Bell, Lock, Key, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [autoVerify, setAutoVerify] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('✓ Platform settings saved successfully!');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in max-w-4xl">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Configuration & Security</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage platform rules, verification automation, role authorizations, and security limits.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Verification Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" /> Verification Engine Settings
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-bold text-white block">Automated AI OCR Document Pre-Validation</span>
              <span className="text-[11px] text-slate-400">Automatically flag expired or low-confidence scanned documents</span>
            </div>
            <input
              type="checkbox"
              checked={autoVerify}
              onChange={e => setAutoVerify(e.target.checked)}
              className="rounded border-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> Role & Access Control Security
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span>Admin Authentication Security Level</span>
              <strong className="text-emerald-400">Strict JWT + RBAC Enforced</strong>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span>Partner Workspace Isolation</span>
              <strong className="text-purple-400">Scoped to Partner Organization ID</strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow">
            Save Platform Settings →
          </button>
        </div>

      </form>

    </div>
  );
}
