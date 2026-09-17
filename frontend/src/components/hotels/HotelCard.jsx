import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Sparkles, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  const coverImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : defaultImage;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col group">
      
      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
        
        {/* City Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-slate-700/60 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          <span>{hotel.location?.city || 'Nepal'}</span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-950 flex items-center gap-1 shadow-lg">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>{hotel.rating?.average ? hotel.rating.average.toFixed(1) : '4.8'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="truncate">{hotel.location?.address}</span>
            <span className="text-slate-500">({hotel.rating?.count || 12} reviews)</span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {hotel.name}
          </h3>

          <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {hotel.description}
          </p>

          {/* Key Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1"
                >
                  <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-cyan-400">
                ${hotel.startingPrice > 0 ? hotel.startingPrice : 50}
              </span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <Link
            to={`/hotels/${hotel._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Book Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default HotelCard;
