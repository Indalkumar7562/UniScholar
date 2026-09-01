import { useState } from 'react';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

export default function PartnerReportsPage() {
  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Performance & Analytics</h1>
          <p className="text-xs text-purple-400 font-bold mt-0.5">Program application metrics, review velocity, and benefit disbursement statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Applications Reviewed</span>
          <p className="text-2xl font-black text-white">1,154</p>
          <span className="text-[10px] text-emerald-400 font-bold">93% review speed</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Approval Rate</span>
          <p className="text-2xl font-black text-emerald-400">76.4%</p>
          <span className="text-[10px] text-slate-400 font-bold">Industry benchmark: 70%</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Funds Disbursed</span>
          <p className="text-2xl font-black text-purple-400">₹1.48 Crore</p>
          <span className="text-[10px] text-purple-300 font-bold">Across 320 scholars</span>
        </div>
      </div>
    </div>
  );
}
