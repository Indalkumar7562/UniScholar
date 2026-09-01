import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileCheck, Clock, CheckCircle2, Building2, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const metrics = {
    activeScholarships: 8,
    totalApplications: 1240,
    pendingReviews: 86,
    approvedStudents: 320
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Portal Dashboard</h1>
          <p className="text-xs text-purple-400 mt-0.5 font-bold">
            🏢 {user?.organization || 'AICTE Scholarship & Welfare Partner Workspace'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/partner/applications')}
          className="btn btn-primary text-xs py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
        >
          Review Applications ({metrics.pendingReviews}) →
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Scholarships</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{metrics.activeScholarships}</p>
          <span className="text-[10px] text-purple-300 font-bold">Under your organization</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Applications</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{metrics.totalApplications.toLocaleString()}</p>
          <span className="text-[10px] text-blue-400 font-bold">Received to date</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 bg-amber-950/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{metrics.pendingReviews}</p>
          <span className="text-[10px] text-amber-300 font-bold">Requires verification</span>
        </div>

        <div className="bg-slate-900 border border-emerald-900/40 bg-emerald-950/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved Students</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{metrics.approvedStudents}</p>
          <span className="text-[10px] text-emerald-300 font-bold">Disbursed / Awarded</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Organization Scholarships
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage scheme details, deadlines, required documents, and official portal links for your programs.
          </p>
          <button
            onClick={() => navigate('/partner/schemes')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Manage My Schemes →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" /> Student Verification & Review
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review student applications, audit document proofs, approve awards, or issue stage rejection explanations.
          </p>
          <button
            onClick={() => navigate('/partner/applications')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Review Applications →
          </button>
        </div>

      </div>

    </div>
  );
}
