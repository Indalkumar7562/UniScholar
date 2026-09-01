export const getDeadlineDate = (scheme) => {
  if (!scheme) return null;
  const rawDate = scheme.applicationDeadline || scheme.lastDateToApply;
  if (!rawDate) return null;
  return new Date(rawDate);
};

export const isExpired = (schemeOrDate) => {
  const date = schemeOrDate instanceof Date ? schemeOrDate : getDeadlineDate(schemeOrDate);
  if (!date || isNaN(date.getTime())) return false;
  
  // Set to end of day comparison
  const now = new Date();
  return date.getTime() < now.setHours(0, 0, 0, 0);
};

export const getDaysRemaining = (schemeOrDate) => {
  const date = schemeOrDate instanceof Date ? schemeOrDate : getDeadlineDate(schemeOrDate);
  if (!date || isNaN(date.getTime())) return 'No Deadline Specified';

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '🔴 Deadline Passed';
  if (diffDays === 0) return '⚠ Deadline Today';
  if (diffDays === 1) return '⚠ 1 day remaining';
  if (diffDays <= 7) return `⚠ ${diffDays} days remaining`;
  return `⏰ ${diffDays} days remaining`;
};

export const getDeadlineStatus = (schemeOrDate) => {
  const date = schemeOrDate instanceof Date ? schemeOrDate : getDeadlineDate(schemeOrDate);
  if (!date || isNaN(date.getTime())) {
    return {
      label: 'Applications Open',
      color: 'emerald',
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      isOpen: true,
    };
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Application Closed',
      color: 'red',
      badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
      isClosed: true,
      isExpired: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: 'Urgent — Apply Soon',
      color: 'red',
      badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
      isUrgent: true,
    };
  }

  if (diffDays <= 15) {
    return {
      label: 'Deadline Approaching',
      color: 'amber',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      isApproaching: true,
    };
  }

  return {
    label: 'Applications Open',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    isOpen: true,
  };
};

export const formatDate = (schemeOrDate) => {
  const date = schemeOrDate instanceof Date ? schemeOrDate : getDeadlineDate(schemeOrDate);
  if (!date || isNaN(date.getTime())) return '30 September 2026';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
