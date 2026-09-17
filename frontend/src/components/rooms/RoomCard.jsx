import React from 'react';
import { Users, Wifi, CheckCircle2, Sparkles, Bed, ArrowRight } from 'lucide-react';

const RoomCard = ({ room, onSelect, onSelectRoom, isSelected }) => {
  const defaultRoomImage = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
  const roomImg = room.images && room.images.length > 0 ? room.images[0] : defaultRoomImage;

  const handleBookClick = () => {
    if (onSelect) {
      onSelect(room);
    } else if (onSelectRoom) {
      onSelectRoom(room);
    }
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col md:flex-row ${
      isSelected 
        ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-950/10' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Room Image */}
      <div className="relative md:w-64 h-48 md:h-auto shrink-0 bg-slate-950">
        <img
          src={roomImg}
          alt={room.roomType}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-cyan-400 border border-slate-700 flex items-center gap-1">
          <Bed className="h-3.5 w-3.5" />
          <span>Room #{room.roomNumber} • {room.roomType}</span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{room.roomType} Room</span>
            </h4>
            
            {/* Capacity Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>{room.capacity?.adults} Adults {room.capacity?.children > 0 ? `, ${room.capacity.children} Child` : ''}</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            {room.description}
          </p>

          {/* Room Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Selection Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Rate per night</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-cyan-400">${room.pricePerNight}</span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookClick}
            disabled={room.status !== 'available'}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              room.status !== 'available'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isSelected
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
            }`}
          >
            {room.status !== 'available' ? (
              <span>Unavailable</span>
            ) : isSelected ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default RoomCard;
