import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, FileCheck, FileText, 
  CheckSquare, BarChart3, LogOut, Menu, X, Building2, GraduationCap
} from 'lucide-react';

const PARTNER_NAV_ITEMS = [
  { to: '/partner/dashboard',    label: 'Dashboard',            icon: LayoutDashboard },
  { to: '/partner/schemes',      label: 'My Scholarships',      icon: BookOpen },
  { to: '/partner/applications', label: 'Applications',          icon: FileCheck },
  { to: '/partner/documents',    label: 'Document Review',      icon: FileText },
  { to: '/partner/verification', label: 'Student Verification', icon: CheckSquare },
  { to: '/partner/reports',      label: 'Reports & Analytics',  icon: BarChart3 },
];

export default function PartnerLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/partner/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 z-50
        bg-slate-900 border-r border-slate-800
        flex flex-col justify-between transition-transform duration-300
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <Link to="/partner/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-sm text-white block leading-tight">Partner Portal</span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Provider Operations</span>
              </div>
            </Link>
            <button className="lg:hidden p-1.5 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Partner User Badge */}
          <div className="p-3.5 mx-3 my-3 rounded-2xl bg-purple-950/40 border border-purple-900/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.[0] || 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Scholarship Provider'}</p>
              <p className="text-[10px] font-mono text-purple-300 truncate">{user?.organization || 'AICTE Partner Org'}</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1 text-xs">
            {PARTNER_NAV_ITEMS.map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all
                  ${isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 text-xs">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3.5 py-2 text-slate-400 hover:text-white font-bold rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Student Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-red-400 hover:text-red-300 font-bold rounded-xl hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              🏢 {user?.organization || 'Scholarship Provider Partner Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-[10px]">
              ROLE: PARTNER
            </span>
          </div>
        </header>

        {/* Page Children */}
        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
