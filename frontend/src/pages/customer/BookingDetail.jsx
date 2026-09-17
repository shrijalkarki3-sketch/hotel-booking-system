import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../services/bookingService';
import Footer from '../../components/common/Footer';
import { 
  Receipt, 
  MapPin, 
  Bed, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  ArrowLeft,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isJustConfirmed = searchParams.get('confirmed') === 'true';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getBookingById(id);
        if (res.success) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
        setError(err.response?.data?.message || 'Booking record not found');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async () => {
    setActionMsg({ type: '', text: '' });
    try {
      const res = await cancelBooking(id, 'Cancelled via receipt panel');
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Booking cancelled successfully' });
        setBooking(res.data);
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Cancellation failed' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading reservation receipt...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Receipt Unavailable</h2>
        <p className="text-slate-400 text-xs mb-6">{error || 'Could not locate the requested reservation.'}</p>
        <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-semibold text-xs">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const isCancelled = booking.bookingStatus === 'cancelled';
  const isCompleted = booking.bookingStatus === 'completed';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white print:bg-white print:text-black">
      <div>
        
        {/* Navigation Bar */}
        <div className="bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8 print:hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/my-bookings" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Booking History</span>
            </Link>
            <div className="flex items-center gap-2">
              {booking.paymentStatus === 'unpaid' && !isCancelled && (
                <Link
                  to={`/payment/checkout/${booking._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pay Now (${booking.totalAmount})</span>
                </Link>
              )}

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Confirmed Banner */}
          {isJustConfirmed && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm print:hidden">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <span className="font-bold block">Reservation Confirmed!</span>
                Your room has been locked and dates reserved. Receipt details are shown below.
              </div>
            </div>
          )}

          {actionMsg.text && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border print:hidden ${
              actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {actionMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{actionMsg.text}</span>
            </div>
          )}

          {/* Printable Receipt Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg mb-1">
                  <Receipt className="h-5 w-5" />
                  <span>GrandStay Official Receipt</span>
                </div>
                <p className="text-xs text-slate-400">Reservation Reference: <strong className="text-white font-mono">{booking._id}</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                  isCancelled ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  Status: {booking.bookingStatus}
                </span>
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Payment: {booking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Grid: Customer & Hotel Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Info */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-cyan-400" />
                  Guest Details
                </h4>
                <p className="text-sm font-bold text-white">{booking.userId?.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{booking.userId?.email}</span>
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{booking.userId?.phone || 'N/A'}</span>
                </p>
              </div>

              {/* Hotel Info */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  Hotel & Property Contact
                </h4>
                <p className="text-sm font-bold text-white">{booking.hotelId?.name}</p>
                <p className="text-xs text-slate-400">{booking.hotelId?.location?.address}, {booking.hotelId?.location?.city}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{booking.hotelId?.contact?.phone}</span>
                </p>
              </div>

            </div>

            {/* Room & Stay Timeline */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-cyan-400" />
                Reserved Room & Stay Duration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Room Specification</span>
                  <span className="font-bold text-white text-sm">{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Check-In Date</span>
                  <span className="font-bold text-emerald-400 text-sm">{new Date(booking.checkIn).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Check-Out Date</span>
                  <span className="font-bold text-emerald-400 text-sm">{new Date(booking.checkOut).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-900">
                <span>Guests: <strong className="text-white">{booking.guests?.adults} Adults, {booking.guests?.children || 0} Children</strong></span>
                <span>Stay Duration: <strong className="text-white">{booking.numberOfNights} Night(s)</strong></span>
              </div>
            </div>

            {/* Price Breakdown Calculation */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-cyan-400" />
                Server-Calculated Billing Summary
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Room Nightly Rate ({booking.roomId?.roomType})</span>
                  <span className="text-white font-mono">${booking.pricePerNight} / night</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Stay Duration</span>
                  <span className="text-white font-mono">{booking.numberOfNights} Night(s)</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                  <span>Grand Total Amount</span>
                  <span className="text-cyan-400 text-2xl font-extrabold">${booking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Status Footer */}
            {isCancelled && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <strong>Booking Cancelled:</strong> Reason - {booking.cancellationReason || 'Cancelled by customer'}
              </div>
            )}

            {!isCancelled && !isCompleted && (
              <div className="pt-4 flex justify-end print:hidden">
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                >
                  Cancel Reservation
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default BookingDetail;
