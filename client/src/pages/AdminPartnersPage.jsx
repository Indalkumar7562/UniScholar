import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Building2, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Search } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPartners();
      setPartners(res.data?.partners || []);
    } catch (err) {
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (partner, nextStatus) => {
    try {
      await adminAPI.updatePartnerStatus(partner._id, { partnerStatus: nextStatus });
      toast.success(`✓ Partner ${partner.name} status updated to ${nextStatus}`);
      fetchPartners();
    } catch (err) {
      toast.error('Failed to update partner status');
    }
  };

  const filteredPartners = partners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.organization?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner Organization Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Approve, verify, suspend, or manage partner scholarship provider accounts.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search partner organization or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Organization Name</th>
                  <th className="p-4">Contact Person & Email</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPartners.map(partner => (
                  <tr key={partner._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{partner.organization || 'Scholarship Foundation'}</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div>{partner.name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{partner.email}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{new Date(partner.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        partner.partnerStatus === 'Active' || partner.partnerStatus === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        partner.partnerStatus === 'Suspended' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {partner.partnerStatus || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(partner, 'Active')}
                          className="btn btn-ghost px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 font-bold rounded-lg"
                        >
                          Approve ✓
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(partner, 'Suspended')}
                          className="btn btn-ghost px-2.5 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 font-bold rounded-lg"
                        >
                          Suspend ✕
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
