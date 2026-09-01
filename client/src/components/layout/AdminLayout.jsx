import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, FileText, 
  Building2, History, LogOut, Menu, X, Shield, GraduationCap,
  Sliders, BarChart3, Bell, Settings
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard',    label: 'Dashboard',             icon: LayoutDashboard },
  { to: '/admin/students',     label: '👥 Students',           icon: Users },
  { to: '/admin/scholarships', label: '🎓 Scholarships',       icon: BookOpen },
  { to: '/admin/applications', label: '📋 Applications',       icon: FileCheck },
  { to: '/admin/documents',    label: '📄 Document Verification', icon: FileText },
  { to: '/admin/eligibility',  label: '✅ Eligibility Rules',  icon: Sliders },
  { to: '/admin/partners',     label: '🏢 Partners',           icon: Building2 },
  { to: '/admin/reports',      label: '📊 Reports & Analytics',icon: BarChart3 },
  { to: '/admin/notifications',label: '🔔 Notifications',      icon: Bell },
  { to: '/admin/audit-logs',   label: '🧾 Audit Logs',         icon: History },
  { to: '/admin/settings',     label: '⚙ System Settings',     icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
        <div className="overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-sm text-white block leading-tight">Admin Portal</span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">USS Operations</span>
              </div>
            </Link>
            <button className="lg:hidden p-1.5 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Badge */}
          <div className="p-3.5 mx-3 my-3 rounded-2xl bg-blue-950/40 border border-blue-900/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'System Admin'}</p>
              <p className="text-[10px] font-mono text-blue-400">admin@uss.gov.in</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1 text-xs">
            {ADMIN_NAV_ITEMS.map(item => (
              <NavLink
                key={item.label}
                to={item.toPath || item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all
                  ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 text-xs bg-slate-900">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3.5 py-2 text-slate-400 hover:text-white font-bold rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Student Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-red-400 hover:text-red-300 font-bold rounded-xl hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>🚪 Logout</span>
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
              🔐 UniScholar Platform Administration
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[10px]">
              ROLE: ADMIN
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
