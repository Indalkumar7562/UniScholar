import { Link } from 'react-router-dom';

export default function PortalSwitchFooter({ currentRole = 'student', currentMode = 'login' }) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-center font-sans text-xs animate-fade-in">
      
      {/* Subtle Divider */}
      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 h-px bg-slate-800/80" />
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Other Portals</span>
        <div className="flex-1 h-px bg-slate-800/80" />
      </div>

      {/* Options for Admin Page */}
      {currentRole === 'admin' && (
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>Are you a Scholarship Partner?</span>
            <div className="flex items-center gap-2 font-bold">
              <Link to="/partner/login" className="text-purple-400 hover:underline">Partner Login →</Link>
              <span className="text-slate-600">|</span>
              <Link to="/partner/register" className="text-purple-300 hover:underline">Create Partner Account →</Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span>Are you a Student?</span>
            <Link to="/login" className="text-blue-400 font-bold hover:underline">Student Login →</Link>
          </div>
        </div>
      )}

      {/* Options for Partner Page */}
      {currentRole === 'partner' && (
        <div className="space-y-1.5 text-[11px] text-slate-400">
          {currentMode === 'login' ? (
            <div className="flex items-center justify-center gap-1.5 text-purple-300 font-medium pb-0.5">
              <span>Need a partner account?</span>
              <Link to="/partner/register" className="text-purple-400 font-bold hover:underline">Create Partner Account →</Link>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-purple-300 font-medium pb-0.5">
              <span>Already registered as a partner?</span>
              <Link to="/partner/login" className="text-purple-400 font-bold hover:underline">Partner Login →</Link>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5">
            <span>Are you an Admin?</span>
            <Link to="/admin/login" className="text-blue-400 font-bold hover:underline">Admin Login →</Link>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span>Are you a Student?</span>
            <Link to="/login" className="text-blue-400 font-bold hover:underline">Student Login →</Link>
          </div>
        </div>
      )}

      {/* Options for Student Page */}
      {currentRole === 'student' && (
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>{currentMode === 'login' ? 'Are you a Scholarship Partner?' : 'Already a Scholarship Partner?'}</span>
            <div className="flex items-center gap-2 font-bold">
              <Link to="/partner/login" className="text-purple-400 hover:underline">Partner Login →</Link>
              <span className="text-slate-600">|</span>
              <Link to="/partner/register" className="text-purple-300 hover:underline">Create Partner Account →</Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span>{currentMode === 'login' ? 'Are you an Admin?' : 'Already an Admin?'}</span>
            <Link to="/admin/login" className="text-blue-400 font-bold hover:underline">Admin Login →</Link>
          </div>
        </div>
      )}

    </div>
  );
}
