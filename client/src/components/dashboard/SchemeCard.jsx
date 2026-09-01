import { useState } from 'react';
import { Bookmark, ExternalLink, Calendar } from 'lucide-react';
import { Badge } from '../ui/index.jsx';
import { userAPI, applicationAPI } from '../../services/api';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../../utils/deadline.utils';
import { showToast } from '../../utils/toastQueue';

const CATEGORY_COLORS = {
  General:  'primary',
  SC:       'warning',
  ST:       'warning',
  OBC:      'gray',
  Minority: 'success',
  All:      'gray',
};

// Reusable helper to validate and open official website in new tab
export const handleOfficialWebsite = (scheme, e) => {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }

  if (!scheme) return;

  const url = (scheme.applicationLink || scheme.officialUrl || scheme.officialLink || '').trim();

  if (!url) {
    showToast('Official application website is currently unavailable.', 'error');
    return;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid URL');
    }
    window.open(parsed.href, '_blank', 'noopener,noreferrer');
  } catch (err) {
    showToast('Official application website is unavailable.', 'error');
  }
};

export default function SchemeCard({ scheme, showEligibility = false, onViewDetails, onApplyInternal, isApplied = false }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isAppliedState, setIsAppliedState] = useState(isApplied);
  const [applying, setApplying] = useState(false);

  const deadlineStatus = getDeadlineStatus(scheme);
  const daysRemaining = getDaysRemaining(scheme);
  const formattedLastDate = formatDate(scheme);
  const expired = isExpired(scheme);

  const rawUrl = (scheme?.applicationLink || scheme?.officialUrl || scheme?.officialLink || '').trim();
  let hasValidOfficialUrl = false;
  if (rawUrl) {
    try {
      const p = new URL(rawUrl);
      hasValidOfficialUrl = p.protocol === 'http:' || p.protocol === 'https:';
    } catch {
      hasValidOfficialUrl = false;
    }
  }

  const handleBookmark = async (e) => {
    e.stopPropagation();
    setBookmarking(true);
    try {
      const { data } = await userAPI.toggleBookmark(scheme._id);
      setBookmarked(data.bookmarked);
      showToast(data.message || 'Bookmark updated', 'success');
    } catch {
      showToast('Failed to update bookmark', 'error');
    } finally {
      setBookmarking(false);
    }
  };

  const handleApplyClick = async (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }

    if (onApplyInternal) {
      onApplyInternal(scheme, e);
      return;
    }

    const token = localStorage.getItem('uss_token');
    if (!token) {
      showToast('Please sign in to your student account to apply.', 'info');
      window.location.href = '/login';
      return;
    }

    try {
      setApplying(true);
      await applicationAPI.upsert({
        schemeId: scheme._id,
        status: 'Submitted'
      });
      setIsAppliedState(true);
      showToast(`✓ Application for "${scheme.name}" submitted successfully! Track status in My Applications.`, 'success');
      setTimeout(() => {
        window.location.href = '/applications';
      }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application. Please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className={`
        card card-hover relative overflow-hidden flex flex-col justify-between gap-3 p-4 rounded-2xl bg-gray-50/60 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-700 shadow-sm
        ${showEligibility && scheme.eligible ? 'scheme-card-eligible' : ''}
        ${showEligibility && scheme.eligible === false ? 'scheme-card-ineligible' : ''}
        ${expired ? 'opacity-90 border-red-500/30' : ''}
      `}
      onClick={() => onViewDetails?.(scheme)}
    >
      <div>
        {/* Top row badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={CATEGORY_COLORS[scheme.category] || 'gray'}>{scheme.category}</Badge>
            
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${deadlineStatus.badgeClass}`}>
              {deadlineStatus.label}
            </span>

            {showEligibility && scheme.matchScore !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scheme.eligible ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                {scheme.matchScore}% Match
              </span>
            )}
          </div>

          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className={`p-1.5 rounded-lg transition-all duration-150 flex-shrink-0 ${
              bookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'text-gray-300 dark:text-slate-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
            title="Save Scholarship"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1">
          {scheme.name}
        </h4>

        {/* Description */}
        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {scheme.shortDescription || scheme.description}
        </p>

        {/* Deadline Info Row */}
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 text-xs flex justify-between items-center font-mono">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-350">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-[10px]">{formattedLastDate}</span>
          </div>
          <div className="text-[10px] font-bold">
            <span className={expired ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>{daysRemaining}</span>
          </div>
        </div>

        {/* Ineligibility reasons */}
        {showEligibility && scheme.eligible === false && (scheme.reasons?.length > 0 || scheme.rejectionReasons?.length > 0) && (
          <div className="bg-red-50/60 dark:bg-red-950/30 rounded-xl p-2 border border-red-100 dark:border-red-900/30 mt-2">
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-0.5">Missing Requirements:</p>
            {(scheme.reasons || scheme.rejectionReasons).slice(0, 1).map((r, i) => (
              <p key={i} className="text-[10px] text-red-500 dark:text-red-400 truncate">• {r}</p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions — 3 DISTINCT BUTTONS */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-slate-700/80 mt-auto gap-1.5 flex-wrap">
        <div className="min-w-0">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block truncate">{scheme.amount}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* 1. View Details */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewDetails?.(scheme); }}
            className="btn btn-ghost px-2 py-1 text-[11px] font-bold text-gray-500 dark:text-slate-400 hover:text-white"
          >
            Details
          </button>

          {/* 2. Apply (Internal UniScholar Action) */}
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={expired || isAppliedState || applying}
            className={`btn px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 ${
              isAppliedState
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : expired
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'btn-primary shadow-sm'
            }`}
          >
            {applying ? 'Submitting...' : isAppliedState ? 'Applied ✓' : expired ? 'Closed' : 'Apply'}
          </button>

          {/* 3. Official Website (External Link) */}
          <button
            type="button"
            title={`Open official website for ${scheme.name}`}
            aria-label={`Open official website for ${scheme.name}`}
            onClick={(e) => handleOfficialWebsite(scheme, e)}
            disabled={!hasValidOfficialUrl}
            className={`btn border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-200 px-2 py-1 text-[11px] font-bold flex items-center gap-1 rounded-lg ${
              !hasValidOfficialUrl ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            Official ↗
          </button>
        </div>
      </div>
    </div>
  );
}
