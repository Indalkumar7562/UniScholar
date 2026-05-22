import { useState } from 'react';
import { Bookmark, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../ui/index.jsx';
import { userAPI } from '../../services/api';
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
      `}
      onClick={() => onViewDetails?.(scheme)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={CATEGORY_COLORS[scheme.category] || 'gray'}>{scheme.category}</Badge>
          {showEligibility && scheme.eligible === true && (
            <Badge variant="success">
              <CheckCircle className="w-3 h-3" /> Eligible
            </Badge>
          )}
          {showEligibility && scheme.eligible === false && (
            <Badge variant="danger">
              <XCircle className="w-3 h-3" /> Not Eligible
            </Badge>
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

      {/* Ineligibility reasons */}
      {showEligibility && scheme.eligible === false && scheme.reasons?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Why not eligible:</p>
          {scheme.reasons.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-red-500 dark:text-red-400">• {r}</p>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700 mt-auto">
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
