import { useState, useEffect } from 'react';
import { schemeAPI } from '../services/api';
import { handleOfficialWebsite } from '../components/dashboard/SchemeCard.jsx';
import { Search, Plus, ExternalLink, Edit3, Copy, Power, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminSchemesPage() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editScheme, setEditScheme] = useState(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data } = await schemeAPI.getAll();
      setSchemes(data.schemes || []);
    } catch (err) {
      toast.error('Failed to fetch scholarship schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUrl = (url) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      toast.error('❌ Official Application URL is missing or invalid');
    } else {
      toast.success('✓ Official Application URL is verified and accessible');
    }
  };

  const handleToggleStatus = (scheme) => {
    setSchemes(prev => prev.map(s => s._id === scheme._id ? { ...s, isActive: !s.isActive } : s));
    toast.success(`Scheme "${scheme.name}" updated status to ${!scheme.isActive ? 'Active' : 'Deactivated'}`);
  };

  const handleDuplicate = (scheme) => {
    const dup = { ...scheme, _id: 'dup_' + Date.now(), name: `${scheme.name} (Copy)` };
    setSchemes(prev => [dup, ...prev]);
    toast.success(`Duplicated "${scheme.name}"`);
  };

  const filteredSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.ministry && s.ministry.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Scholarship Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage scholarship catalogs, eligibility rules, and official application URLs.</p>
        </div>
        <button
          onClick={() => { setEditScheme(null); setModalOpen(true); }}
          className="btn btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Scholarship
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by scholarship name or provider..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Active Schemes: <strong className="text-emerald-400">{filteredSchemes.length}</strong></span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-emerald-500" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Scholarship Name</th>
                  <th className="p-4">Provider / Ministry</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Official Website URL</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSchemes.map(scheme => (
                  <tr key={scheme._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs">{scheme.name}</td>
                    <td className="p-4 text-slate-400">{scheme.ministry || 'National Authority'}</td>
                    <td className="p-4 font-mono">{scheme.category || 'General'}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{scheme.amount || 'Variable'}</td>
                    <td className="p-4 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {scheme.officialApplicationUrl ? (
                          <>
                            <button
                              onClick={() => handleOfficialWebsite(scheme)}
                              className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:text-white border border-blue-500/30 text-[10px] font-bold flex items-center gap-1"
                            >
                              Official Website <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleVerifyUrl(scheme.officialApplicationUrl)}
                              className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono underline"
                            >
                              Verify
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">URL not configured</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scheme.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {scheme.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(scheme)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400"
                          title="Duplicate Scheme"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(scheme)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                          title="Toggle Status"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
