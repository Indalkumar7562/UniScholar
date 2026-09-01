import { useState } from 'react';
import { Bookmark, ExternalLink, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Badge } from '../ui/index.jsx';
import { userAPI } from '../../services/api';
import { getDeadlineStatus, getDaysRemaining, formatDate, isExpired } from '../../utils/deadline.utils';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  General:  'primary',
  SC:       'warning',
  ST:       'warning',
  OBC:      'gray',
  Minority: 'success',
  All:      'gray',
};

export default function SchemeCard({ scheme, showEligibility = false, onViewDetails }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const deadlineStatus = getDeadlineStatus(scheme);
  const daysRemaining = getDaysRemaining(scheme);
  const formattedLastDate = formatDate(scheme);
  const expired = isExpired(scheme);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    setBookmarking(true);
    try {
      const { data } = await userAPI.toggleBookmark(scheme._id);
      setBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div
      className={`
        card card-hover relative overflow-hidden flex flex-col gap-3
        ${showEligibility && scheme.eligible ? 'scheme-card-eligible' : ''}
        ${showEligibility && scheme.eligible === false ? 'scheme-card-ineligible' : ''}
        ${expired ? 'opacity-90 border-red-500/30' : ''}
      `}
      onClick={() => onViewDetails?.(scheme)}
    >
      {/* Top row badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={CATEGORY_COLORS[scheme.category] || 'gray'}>{scheme.category}</Badge>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${deadlineStatus.badgeClass}`}>
            {deadlineStatus.label}
          </span>

          {showEligibility && scheme.matchScore !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scheme.eligible ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
              Profile Match: {scheme.matchScore}%
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
      <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">
        {scheme.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
        {scheme.shortDescription || scheme.description}
      </p>

      {/* Deadline Info Row */}
      <div className="p-2 rounded-xl bg-gray-50/60 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 text-xs flex justify-between items-center font-mono">
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-350">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-[11px]">{formattedLastDate}</span>
        </div>
        <div className="text-[11px] font-bold">
          <span className={expired ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>{daysRemaining}</span>
        </div>
      </div>

      {/* Ineligibility reasons */}
      {showEligibility && scheme.eligible === false && (scheme.reasons?.length > 0 || scheme.rejectionReasons?.length > 0) && (
        <div className="bg-red-50/60 dark:bg-red-900/20 rounded-xl p-2.5 border border-red-100 dark:border-red-900/30">
          <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-1">Missing Requirements:</p>
          {(scheme.reasons || scheme.rejectionReasons).slice(0, 2).map((r, i) => (
            <p key={i} className="text-[11px] text-red-500 dark:text-red-400">• {r}</p>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/80 mt-auto">
        <div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{scheme.amount}</span>
          <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1">/ {scheme.frequency}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails?.(scheme); }}
          className="btn btn-outline btn-sm text-xs py-1 px-3"
        >
          Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
