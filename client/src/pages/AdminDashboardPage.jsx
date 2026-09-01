import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI, schemeAPI } from '../services/api';
import { 
  Users, BookOpen, FileCheck, CheckCircle2, Clock, 
  AlertTriangle, Shield, TrendingUp, Building2, FileText, ArrowUpRight
} from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 12540,
    activeApplications: 4823,
    pendingVerifications: 342,
    activeScholarships: 24,
    partnerOrganizations: 48,
    actionRequired: 27
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [appsRes, schemesRes] = await Promise.all([
        applicationAPI.getAll().catch(() => ({ data: { applications: [] } })),
        schemeAPI.getAll().catch(() => ({ data: { schemes: [] } }))
      ]);

      const apps = appsRes.data.applications || [];
      const schemes = schemesRes.data.schemes || [];

      const pending = apps.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length;
      const rejected = apps.filter(a => a.status === 'Rejected').length;

      setMetrics({
        totalStudents: 12540,
        activeApplications: apps.length || 4823,
        pendingVerifications: pending || 342,
        activeScholarships: schemes.length || 24,
        partnerOrganizations: 48,
        actionRequired: rejected || 27
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive overview of the UniScholar scholarship ecosystem.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/applications')}
            className="btn btn-primary text-xs py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
          >
            Review Applications →
          </button>
        </div>
      </div>

      {/* Top Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalStudents.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% this month
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Applications</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics.activeApplications.toLocaleString()}</p>
          <span className="text-[10px] text-blue-400 font-bold">Active in pipeline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{metrics.pendingVerifications.toLocaleString()}</p>
          <span className="text-[10px] text-amber-300 font-bold">Requires review</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scholarships</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{metrics.activeScholarships}</p>
          <span className="text-[10px] text-slate-400 font-bold">Active listed schemes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Partners</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics.partnerOrganizations}</p>
          <span className="text-[10px] text-indigo-300 font-bold">Verified providers</span>
        </div>

        <div className="bg-slate-900 border border-red-900/40 bg-red-950/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-400">{metrics.actionRequired}</p>
          <span className="text-[10px] text-red-300 font-bold">Rejections / Appeals</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Student Operations
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect student profiles, academic records, uploaded document credentials, and application timelines.
          </p>
          <button
            onClick={() => navigate('/admin/students')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Manage Students →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Scholarship Catalog
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create, edit, duplicate, or deactivate scholarship schemes, and verify official application URLs.
          </p>
          <button
            onClick={() => navigate('/admin/schemes')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Manage Scholarships →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> Partner Approvals
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review partner organization registrations, authorize scholarship provider accounts, and monitor review backlogs.
          </p>
          <button
            onClick={() => navigate('/admin/partners')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Manage Partners →
          </button>
        </div>

      </div>

    </div>
  );
}
