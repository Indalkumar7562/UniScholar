// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sz = { sm: 'w-4 h-4 border-2', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-[3px]' };
  return (
    <span className={`${sz[size]} border-white/30 border-t-white rounded-full animate-spin inline-block ${className}`} />
  );
};

export const SpinnerBlue = ({ size = 'md', className = '' }) => {
  const sz = { sm: 'w-4 h-4 border-2', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-[3px]' };
  return (
    <span className={`${sz[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin inline-block ${className}`} />
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card flex flex-col gap-3">
    <SkeletonLine className="h-5 w-2/3" />
    <SkeletonLine className="h-3.5 w-full" />
    <SkeletonLine className="h-3.5 w-4/5" />
    <SkeletonLine className="h-3.5 w-3/5" />
    <div className="flex gap-2 mt-1">
      <SkeletonLine className="h-8 w-24 rounded-lg" />
      <SkeletonLine className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '?', size = 'md', className = '' }) => {
  const sz = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`avatar ${sz[size]} font-bold text-white flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'primary', className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>{children}</span>
);

// ─── Progress ─────────────────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, color = 'primary', className = '' }) => (
  <div className={`progress-bar ${className}`}>
    <div
      className="progress-fill"
      style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color === 'success' ? 'linear-gradient(90deg,#059669,#34d399)' : undefined,
      }}
    />
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-6 ${className}`}>
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-sub">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, accentColor = 'border-primary-500', bgColor = 'bg-primary-50 dark:bg-primary-900/20' }) => (
  <div className={`stat-card border-t-4 ${accentColor}`}>
    <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center text-xl mb-3`}>
      {icon}
    </div>
    <div className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-1">{value}</div>
    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</div>
  </div>
);

// ─── Page Loader ────────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-2xl animate-bounce">🎓</div>
      <SpinnerBlue size="lg" />
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Loading USS Portal…</p>
    </div>
  </div>
);
