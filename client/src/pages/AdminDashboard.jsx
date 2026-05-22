import { useState, useEffect } from 'react';
import { adminAPI, schemeAPI } from '../services/api';
import { t } from '../utils/translate';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Award, Plus, Edit, Trash, Download, 
  ShieldAlert, RefreshCw, Layers, CheckCircle2, XCircle, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { language } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  
  // CRUD Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    ministry: '',
    amount: '',
    amountValue: '',
    frequency: 'Yearly',
    officialLink: '',
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 28,
      maxAnnualIncome: 300000,
      minPercentage: 60,
      educationLevels: '12th Pass, Graduation',
      categories: 'All',
      states: 'All',
      genders: 'All',
      disabilityRequired: false,
      bplRequired: false,
      streams: 'Science, Commerce, Arts, Engineering, Medical',
      professions: 'Student'
    },
    requiredDocuments: 'Income Certificate, Marksheet, Aadhaar Card'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminAPI.exportReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `uss_welfare_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Welfare report exported successfully!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await schemeAPI.delete(id);
      toast.success('Scheme deleted successfully');
      fetchAnalytics();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openAddModal = () => {
    setEditingSchemeId(null);
    setFormData({
      name: '',
      description: '',
      category: 'General',
      ministry: '',
      amount: '',
      amountValue: '',
      frequency: 'Yearly',
      officialLink: '',
      eligibilityCriteria: {
        minAge: 16,
        maxAge: 28,
        maxAnnualIncome: 300000,
        minPercentage: 60,
        educationLevels: '12th Pass, Graduation',
        categories: 'All',
        states: 'All',
        genders: 'All',
        disabilityRequired: false,
        bplRequired: false,
        streams: 'Science, Commerce, Arts, Engineering, Medical',
        professions: 'Student'
      },
      requiredDocuments: 'Income Certificate, Marksheet, Aadhaar Card'
    });
    setModalOpen(true);
  };

  const openEditModal = (scheme) => {
    setEditingSchemeId(scheme._id);
    setFormData({
      name: scheme.name,
      description: scheme.description,
      category: scheme.category,
      ministry: scheme.ministry,
      amount: scheme.amount,
      amountValue: scheme.amountValue || '',
      frequency: scheme.frequency || 'Yearly',
      officialLink: scheme.officialLink || '',
      eligibilityCriteria: {
        minAge: scheme.eligibilityCriteria?.minAge ?? 16,
        maxAge: scheme.eligibilityCriteria?.maxAge ?? 28,
        maxAnnualIncome: scheme.eligibilityCriteria?.maxAnnualIncome ?? 300000,
        minPercentage: scheme.eligibilityCriteria?.minPercentage ?? 60,
        educationLevels: scheme.eligibilityCriteria?.educationLevels?.join(', ') || 'All',
        categories: scheme.eligibilityCriteria?.categories?.join(', ') || 'All',
        states: scheme.eligibilityCriteria?.states?.join(', ') || 'All',
        genders: scheme.eligibilityCriteria?.genders?.join(', ') || 'All',
        disabilityRequired: scheme.eligibilityCriteria?.disabilityRequired ?? false,
        bplRequired: scheme.eligibilityCriteria?.bplRequired ?? false,
        streams: scheme.eligibilityCriteria?.streams?.join(', ') || 'All',
        professions: scheme.eligibilityCriteria?.professions?.join(', ') || 'Student'
      },
      requiredDocuments: scheme.requiredDocuments?.join(', ') || 'Income Certificate, Marksheet, Aadhaar Card'
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Parse commas
    const parseCommas = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      ministry: formData.ministry,
      amount: formData.amount,
      amountValue: Number(formData.amountValue),
      frequency: formData.frequency,
      officialLink: formData.officialLink,
      eligibilityCriteria: {
        minAge: Number(formData.eligibilityCriteria.minAge),
        maxAge: Number(formData.eligibilityCriteria.maxAge),
        maxAnnualIncome: Number(formData.eligibilityCriteria.maxAnnualIncome),
        minPercentage: Number(formData.eligibilityCriteria.minPercentage),
        educationLevels: parseCommas(formData.eligibilityCriteria.educationLevels),
        categories: parseCommas(formData.eligibilityCriteria.categories),
        states: parseCommas(formData.eligibilityCriteria.states),
        genders: parseCommas(formData.eligibilityCriteria.genders),
        disabilityRequired: formData.eligibilityCriteria.disabilityRequired,
        bplRequired: formData.eligibilityCriteria.bplRequired,
        streams: parseCommas(formData.eligibilityCriteria.streams),
        professions: parseCommas(formData.eligibilityCriteria.professions)
      },
      requiredDocuments: parseCommas(formData.requiredDocuments)
    };

    try {
      if (editingSchemeId) {
        await schemeAPI.update(editingSchemeId, payload);
        toast.success('Scheme updated successfully');
      } else {
        await schemeAPI.create(payload);
        toast.success('Scheme created successfully');
      }
      setModalOpen(false);
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to submit scheme form');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const { metrics, categoryDistribution = [], fraudAlerts = [], rejectionReasons = [], schemes = [] } = analytics || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            {t('adminDashboard', language)}
          </h1>
          <p className="section-sub">Perform fraud monitoring audits, aggregate statistics, and control national welfare scholarship schemes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="btn btn-ghost text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
          <button 
            onClick={openAddModal}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Scheme
          </button>
        </div>
      </div>

      {/* ── KPI Widgets ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card glass-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Registered Candidates</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white font-mono">{metrics?.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="card glass-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Average Match Score</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white font-mono">{metrics?.avgScore}%</span>
            </div>
          </div>
        </div>

        <div className="card glass-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Active Programs</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white font-mono">{metrics?.activeSchemes}</span>
            </div>
          </div>
        </div>

        <div className="card glass-card border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Fraud Logs Flagged</span>
              <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{metrics?.fraudAlertsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SVG Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SVG Donut Chart for Category Distribution */}
        <div className="card">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-6">Welfare Scheme Allocations By reservation Caste</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 4 segments representing distributions */}
                <circle cx="50" cy="50" r="35" stroke="#f1f5f9" strokeWidth="15" fill="none" />
                
                {/* General Segment - 50% */}
                <circle cx="50" cy="50" r="35" stroke="#2563eb" strokeWidth="15" strokeDasharray="110 220" strokeDashoffset="0" fill="none" />
                
                {/* SC Segment - 25% */}
                <circle cx="50" cy="50" r="35" stroke="#10b981" strokeWidth="15" strokeDasharray="55 220" strokeDashoffset="-110" fill="none" />
                
                {/* ST Segment - 15% */}
                <circle cx="50" cy="50" r="35" stroke="#f59e0b" strokeWidth="15" strokeDasharray="33 220" strokeDashoffset="-165" fill="none" />
                
                {/* OBC Segment - 10% */}
                <circle cx="50" cy="50" r="35" stroke="#7c3aed" strokeWidth="15" strokeDasharray="22 220" strokeDashoffset="-198" fill="none" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-gray-400">USS Database</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 block"></span>
                <span className="font-semibold text-gray-600 dark:text-slate-350">General / Open Sector (50%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 block"></span>
                <span className="font-semibold text-gray-600 dark:text-slate-350">SC (Scheduled Caste) (25%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 block"></span>
                <span className="font-semibold text-gray-600 dark:text-slate-350">ST (Scheduled Tribe) (15%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-purple-600 block"></span>
                <span className="font-semibold text-gray-600 dark:text-slate-350">OBC Reservation (10%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart for Rejection Reasons */}
        <div className="card">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-6">Top Eligibility Rejection Criteria Drivers</h2>
          
          <div className="h-44 flex items-end justify-between gap-4 font-mono text-[10px] text-gray-500">
            {rejectionReasons.map((item, idx) => {
              const heightPercentage = Math.min(100, (item.count / 15) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-50 dark:bg-slate-900 rounded-lg flex items-end h-32 relative overflow-hidden">
                    <div 
                      style={{ height: `${heightPercentage}%` }}
                      className="w-full bg-gradient-to-t from-violet-600 to-primary-500 transition-all duration-1000"
                    />
                    <span className="absolute top-1 left-0 right-0 text-center font-bold text-[9px] text-gray-800 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <span className="truncate w-full text-center font-semibold" title={item.reason}>{item.reason}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Row 3: OCR Fraud Logs & Schemes CRUD List ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Fraud Log list */}
        <div className="card lg:col-span-1 border-t-4 border-t-red-500">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Audit OCR Verification Flags
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
            {fraudAlerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No active document warnings logged.
              </div>
            ) : (
              fraudAlerts.map(alert => (
                <div 
                  key={alert._id}
                  className="p-3.5 rounded-xl bg-red-50/40 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 text-xs"
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-red-700 dark:text-red-400">OCR Discrepancy warning</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-slate-100 mt-1.5">{alert.title}</div>
                  <p className="text-gray-500 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schemes List with Edit/Delete Actions */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-4">Manage Scholarship Schemes</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 font-bold text-gray-400 dark:text-slate-500">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Caste</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750">
                {schemes.map(sch => (
                  <tr key={sch._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/25">
                    <td className="py-3">
                      <div className="font-bold text-gray-955 dark:text-slate-200">{sch.name}</div>
                      <div className="text-[10px] text-gray-400">{sch.ministry}</div>
                    </td>
                    <td className="py-3 font-semibold">{sch.category}</td>
                    <td className="py-3 font-mono font-bold text-primary-600 dark:text-primary-400">{sch.amount}</td>
                    <td className="py-3">
                      <span className={`badge ${sch.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {sch.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button 
                          onClick={() => openEditModal(sch)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteScheme(sch._id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Scheme Edit/Add Modal ───────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-modal border border-white/25">
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-150 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                {editingSchemeId ? 'Modify Scholarship Program' : 'Publish New Scholarship Program'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[500px] scrollbar-hide text-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Scheme Name</label>
                  <input 
                    type="text" 
                    className="input py-2" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Sponsoring Ministry / Department</label>
                  <input 
                    type="text" 
                    className="input py-2" 
                    required
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Program Description</label>
                <textarea 
                  className="input min-h-[60px]" 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Category / Caste Allocation</label>
                  <select 
                    className="select py-2" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General / Open</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
                <div>
                  <label className="label">Dispensation Amount Label (e.g. ₹12,000/year)</label>
                  <input 
                    type="text" 
                    className="input py-2" 
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Dispensation Numeric Value (INR)</label>
                  <input 
                    type="number" 
                    className="input py-2" 
                    required
                    value={formData.amountValue}
                    onChange={(e) => setFormData({ ...formData, amountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-700/80 pt-4">
                <span className="font-extrabold text-[10px] uppercase text-primary-600 block mb-3">Eligibility Constraint Thresholds</span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Min Age</label>
                    <input 
                      type="number" 
                      className="input py-2 font-mono" 
                      value={formData.eligibilityCriteria.minAge}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: { ...formData.eligibilityCriteria, minAge: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="label">Max Age</label>
                    <input 
                      type="number" 
                      className="input py-2 font-mono" 
                      value={formData.eligibilityCriteria.maxAge}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: { ...formData.eligibilityCriteria, maxAge: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="label">Max Annual Income</label>
                    <input 
                      type="number" 
                      className="input py-2 font-mono" 
                      value={formData.eligibilityCriteria.maxAnnualIncome}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: { ...formData.eligibilityCriteria, maxAnnualIncome: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="label">Min Grade Percentage</label>
                    <input 
                      type="number" 
                      className="input py-2 font-mono" 
                      value={formData.eligibilityCriteria.minPercentage}
                      onChange={(e) => setFormData({
                        ...formData,
                        eligibilityCriteria: { ...formData.eligibilityCriteria, minPercentage: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Applicable Streams (Comma separated)</label>
                  <input 
                    type="text" 
                    className="input py-2" 
                    value={formData.eligibilityCriteria.streams}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibilityCriteria: { ...formData.eligibilityCriteria, streams: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="label">Required Documents (Comma separated)</label>
                  <input 
                    type="text" 
                    className="input py-2" 
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700/80">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost px-5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-6"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
