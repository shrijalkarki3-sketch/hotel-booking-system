import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHotels } from '../../services/hotelService';
import HotelCard from '../../components/hotels/HotelCard';
import HotelFilterSidebar from '../../components/hotels/HotelFilterSidebar';
import Footer from '../../components/common/Footer';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Frown,
  Building2,
  MapPin,
  CalendarDays,
  Users,
  AlertCircle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Dates not selected';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getFiltersFromParams = (params) => ({
  search: params.get('search') || '',
  city: params.get('city') || '',
  checkIn: params.get('checkIn') || '',
  checkOut: params.get('checkOut') || '',
  priceMin: params.get('priceMin') || '',
  priceMax: params.get('priceMax') || '',
  rating: params.get('rating') || '',
  roomType: params.get('roomType') || '',
  guests: params.get('guests') || '',
  amenities: params.get('amenities') ? params.get('amenities').split(',') : [],
  sort: params.get('sort') || 'rating',
  page: parseInt(params.get('page'), 10) || 1,
});

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getFiltersFromParams(searchParams));
  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const urlFilters = getFiltersFromParams(searchParams);
    setFilters((current) => (
      JSON.stringify(current) === JSON.stringify(urlFilters) ? current : urlFilters
    ));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const fetchFilteredHotels = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = { ...filters };
        if (Array.isArray(queryParams.amenities) && queryParams.amenities.length > 0) {
          queryParams.amenities = queryParams.amenities.join(',');
        } else {
          delete queryParams.amenities;
        }

        const res = await getHotels(queryParams);
        if (!res.success) {
          throw new Error(res.message || 'We could not load hotels right now.');
        }

        if (!active) return;
        setHotels(Array.isArray(res.data) ? res.data : []);
        setPagination({
          page: res.pagination?.page || filters.page,
          totalPages: res.pagination?.totalPages || 1,
          total: res.total ?? res.pagination?.total ?? res.count ?? 0,
        });
      } catch (err) {
        console.error('Error fetching search results:', err);
        if (active) {
          setHotels([]);
          setPagination({ page: filters.page, totalPages: 1, total: 0 });
          setError(err.response?.data?.message || err.message || 'We could not load hotels right now.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFilteredHotels();
    return () => {
      active = false;
    };
  }, [filters, retryCount]);

  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    const updated = { ...filters, sort: sortVal, page: 1 };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const updated = { ...filters, page: 1 };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      city: '',
      checkIn: '',
      checkOut: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      roomType: '',
      guests: '',
      amenities: [],
      sort: 'rating',
      page: 1,
    };
    setFilters(reset);
    setSearchParams({});
  };

  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val !== '' && val !== null && val !== undefined) {
        if (Array.isArray(val) && val.length > 0) {
          params.set(key, val.join(','));
        } else if (!Array.isArray(val)) {
          params.set(key, val);
        }
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    updateUrlParams(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <main className="hotel-results-page discovery-page min-h-screen">
        <section className="results-search-band border-b border-slate-800 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Find your next stay</p>
              <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Hotels made for your journey</h1>
            </div>
            <form onSubmit={handleSearchSubmit} className="results-search-form flex flex-col gap-3 sm:flex-row">
              <label className="results-search-input relative flex-1">
                <span className="sr-only">Search hotels by name, city, or address</span>
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hotels by name, city, or address..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500"
                />
              </label>
              <button
                type="submit"
                className="design-button results-search-button px-6 text-sm text-white"
              >
                <Search className="h-4 w-4" />
                <span>Search stays</span>
              </button>
            </form>
            <div className="search-summary mt-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 sm:grid-cols-3 sm:gap-0 sm:p-0">
              <div className="summary-item flex items-center gap-3 px-3 py-2 sm:px-4">
                <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                <div className="min-w-0">
                  <span className="summary-label block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Destination</span>
                  <span className="block truncate text-sm font-medium text-white">{filters.city || filters.search || 'All destinations'}</span>
                </div>
              </div>
              <div className="summary-item flex items-center gap-3 border-slate-800 px-3 py-2 sm:border-l sm:px-4">
                <CalendarDays className="h-4 w-4 shrink-0 text-cyan-400" />
                <div>
                  <span className="summary-label block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Your dates</span>
                  <span className="block text-sm font-medium text-white">
                    {filters.checkIn || filters.checkOut
                      ? `${formatDate(filters.checkIn)} - ${formatDate(filters.checkOut)}`
                      : 'Dates not selected'}
                  </span>
                </div>
              </div>
              <div className="summary-item flex items-center gap-3 border-slate-800 px-3 py-2 sm:border-l sm:px-4">
                <Users className="h-4 w-4 shrink-0 text-cyan-400" />
                <div>
                  <span className="summary-label block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Guests</span>
                  <span className="block text-sm font-medium text-white">
                    {filters.guests
                      ? `${filters.guests} ${filters.guests === '1' ? 'guest' : 'guests'}`
                      : 'Guest count not selected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="results-toolbar mb-6 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span>Stays for every kind of trip</span>
              </h2>
              <p className="mt-1 text-sm text-slate-400" aria-live="polite">
                {loading ? 'Finding available stays...' : error ? 'Search results unavailable' : `${pagination.total} ${pagination.total === 1 ? 'stay' : 'stays'} found`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                aria-expanded={mobileFilterOpen}
                aria-controls="hotel-filter-panel"
                className="design-button filter-toggle border border-slate-800 bg-slate-900 px-4 text-sm font-semibold text-slate-200 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span>{mobileFilterOpen ? 'Hide filters' : 'Filters'}</span>
              </button>

              <label className="sort-control flex min-h-11 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm">
                <ArrowUpDown className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-500">Sort</span>
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  aria-label="Sort hotels"
                  className="min-w-0 cursor-pointer bg-transparent py-2 font-semibold text-white focus:outline-none"
                >
                  <option value="rating" className="bg-slate-950">Highest Rated</option>
                  <option value="price_asc" className="bg-slate-950">Price: Low to High</option>
                  <option value="price_desc" className="bg-slate-950">Price: High to Low</option>
                  <option value="name" className="bg-slate-950">Hotel Name (A-Z)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="results-layout grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
            <div
              id="hotel-filter-panel"
              className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 lg:block`}
            >
              <HotelFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>

            <div className="min-w-0 lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="Loading hotels" aria-busy="true">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="hotel-loading-skeleton h-80 rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="hotel-error-state my-4 rounded-xl border p-8 text-center" role="alert">
                  <AlertCircle className="mx-auto mb-3 h-9 w-9" />
                  <h3 className="text-lg font-bold">Hotels could not be loaded</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="design-button results-search-button mt-5 px-5 text-sm text-white"
                  >
                    Try again
                  </button>
                </div>
              ) : hotels.length === 0 ? (
                <div className="hotel-empty-state my-4 rounded-xl border p-8 text-center sm:p-12">
                  <Frown className="mx-auto mb-4 h-10 w-10" />
                  <h3 className="text-xl font-bold">No stays match these filters</h3>
                  <p className="mx-auto mb-6 mt-2 max-w-md text-sm">
                    Adjust your destination, dates, price, or amenities and search again.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="design-button results-search-button mx-auto px-5 text-sm text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Clear filters</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {hotels.map((hotel) => (
                      <HotelCard key={hotel._id} hotel={hotel} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-2 border-t border-slate-800 pt-6" aria-label="Hotel results pages">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="design-button border border-slate-800 bg-slate-900 px-4 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <span className="px-3 text-sm font-semibold text-slate-500" aria-live="polite">
                        Page {filters.page} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= pagination.totalPages}
                        className="design-button border border-slate-800 bg-slate-900 px-4 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>

          </div>

        </section>

      </main>
      <Footer />
    </>
  );
};

export default SearchResults;
