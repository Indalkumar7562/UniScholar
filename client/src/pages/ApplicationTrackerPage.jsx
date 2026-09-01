import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { SectionHeader, ProgressBar, EmptyState, Spinner } from '../components/ui/index.jsx';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../utils/deadline.utils';
import { 
  FileCheck2, Clock, CheckCircle2, AlertCircle, XCircle, ExternalLink, Trash2, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'pending', label: 'In Progress / Pending' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'underReview', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_BADGES = {
  'Not Started': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'Documents Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Ready to Apply': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Application Started': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Submitted': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Under Review': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Approved': 'bg-green-600/10 text-green-600 border-green-600/20',
  'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function ApplicationTrackerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationAPI.getAll();
      setApplications(data.applications || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      toast.error('Failed to load tracked applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await applicationAPI.updateStatus(id, { status: newStatus });
      toast.success(`Application marked as "${newStatus}"`);
      await fetchApplications();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application from your tracker?')) return;
    try {
      await applicationAPI.delete(id);
      toast.success('Application withdrawn');
      await fetchApplications();
    } catch (err) {
      toast.error('Failed to withdraw application');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'submitted') return app.status === 'Submitted';
    if (activeTab === 'underReview') return app.status === 'Under Review';
    if (activeTab === 'approved') return app.status === 'Approved';
    if (activeTab === 'rejected') return app.status === 'Rejected';
    if (activeTab === 'pending') return ['Not Started', 'Documents Pending', 'Ready to Apply', 'Application Started'].includes(app.status);
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="My Applications"
        subtitle="Track application status, readiness scores, and upcoming deadlines for your saved schemes."
      />

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700/80 gap-2 overflow-x-auto scrollbar-hide pb-0.5 text-xs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {statusCounts[tab.id] !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                {statusCounts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner className="w-8 h-8 text-emerald-500" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No applications in this category"
          description="Start tracking your scholarship applications from the Browse Schemes or Details page."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/schemes')}>
              Browse Scholarships
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredApplications.map((app) => {
            const scheme = app.scheme || {};
            const deadlineStatus = getDeadlineStatus(scheme);
            const daysRemaining = getDaysRemaining(scheme);
            const formattedDeadline = formatDate(scheme);
            const expired = isExpired(scheme);

            return (
              <div
                key={app._id}
                className="card glass-card p-5 space-y-4 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGES[app.status] || STATUS_BADGES['Application Started']}`}>
                      {app.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${deadlineStatus.badgeClass}`}>
                      {deadlineStatus.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-slate-100 line-clamp-2">
                    {scheme.name || 'Scholarship Scheme'}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{scheme.ministry}</p>

                  {/* Readiness Progress Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-600 dark:text-slate-350">Application Readiness</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {app.readinessScore || 80}%
                      </span>
                    </div>
                    <ProgressBar
                      value={app.readinessScore || 80}
                      color={(app.readinessScore || 80) >= 80 ? 'success' : 'warning'}
                    />
                  </div>

                  {/* Application Notes / Dates */}
                  <div className="mt-3 text-xs space-y-1 text-gray-500 dark:text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Applied Date:</span>
                      <span className="font-bold">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Not submitted yet'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Date:</span>
                      <span className={`font-bold ${expired ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formattedDeadline} ({daysRemaining})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    {app.status !== 'Submitted' && app.status !== 'Approved' && !expired && (
                      <button
                        onClick={() => handleStatusUpdate(app._id, 'Submitted')}
                        disabled={updatingId === app._id}
                        className="btn btn-primary btn-sm text-xs px-3 py-1 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Mark Submitted
                      </button>
                    )}
                    {scheme._id && (
                      <button
                        onClick={() => navigate(`/schemes/${scheme._id}`)}
                        className="btn btn-ghost btn-sm text-xs px-3 py-1 flex items-center gap-1"
                      >
                        Checklist & Details <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleWithdraw(app._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Withdraw application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
