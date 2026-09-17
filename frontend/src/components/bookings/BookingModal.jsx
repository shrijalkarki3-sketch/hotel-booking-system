import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkAvailability, createBooking } from '../../services/bookingService';
import { 
  Calendar, 
  Users, 
  Bed, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

const BookingModal = ({ hotel, room, initialCheckIn, initialCheckOut, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Get tomorrow date as default checkIn if not provided
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return {
      checkIn: initialCheckIn || tomorrow.toISOString().split('T')[0],
      checkOut: initialCheckOut || dayAfter.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Availability & State
  const [availState, setAvailState] = useState({ checking: false, available: null, message: '', pricing: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Perform availability check on date change
  const verifyAvailability = async (cIn, cOut) => {
    if (!cIn || !cOut) return;
    setAvailState({ checking: true, available: null, message: '', pricing: null });
    setErrorMsg('');

    try {
      const res = await checkAvailability({
        roomId: room._id,
        checkIn: cIn,
        checkOut: cOut,
      });

      if (res.success) {
        setAvailState({
          checking: false,
          available: res.available,
          message: res.message,
          pricing: res.data,
        });
      } else {
        setAvailState({ checking: false, available: false, message: res.message, pricing: null });
      }
    } catch (err) {
      setAvailState({
        checking: false,
        available: false,
        message: err.response?.data?.message || 'Date availability verification failed',
        pricing: null,
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      verifyAvailability(checkIn, checkOut);
    }
  }, [checkIn, checkOut, room._id, isAuthenticated]);

  const handleConfirmBooking = async () => {
    setErrorMsg('');
    if (!isAuthenticated) {
      navigate(`/login?redirect=/hotels/${hotel._id}`);
      return;
    }

    if (!availState.available) {
      setErrorMsg('Cannot book room - Dates are unavailable or invalid');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        hotelId: hotel._id,
        roomId: room._id,
        checkIn,
        checkOut,
        guests: { adults, children },
      });

      if (res.success) {
        onClose();
        // Redirect to booking receipt page
        navigate(`/my-bookings/${res.data._id}?confirmed=true`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Booking submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bed className="h-4 w-4" />
            <span>Confirm Room Reservation</span>
          </div>
          <h2 className="text-xl font-bold text-white">{hotel.name}</h2>
          <p className="text-xs text-slate-400">{room.roomType} Room (#{room.roomNumber})</p>
        </div>

        {/* Unauthenticated User Notice */}
        {!isAuthenticated ? (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Authentication Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                You must sign in to your customer account to check live room availability and confirm this reservation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/login?redirect=/hotels/${hotel._id}`)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-cyan-400" />
                  Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-cyan-400" />
                  Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Guest Count Selection */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3 text-cyan-400" />
                  Adults (Max {room.capacity?.adults})
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {[...Array(room.capacity?.adults || 2)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Adult{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Children
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                </select>
              </div>
            </div>

            {/* Live Availability Status Indicator */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                {availState.checking ? (
                  <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : availState.available ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={availState.available ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {availState.checking ? 'Verifying dates availability...' : availState.message}
                </span>
              </div>
            </div>

            {/* Price Breakdown Calculation */}
            {availState.pricing && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Rate per night</span>
                  <span className="text-white">${availState.pricing.pricePerNight}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Stay Duration</span>
                  <span className="text-white">{availState.pricing.numberOfNights} Night(s)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Calculated Total Amount</span>
                  <span className="text-cyan-400 text-lg">${availState.pricing.totalAmount}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!availState.available || isSubmitting || availState.checking}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Server-validated room rates & overlap protection active</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
