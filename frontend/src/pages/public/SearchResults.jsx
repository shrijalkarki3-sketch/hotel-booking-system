import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHotels } from '../../services/hotelService';
import HotelCard from '../../components/hotels/HotelCard';
import HotelFilterSidebar from '../../components/hotels/HotelFilterSidebar';
import Footer from '../../components/common/Footer';
import { Search, SlidersHorizontal, ArrowUpDown, Frown, Sparkles, Building2 } from 'lucide-react';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter State initialized from URL Query Params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    rating: searchParams.get('rating') || '',
    roomType: searchParams.get('roomType') || '',
    guests: searchParams.get('guests') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    sort: searchParams.get('sort') || 'rating',
    page: parseInt(searchParams.get('page'), 10) || 1,
  });

  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch hotels whenever filters or URL params change
  useEffect(() => {
    const fetchFilteredHotels = async () => {
      setLoading(true);
      try {
        const queryParams = { ...filters };
        if (Array.isArray(queryParams.amenities) && queryParams.amenities.length > 0) {
          queryParams.amenities = queryParams.amenities.join(',');
        } else {
          delete queryParams.amenities;
        }

        const res = await getHotels(queryParams);
        if (res.success) {
          setHotels(res.data);
          setPagination(res.pagination || { page: 1, totalPages: 1, total: res.count });
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredHotels();
  }, [filters]);

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
    updateUrlParams(updated);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      city: '',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div>
        
        {/* Header Search Section */}
        <section className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hotels by name, city, or address..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Search Results Workspace */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Controls Bar: Results Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span>Hotel Search Results</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {hotels.length} of {pagination.total || hotels.length} available hotels
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
              >
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span>Filters</span>
              </button>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="rating" className="bg-slate-950">Highest Rated</option>
                  <option value="price_asc" className="bg-slate-950">Price: Low to High</option>
                  <option value="price_desc" className="bg-slate-950">Price: High to Low</option>
                  <option value="name" className="bg-slate-950">Hotel Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Desktop Filter Sidebar */}
            <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
              <HotelFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Hotel Cards Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 4].map((n) => (
                    <div key={n} className="h-80 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : hotels.length === 0 ? (
                /* Empty Results State */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6">
                  <Frown className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Hotels Match Your Criteria</h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto mb-6">
                    Try adjusting your location, price range, or amenity filters to discover available hotels.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotels.map((hotel) => (
                      <HotelCard key={hotel._id} hotel={hotel} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-slate-800">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                      >
                        Previous
                      </button>

                      <span className="text-xs font-semibold text-slate-400 px-3">
                        Page {filters.page} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= pagination.totalPages}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

        </section>

      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
