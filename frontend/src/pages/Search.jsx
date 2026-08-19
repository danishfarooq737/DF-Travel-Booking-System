import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTravel } from '../api/travel.js';
import TravelCard from '../components/travel/TravelCard.jsx';
import TravelCardSkeleton from '../components/travel/TravelCardSkeleton.jsx';
import SearchFilters from '../components/travel/SearchFilters.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import useDebounce from '../hooks/useDebounce.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const emptyFilters = { destination: '', travelType: '', minPrice: '', maxPrice: '', travelers: '', dateFrom: '', dateTo: '' };

export default function Search() {
  useDocumentTitle('Search trips');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...emptyFilters, destination: searchParams.get('destination') || '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], pagination: { totalPages: 1 } });
  const [status, setStatus] = useState('loading'); // loading | success | error

  const debouncedDestination = useDebounce(appliedFilters.destination, 350);

  const load = useCallback(() => {
    setStatus('loading');
    const params = { ...appliedFilters, destination: debouncedDestination, page, limit: 9 };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });

    searchTravel(params)
      .then((res) => {
        setResult(res.data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, debouncedDestination, page]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
    if (filters.destination) setSearchParams({ destination: filters.destination });
    else setSearchParams({});
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setSearchParams({});
  };

  const { items, pagination } = result;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="eyebrow">Search results</p>
        <h1 className="mt-1 text-3xl font-semibold">Find your next trip</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <SearchFilters filters={filters} onChange={setFilters} onSubmit={applyFilters} onReset={resetFilters} />

        <div>
          {status === 'loading' && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <TravelCardSkeleton key={i} />)}
            </div>
          )}

          {status === 'error' && <ErrorState onRetry={load} />}

          {status === 'success' && items.length === 0 && (
            <EmptyState
              title="No trips match your search"
              description="Try widening your price range, clearing filters, or searching a different destination."
              action={<button onClick={resetFilters} className="btn-outline">Clear filters</button>}
            />
          )}

          {status === 'success' && items.length > 0 && (
            <>
              <p className="mb-4 text-sm text-navy-400">{pagination.total} trip{pagination.total === 1 ? '' : 's'} found</p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((t) => <TravelCard key={t._id} travel={t} />)}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    className="btn-outline !px-3 !py-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-navy-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn-outline !px-3 !py-2"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
