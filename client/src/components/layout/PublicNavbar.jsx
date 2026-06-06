import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Menu, X, Grid, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { Avatar } from '../ui/index.jsx';

export default function PublicNavbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const navLinks = [
    { name: 'Scholarships', path: '/schemes' },
    { name: 'Student Services', path: '/services' },
    { name: 'Career Guidance', path: '/career' },
    { name: 'Results', path: '/results-public' },
    { name: 'Become A Partner', path: '/partner' },
    { name: 'Education Loan Support', path: '/loan' },
    { name: 'Online Degrees', path: '/degrees' },
    { name: 'Articles', path: '/articles' },
  ];

  const exploreItems = [
    { name: 'Browse Schemes', desc: 'Find active scholarship listings', path: '/schemes', icon: '🎓' },
    { name: 'Eligibility Check', desc: 'Verify eligibility metrics', path: '/eligibility', icon: '🎯' },
    { name: 'Document Vault', desc: 'Securely store documents', path: '/vault', icon: '📁' },
    { name: 'AI Hub Simulator', desc: 'Test AI OCR scanning', path: '/ai-hub', icon: '✨' },
    { name: 'Support Program', desc: 'Scholarship guidance 2026-27', path: '/support-programme', icon: '🎗️' },
    { name: 'Student Services', desc: 'Mentoring & counselling', path: '/services', icon: '🤝' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-base tracking-tight">
              Uni<span className="text-primary-600">Scholar</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[12px] xl:text-[13px] font-bold px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                    : 'text-gray-600 dark:text-slate-350 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            
            {/* User State Navigation */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-primary-500" />
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-2.5 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {/* Explore Button with Grid Icon */}
            <div className="relative">
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`text-xs font-extrabold flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                  exploreOpen
                    ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-950/30 dark:border-primary-900'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Explore
              </button>

              {exploreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExploreOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 shadow-2xl rounded-2xl p-4 grid grid-cols-1 gap-2.5 z-50 animate-slide-up">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Quick Links</div>
                    {exploreItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors group"
                      >
                        <div className="text-xl bg-gray-50 dark:bg-slate-900 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Buddy4Study style yellow highlighted Programme Badge Button */}
            <Link
              to="/support-programme"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider uppercase px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 duration-200 border-l-4 border-amber-600"
            >
              <span>SUPPORT PROGRAMME 2026-27</span>
            </Link>

            {isAuthenticated && (
              <div className="ml-1">
                <Avatar name={user?.name || 'U'} size="sm" src={user?.avatar} />
              </div>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              to="/support-programme"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              SUPPORT
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-350"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 flex items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
