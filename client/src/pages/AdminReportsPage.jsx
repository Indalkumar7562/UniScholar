import { useState } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, ShieldCheck, DollarSign } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Reports & Platform Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive analytics, partner velocity monitoring, and benefit disbursement statistics.</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Platform Approval Rate</span>
          <p className="text-3xl font-black text-emerald-400">74.2%</p>
          <span className="text-[10px] text-emerald-300 font-bold">✓ High verification quality</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Rejection Rate</span>
          <p className="text-3xl font-black text-red-400">18.6%</p>
          <span className="text-[10px] text-red-300 font-bold">Document / criteria mismatch</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Avg. Review Velocity</span>
          <p className="text-3xl font-black text-blue-400">1.8 Days</p>
          <span className="text-[10px] text-blue-300 font-bold">Partner processing time</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Funds Disbursed</span>
          <p className="text-3xl font-black text-purple-400">₹8.42 Crore</p>
          <span className="text-[10px] text-purple-300 font-bold">Across 4,823 awards</span>
        </div>
      </div>

      {/* Partner Performance Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Partner Performance & Backlog Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Partner Organization</th>
                <th className="p-3">Applications Received</th>
                <th className="p-3">Reviewed</th>
                <th className="p-3">Approved</th>
                <th className="p-3">Rejected</th>
                <th className="p-3">Pending Backlog</th>
                <th className="p-3 font-mono">Avg. Review Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">AICTE Technical Council</td>
                <td className="p-3 font-mono">1,840</td>
                <td className="p-3 font-mono text-emerald-400">1,720</td>
                <td className="p-3 font-mono text-emerald-400">1,350</td>
                <td className="p-3 font-mono text-red-400">370</td>
                <td className="p-3 font-mono text-amber-400 font-bold">120</td>
                <td className="p-3 font-mono text-blue-400">1.2 days</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Mahindra Education Trust</td>
                <td className="p-3 font-mono">1,120</td>
                <td className="p-3 font-mono text-emerald-400">1,080</td>
                <td className="p-3 font-mono text-emerald-400">890</td>
                <td className="p-3 font-mono text-red-400">190</td>
                <td className="p-3 font-mono text-amber-400 font-bold">40</td>
                <td className="p-3 font-mono text-blue-400">1.5 days</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">LIC Housing Finance Ltd</td>
                <td className="p-3 font-mono">950</td>
                <td className="p-3 font-mono text-emerald-400">810</td>
                <td className="p-3 font-mono text-emerald-400">620</td>
                <td className="p-3 font-mono text-red-400">190</td>
                <td className="p-3 font-mono text-amber-400 font-bold">140</td>
                <td className="p-3 font-mono text-blue-400">2.8 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
