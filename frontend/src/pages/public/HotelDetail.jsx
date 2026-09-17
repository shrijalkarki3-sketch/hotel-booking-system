import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getHotelById } from '../../services/hotelService';
import RoomCard from '../../components/rooms/RoomCard';
import BookingModal from '../../components/bookings/BookingModal';
import ReviewList from '../../components/reviews/ReviewList';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Car, 
  Utensils, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Building2, 
  Phone, 
  Mail,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Booking Parameters
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getHotelById(id);
        if (response.success) {
          setHotel(response.data);
        }
      } catch (err) {
        console.error('Error loading hotel details:', err);
        setError(err.response?.data?.message || 'Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const amenityIcons = {
    'wifi': <Wifi className="h-4 w-4 text-cyan-400" />,
    'breakfast': <Coffee className="h-4 w-4 text-amber-400" />,
    'tv': <Tv className="h-4 w-4 text-purple-400" />,
    'ac': <Wind className="h-4 w-4 text-blue-400" />,
    'air conditioning': <Wind className="h-4 w-4 text-blue-400" />,
    'parking': <Car className="h-4 w-4 text-emerald-400" />,
    'restaurant': <Utensils className="h-4 w-4 text-red-400" />,
  };

  const handleBookNow = () => {
    const availableRoom = hotel.rooms?.find((room) => room.status === 'available');
    if (!availableRoom) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/hotels/${id}`);
      return;
    }

    setSelectedRoom(availableRoom);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading hotel property catalog...</span>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-slate-400 text-xs mb-6">{error || 'The requested hotel property does not exist.'}</p>
        <Link to="/hotels" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-semibold text-xs">
          Back to Search Results
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div>
        
        {/* Navigation Breadcrumb */}
        <div className="bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/hotels" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Hotels Directory</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{hotel.location?.city}</span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{hotel.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Header Info Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                  Verified Property
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{hotel.rating?.average?.toFixed(1) || '4.8'}</span>
                  <span className="text-slate-500 font-normal">({hotel.rating?.count || 12} reviews)</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{hotel.name}</h1>
              <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5 mt-2">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country || 'Nepal'}</span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Starting Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">${hotel.cheapestPrice || 120}</span>
                  <span className="text-xs text-slate-400">/ night</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBookNow}
                disabled={!hotel.rooms?.some((room) => room.status === 'available')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Book Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 relative group">
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-80 sm:h-96">
              <div className="h-full rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={hotel.images?.[1] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                  alt="Gallery 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-full rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={hotel.images?.[2] || 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'}
                  alt="Gallery 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Description & Amenities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-xl font-bold text-white">About the Hotel</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{hotel.description}</p>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-3">Popular Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotel.amenities?.map((amenity, idx) => {
                      const icon = amenityIcons[amenity.toLowerCase()] || <ShieldCheck className="h-4 w-4 text-cyan-400" />;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          {icon}
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact & Policy Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 h-fit">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Hotel Information</h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{hotel.contact?.phone || '+977 61 460000'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{hotel.contact?.email || 'reservations@grandstay.com'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Free cancellation up to 48 hours before stay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Catalog Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    onSelect={(selectedRoomData) => {
                      if (!isAuthenticated) {
                        navigate(`/login?redirect=/hotels/${id}`);
                        return;
                      }
                      setSelectedRoom(selectedRoomData);
                      setShowBookingModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                No active room specifications currently listed for this hotel.
              </div>
            )}
          </div>

          {/* Booking Modal Trigger */}
          {showBookingModal && selectedRoom && (
            <BookingModal
              hotel={hotel}
              room={selectedRoom}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              onClose={() => setShowBookingModal(false)}
            />
          )}

          {/* Verified Stay Guest Reviews Section */}
          <ReviewList hotelId={id} />

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HotelDetail;
