import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Star, Sparkles, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const location = useLocation();
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  const coverImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : defaultImage;
  const rating = Number(hotel.rating?.average) || 0;
  const reviewCount = Number(hotel.rating?.count) || 0;
  const startingPrice = Number(hotel.startingPrice) || 0;
  const locationText = [hotel.location?.address, hotel.location?.city].filter(Boolean).join(', ');
  const hotelUrl = `/hotels/${hotel._id}${location.search}`;

  return (
    <div className="hotel-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col group">
      <div className="hotel-card-media relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
        
        {hotel.location?.city && (
          <div className="hotel-location-badge absolute bottom-3 left-3 rounded-full border border-slate-700/60 bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span>{hotel.location.city}</span>
          </div>
        )}

        {rating > 0 && (
          <div className="hotel-rating-badge absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold text-ink shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
        <div>
          {locationText && <p className="mb-2 truncate text-xs text-slate-500">{locationText}</p>}
          <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-cyan-400">
            {hotel.name}
          </h3>
          {reviewCount > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {rating > 0 && <span className="font-semibold text-slate-700">{rating.toFixed(1)}</span>}
              <span>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
            </p>
          )}
          {hotel.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {hotel.description}
            </p>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-800 px-2.5 py-1 text-xs text-slate-600"
                >
                  <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="rounded-md bg-slate-800/60 px-2 py-1 text-xs text-slate-500">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-slate-800/80 pt-4">
          <div>
            <span className="block text-xs font-medium text-slate-500">{startingPrice > 0 ? 'Starting from' : 'Room rates'}</span>
            {startingPrice > 0 ? (
              <p className="mt-0.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-cyan-400">${startingPrice}</span>
                <span className="text-xs text-slate-500">/ night</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm font-semibold text-slate-700">See room options</p>
            )}
          </div>

          <Link
            to={hotelUrl}
            className="hotel-card-cta inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:opacity-95"
          >
            <span>View stay</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default HotelCard;
