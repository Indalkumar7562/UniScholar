import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemeAPI } from '../services/api';
import { SectionHeader, SkeletonCard, EmptyState } from '../components/ui/index.jsx';
import SchemeCard from '../components/dashboard/SchemeCard.jsx';
import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'SC', 'ST', 'OBC', 'Minority'];

export default function SchemesPage() {
  const navigate              = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('deadline');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (sort) params.sort = sort;
      if (statusFilter !== 'All') params.status = statusFilter;

      const { data } = await schemeAPI.getAll(params);
      setSchemes(data.schemes);
      setPagination(data.pagination);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  }, [search, category, sort, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, category, sort, statusFilter]);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Browse Schemes"
        subtitle={`${pagination.total || 0} active government and corporate scholarship schemes`}
      />

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10 text-sm"
            placeholder="Search by scheme name, provider, keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="select text-xs font-semibold py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
          >
            <option value="deadline">⏰ Closest Deadline</option>
            <option value="deadline_desc">📅 Latest Deadline</option>
            <option value="amount">💰 Highest Amount</option>
            <option value="newest">✨ Newest First</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select text-xs font-semibold py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
          >
            <option value="All">All Statuses</option>
            <option value="Active">🟢 Applications Open</option>
            <option value="Expired">🔴 Closed / Expired</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1" />
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip ${category === c ? 'chip-active' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : schemes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No schemes found"
          description="Try adjusting your search or filters."
          action={<button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemes.map(s => (
              <SchemeCard
                key={s._id}
                scheme={s}
                onViewDetails={() => navigate(`/schemes/${s._id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`btn btn-sm ${n === page ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {n}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
