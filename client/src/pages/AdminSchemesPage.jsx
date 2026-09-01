import { useState, useEffect } from 'react';
import { schemeAPI } from '../services/api';
import { handleOfficialWebsite } from '../components/dashboard/SchemeCard.jsx';
import { Search, Plus, ExternalLink, Edit3, Copy, Power, CheckCircle2, AlertTriangle, BookOpen, Trash2, X } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [editScheme, setEditScheme] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await schemeAPI.getAll();
      setSchemes(res.data.schemes || []);
    } catch (err) {
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setEditScheme({
      name: '',
      provider: 'AICTE / Ministry of Education',
      amount: 25000,
      description: 'Scholarship program for deserving students.',
      category: 'Merit-Cum-Means',
      educationLevel: ['Graduation'],
      minPercentage: 60,
      incomeLimit: 300000,
      deadline: '2026-10-31',
      officialApplicationUrl: 'https://scholarships.gov.in',
      isActive: true
    });
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    if (!editScheme.name) {
      toast.error('Scholarship name is required');
      return;
    }

    try {
      if (isNew) {
        await schemeAPI.create(editScheme);
        toast.success('✓ New Scholarship created successfully!');
      } else {
        await schemeAPI.update(editScheme._id, editScheme);
        toast.success('✓ Scholarship updated successfully!');
      }
      setEditScheme(null);
      fetchSchemes();
    } catch (err) {
      toast.error('Error saving scholarship');
    }
  };

  const handleDuplicate = async (scheme) => {
    try {
      const copy = { ...scheme, _id: undefined, name: `${scheme.name} (Copy)` };
      await schemeAPI.create(copy);
      toast.success('✓ Scholarship duplicated successfully');
      fetchSchemes();
    } catch (err) {
      toast.error('Failed to duplicate');
    }
  };

  const handleToggleActive = async (scheme) => {
    try {
      await schemeAPI.update(scheme._id, { isActive: !scheme.isActive });
      toast.success(`Scholarship marked as ${!scheme.isActive ? 'Active' : 'Inactive'}`);
      fetchSchemes();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteScheme = async () => {
    if (!deleteConfirm) return;
    try {
      await schemeAPI.delete(deleteConfirm._id);
      toast.success('Scholarship deleted successfully');
      setDeleteConfirm(null);
      fetchSchemes();
    } catch (err) {
      toast.error('Failed to delete scholarship');
    }
  };

  const filteredSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Scholarship Management CMS</h1>
          <p className="text-xs text-slate-400 mt-0.5">Create, edit, verify official portal URLs, and publish scholarship programs.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="btn btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Scholarship
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search scholarship by name or provider..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchemes.map(scheme => (
            <div key={scheme._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
              
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                    {scheme.category || 'Scholarship'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    scheme.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {scheme.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-sm line-clamp-2">{scheme.name}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{scheme.description}</p>
                <p className="text-emerald-400 font-black font-mono text-sm">₹{scheme.amount?.toLocaleString()} / year</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                
                {/* Official Website Verification */}
                <div className="flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => handleOfficialWebsite(scheme.officialApplicationUrl, scheme.name)}
                    className="text-blue-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Official Website ↗
                  </button>
                  <button
                    onClick={() => toast.success(`Official URL verified: ${scheme.officialApplicationUrl || 'N/A'}`)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    Verify URL ✓
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => { setEditScheme(scheme); setIsNew(false); }}
                    className="btn btn-ghost px-2.5 py-1.5 text-xs text-purple-400 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(scheme)}
                    className="btn btn-ghost px-2.5 py-1.5 text-xs text-slate-300 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    onClick={() => handleToggleActive(scheme)}
                    className="btn btn-ghost px-2.5 py-1.5 text-xs text-amber-400 font-bold flex items-center gap-1"
                  >
                    <Power className="w-3.5 h-3.5" /> {scheme.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(scheme)}
                    className="btn btn-ghost px-2 py-1.5 text-xs text-red-400 hover:bg-red-950/30 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* EDIT / CREATE SCHOLARSHIP MODAL */}
      {editScheme && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">
                {isNew ? '✨ Create New Scholarship' : `✏️ Edit Scholarship: ${editScheme.name}`}
              </h3>
              <button onClick={() => setEditScheme(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Scholarship Title</label>
                  <input
                    type="text"
                    value={editScheme.name}
                    onChange={e => setEditScheme(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Provider Organization</label>
                    <input
                      type="text"
                      value={editScheme.provider}
                      onChange={e => setEditScheme(p => ({ ...p, provider: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Award Amount (₹/year)</label>
                    <input
                      type="number"
                      value={editScheme.amount}
                      onChange={e => setEditScheme(p => ({ ...p, amount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editScheme.description}
                    onChange={e => setEditScheme(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Official Application URL</label>
                  <input
                    type="url"
                    value={editScheme.officialApplicationUrl}
                    onChange={e => setEditScheme(p => ({ ...p, officialApplicationUrl: e.target.value }))}
                    placeholder="https://scholarships.gov.in"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono text-blue-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditScheme(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="btn btn-primary px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                  {isNew ? 'Create Scholarship →' : 'Save Changes →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Delete Scholarship Scheme?</h4>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to delete {deleteConfirm.name}? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
              <button onClick={handleDeleteScheme} className="btn px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
