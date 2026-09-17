import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHotels, getPopularDestinations } from '../../services/hotelService';
import HotelCard from '../../components/hotels/HotelCard';
import Footer from '../../components/common/Footer';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Star,
  Award,
  Compass,
  CheckCircle2
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Hero Search State
  const [searchLocation, setSearchLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  // Dynamic Data State
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hotelsRes, destRes] = await Promise.all([
          getHotels({ limit: 6, sort: 'rating' }),
          getPopularDestinations(),
        ]);
        if (hotelsRes.success) setFeaturedHotels(hotelsRes.data);
        if (destRes.success) setDestinations(destRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('search', searchLocation);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div>
        
        {/* Hero Section */}
        <section className="relative min-h-[580px] flex items-center justify-center pt-12 pb-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-5xl mx-auto w-full text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-cyan-400 text-xs font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Luxury Stays Across Nepal & Beyond</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Discover & Book Exceptional Luxury Hotels
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore handpicked heritage boutique hotels, lakeside resorts, and mountain sanctuaries with verified real-time availability and transparent pricing.
            </p>

            {/* Interactive Hotel Search Bar */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-2xl backdrop-blur-xl max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                
                {/* Destination Input */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    Destination / City
                  </label>
                  <input
                    type="text"
                    placeholder="Pokhara, Kathmandu..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-transparent text-white text-xs font-medium focus:outline-none placeholder-slate-500"
                  />
                </div>

                {/* Check-In Date */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-cyan-400" />
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-white text-xs font-medium focus:outline-none text-slate-300"
                  />
                </div>

                {/* Check-Out Date */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-cyan-400" />
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-white text-xs font-medium focus:outline-none text-slate-300"
                  />
                </div>

                {/* Guests & Search Button */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3 text-cyan-400" />
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-transparent text-white text-xs font-medium focus:outline-none"
                    >
                      <option value="1" className="bg-slate-950">1 Guest</option>
                      <option value="2" className="bg-slate-950">2 Guests</option>
                      <option value="3" className="bg-slate-950">3 Guests</option>
                      <option value="4" className="bg-slate-950">4+ Guests</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="h-full px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex flex-col items-center justify-center gap-1 transition-all shrink-0"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        </section>

        {/* Popular Destinations Grid */}
        {destinations.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">Top Locations</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Popular Destinations</h2>
              </div>
              <Link to="/hotels" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>View All Locations</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations.map((dest, index) => (
                <Link
                  key={index}
                  to={`/hotels?city=${encodeURIComponent(dest.city)}`}
                  className="group relative h-44 rounded-2xl overflow-hidden shadow-lg border border-slate-800 hover:border-cyan-500/50 transition-all"
                >
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{dest.city}</h3>
                    <p className="text-[11px] text-slate-400">{dest.count} Hotel{dest.count > 1 ? 's' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Hotels Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">Handpicked Selection</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Luxury Hotels</h2>
            </div>
            <Link to="/hotels" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Explore All Hotels</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </section>

        {/* Why Choose GrandStay Highlights */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Why Book With GrandStay</h2>
            <p className="text-slate-400 text-sm">Designed to provide a modern, transparent, and seamless hotel reservation experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Real-Time Availability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct date-range validation against backend MongoDB indexes ensures zero double bookings.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only customers with completed bookings can leave ratings and reviews, guaranteeing authentic feedback.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Transparent Nightly Rates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Backend calculated room pricing with no hidden fees or client-side price tampering.
              </p>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Home;
