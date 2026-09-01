import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessRestrictedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'partner') navigate('/partner/dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl z-10">
        
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">Security Barrier</span>
          <h1 className="text-xl font-extrabold text-white mt-1">🔒 Access Restricted</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            You don't have permission to access this page. Your role (<span className="text-white font-bold">{user?.role || 'guest'}</span>) does not possess authorization for this administrative path.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleReturn}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
