import { useState, useEffect } from 'react';
import { schemeAPI } from '../services/api';
import { handleOfficialWebsite } from '../components/dashboard/SchemeCard.jsx';
import { Search, Plus, ExternalLink, Power, BookOpen, Clock } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function PartnerSchemesPage() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data } = await schemeAPI.getAll();
      setSchemes(data.schemes || []);
    } catch (err) {
      toast.error('Failed to load partner schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (scheme) => {
    setSchemes(prev => prev.map(s => s._id === scheme._id ? { ...s, isActive: !s.isActive } : s));
    toast.success(`Scholarship status updated to ${!scheme.isActive ? 'Active' : 'Paused'}`);
  };

  const filteredSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Organization Scholarships</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage scholarship listings, deadlines, required documents, and official portal URLs.</p>
        </div>
        <button
          onClick={() => toast.info('Scholarship creation submission sent for partner verification.')}
          className="btn btn-primary text-xs py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Scholarship
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Scholarship Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Official Application Link</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSchemes.map(scheme => (
                <tr key={scheme._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white max-w-xs">{scheme.name}</td>
                  <td className="p-4 font-mono">{scheme.category || 'General'}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{scheme.amount || 'Variable'}</td>
                  <td className="p-4">
                    {scheme.officialApplicationUrl ? (
                      <button
                        onClick={() => handleOfficialWebsite(scheme)}
                        className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold flex items-center gap-1"
                      >
                        Official Portal <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No link</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scheme.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {scheme.isActive !== false ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(scheme)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300"
                      title="Toggle Active Status"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
