import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getHotelById } from '../../services/hotelService';
import RoomCard from '../../components/rooms/RoomCard';
import BookingModal from '../../components/bookings/BookingModal';
import ReviewList from '../../components/reviews/ReviewList';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Star, ArrowLeft, CalendarDays, Users, Phone, Mail, ArrowRight, ImageOff } from 'lucide-react';

const HotelGalleryImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="hotel-gallery-placeholder h-full" role="img" aria-label={`${alt}: no photo available`}>
        <div className="flex flex-col items-center gap-2 text-xs">
          <ImageOff className="h-6 w-6" />
          <span>No photo available</span>
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
};

const formatStayDate = (value) => {
  if (!value) return 'Not selected';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const parsedGuests = parseInt(searchParams.get('guests'), 10);
  const guests = Number.isFinite(parsedGuests) ? Math.max(1, parsedGuests) : null;
  const hotelReturnPath = `/hotels/${id}${searchParams.size ? `?${searchParams.toString()}` : ''}`;
  const loginPath = `/login?${new URLSearchParams({ redirect: hotelReturnPath }).toString()}`;

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Booking Parameters
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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

  const handleBookNow = () => {
    const availableRoom = hotel.rooms?.find((room) => room.status === 'available');
    if (!availableRoom) return;

    if (!isAuthenticated) {
      navigate(loginPath);
      return;
    }

    setSelectedRoom(availableRoom);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="hotel-detail-page discovery-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Loading hotel details...</span>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="hotel-detail-page discovery-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <div className="hotel-empty-state w-full max-w-xl rounded-xl border p-8 sm:p-12">
          <h1 className="font-display text-3xl text-ink">{error ? 'Hotel details unavailable' : 'Hotel not found'}</h1>
          <p className="mt-3 text-sm text-slate-500">{error || 'This hotel may have been removed or is no longer available.'}</p>
          <Link to={`/hotels${searchParams.size ? `?${searchParams.toString()}` : ''}`} className="design-button results-search-button mx-auto mt-6 px-5 text-sm text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to hotels</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="hotel-detail-page discovery-page min-h-screen selection:bg-forest-100 selection:text-forest-900">
        
        {/* Navigation Breadcrumb */}
        <div className="bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <Link to={`/hotels${searchParams.size ? `?${searchParams.toString()}` : ''}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to results</span>
            </Link>
            <span className="hidden truncate text-sm text-slate-500 sm:block">{hotel.location?.city}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Header Info Banner */}
          <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                {Number(hotel.rating?.average) > 0 ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    {Number(hotel.rating.average).toFixed(1)}
                    {Number(hotel.rating?.count) > 0 && <span className="font-normal text-slate-500">({hotel.rating.count} reviews)</span>}
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">No guest rating yet</span>
                )}
                {Number(hotel.rating?.count) === 0 && <span className="text-sm text-slate-500">No reviews yet</span>}
              </div>
              <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl">{hotel.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{[hotel.location?.address, hotel.location?.city, hotel.location?.country].filter(Boolean).join(', ')}</span>
              </p>
              {(checkIn || checkOut || guests) && (
                <div className="detail-stay-summary mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 px-3 py-2.5 text-sm">
                  {(checkIn || checkOut) && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-forest-600" />
                      <span><span className="text-slate-500">Stay</span> <strong className="font-semibold text-ink">{formatStayDate(checkIn)} - {formatStayDate(checkOut)}</strong></span>
                    </div>
                  )}
                  {guests && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-forest-600" />
                      <span><strong className="font-semibold text-ink">{guests} {guests === 1 ? 'guest' : 'guests'}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="min-w-28">
                <span className="block text-xs font-medium text-slate-500">{Number(hotel.startingPrice) > 0 ? 'Rooms from' : 'Room rates'}</span>
                {Number(hotel.startingPrice) > 0
                  ? <p className="mt-0.5 text-2xl font-bold text-ink">${hotel.startingPrice}<span className="ml-1 text-xs font-normal text-slate-500">/ night</span></p>
                  : <p className="mt-0.5 text-sm font-semibold text-ink">See room options</p>}
              </div>
              <button
                type="button"
                onClick={handleBookNow}
                disabled={!hotel.rooms?.some((room) => room.status === 'available')}
                className="design-button results-search-button px-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Choose a room</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="hotel-gallery grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
            <div className="hotel-gallery-slot col-span-2 row-span-2 h-64 sm:h-80 md:h-[420px]">
              <HotelGalleryImage src={hotel.images?.[0]} alt={`${hotel.name} property`} />
            </div>
            <div className="hotel-gallery-slot h-36 sm:h-44 md:col-span-2 md:h-[203px]">
              <HotelGalleryImage src={hotel.images?.[1]} alt={`${hotel.name} gallery`} />
            </div>
            <div className="hotel-gallery-slot h-36 sm:h-44 md:col-span-2 md:h-[203px]">
              <HotelGalleryImage src={hotel.images?.[2]} alt={`${hotel.name} gallery`} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-5 lg:col-span-2" aria-labelledby="hotel-description-heading">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">About this stay</p>
                <h2 id="hotel-description-heading" className="mt-1 font-display text-2xl text-ink">The details</h2>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{hotel.description}</p>

              {hotel.amenities?.length > 0 && (
                <div className="border-t border-slate-800 pt-5">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Hotel amenities</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {(hotel.contact?.phone || hotel.contact?.email || hotel.contact?.website) && (
              <aside className="h-fit rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="border-b border-slate-800 pb-3 text-sm font-semibold text-ink">Contact</h3>
                <div className="space-y-3 pt-4 text-sm text-slate-600">
                  {hotel.contact?.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-400" />{hotel.contact.phone}</p>}
                  {hotel.contact?.email && <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0 text-cyan-400" />{hotel.contact.email}</p>}
                  {hotel.contact?.website && <a className="inline-flex items-center gap-2 text-forest-600 underline underline-offset-4" href={hotel.contact.website} target="_blank" rel="noreferrer">Visit website<ArrowRight className="h-4 w-4" /></a>}
                </div>
              </aside>
            )}
          </div>

          <section className="space-y-5" aria-labelledby="hotel-rooms-heading">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Choose your room</p>
                <h2 id="hotel-rooms-heading" className="mt-1 font-display text-2xl text-ink">Rooms at {hotel.name}</h2>
              </div>
              <p className="text-sm text-slate-500">
                {hotel.rooms?.filter((room) => room.status === 'available').length || 0} of {hotel.rooms?.length || 0} available
              </p>
            </div>
            {hotel.rooms?.length > 0 ? (
              <>
                {!hotel.rooms.some((room) => room.status === 'available') && (
                  <div className="hotel-empty-state rounded-xl border px-4 py-3 text-sm" role="status">
                    No rooms are currently available to book. The listed room details are shown for reference.
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {hotel.rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    onSelect={(selectedRoomData) => {
                      if (!isAuthenticated) {
                        navigate(loginPath);
                        return;
                      }
                      setSelectedRoom(selectedRoomData);
                      setShowBookingModal(true);
                    }}
                  />
                ))}
                </div>
              </>
            ) : (
              <div className="hotel-empty-state rounded-xl border p-8 text-center text-sm">
                No rooms are currently listed for this hotel.
              </div>
            )}
          </section>

          {/* Booking Modal Trigger */}
          {showBookingModal && selectedRoom && (
            <BookingModal
              hotel={hotel}
              room={selectedRoom}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={guests}
              returnTo={hotelReturnPath}
              onClose={() => setShowBookingModal(false)}
            />
          )}

          {/* Verified Stay Guest Reviews Section */}
          <ReviewList hotelId={id} ratingAverage={hotel.rating?.average} />

        </div>
      </main>
      <Footer />
    </>
  );
};

export default HotelDetail;
