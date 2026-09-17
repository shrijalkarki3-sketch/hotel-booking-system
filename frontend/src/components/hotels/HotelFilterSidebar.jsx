import React, { useState } from 'react';
import { Filter, RotateCcw, Star, DollarSign, Sparkles, Building, Users } from 'lucide-react';

const AMENITY_OPTIONS = [
  'Free WiFi',
  'Swimming Pool',
  'Spa & Wellness',
  'Mountain View',
  'Free Breakfast',
  '24/7 Room Service',
  'Jungle Safari',
  'Fitness Center',
  'Parking',
];

const ROOM_TYPES = ['Single', 'Double', 'Deluxe', 'Suite', 'Family'];

const HotelFilterSidebar = ({ filters, onFilterChange, onResetFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = localFilters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];

    handleInputChange('amenities', updatedAmenities);
  };

  const handleReset = () => {
    const resetState = {
      search: '',
      city: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      roomType: '',
      guests: '',
      amenities: [],
    };
    setLocalFilters(resetState);
    onResetFilters();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Filter className="h-4 w-4 text-cyan-400" />
          <span>Filter Hotels</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Location / Destination Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Building className="h-3.5 w-3.5 text-cyan-400" />
          Destination / City
        </label>
        <select
          value={localFilters.city || ''}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Locations</option>
          <option value="Pokhara">Pokhara</option>
          <option value="Kathmandu">Kathmandu</option>
          <option value="Nagarkot">Nagarkot</option>
          <option value="Chitwan">Chitwan</option>
          <option value="Lalitpur">Lalitpur (Patan)</option>
          <option value="Bhaktapur">Bhaktapur</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
          Price per Night ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ($)"
            value={localFilters.priceMin || ''}
            onChange={(e) => handleInputChange('priceMin', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
          />
          <input
            type="number"
            placeholder="Max ($)"
            value={localFilters.priceMax || ''}
            onChange={(e) => handleInputChange('priceMax', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-400" />
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {['', '3', '4', '4.5'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleInputChange('rating', r)}
              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                localFilters.rating === r
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {r === '' ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Room Type
        </label>
        <select
          value={localFilters.roomType || ''}
          onChange={(e) => handleInputChange('roomType', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Any Room Type</option>
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Guest Capacity */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-cyan-400" />
          Minimum Guests
        </label>
        <select
          value={localFilters.guests || ''}
          onChange={(e) => handleInputChange('guests', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Any Capacity</option>
          <option value="1">1+ Guest</option>
          <option value="2">2+ Guests</option>
          <option value="3">3+ Guests</option>
          <option value="4">4+ Guests</option>
        </select>
      </div>

      {/* Amenities Checklist */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Hotel Amenities
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {AMENITY_OPTIONS.map((amenity) => {
            const isChecked = (localFilters.amenities || []).includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-3.5 w-3.5"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default HotelFilterSidebar;
