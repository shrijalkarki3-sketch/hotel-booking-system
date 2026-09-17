import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import Footer from '../../components/common/Footer';
import { 
  CalendarCheck, 
  MapPin, 
  Bed, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Receipt,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(''); // '' (all), 'confirmed', 'completed', 'cancelled'
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings({ status: activeTab });
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleOpenCancelModal = (booking) => {
    setCancelModal(booking);
    setCancelReason('');
    setActionMsg({ type: '', text: '' });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setCancellingId(cancelModal._id);
    setActionMsg({ type: '', text: '' });

    try {
      const res = await cancelBooking(cancelModal._id, cancelReason);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Booking cancelled successfully. Reservation dates released.' });
        setCancelModal(null);
        fetchBookings();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking' });
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div>
        
        {/* Page Header */}
        <section className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">My Booking History</h1>
                <p className="text-xs text-slate-400">View current reservations, past stays, and manage eligible cancellations.</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
              {[
                { label: 'All Bookings', value: '' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Action Banners */}
        {actionMsg.text && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              actionMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {actionMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{actionMsg.text}</span>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-40 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6 max-w-lg mx-auto">
              <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
              <p className="text-slate-400 text-xs mb-6">
                You don't have any {activeTab ? activeTab : ''} reservations yet. Explore hotels and make your first booking!
              </p>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
              >
                <span>Browse Available Hotels</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const isCancelled = b.bookingStatus === 'cancelled';
                const isCompleted = b.bookingStatus === 'completed';

                return (
                  <div
                    key={b._id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    {/* Hotel & Room Info */}
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <img
                          src={b.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                          alt={b.hotelId?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border ${statusBadge[b.bookingStatus]}`}>
                            {b.bookingStatus}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Ref: #{b._id.substring(b._id.length - 8)}</span>
                        </div>

                        <h3 className="font-bold text-white text-base leading-snug">{b.hotelId?.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{b.hotelId?.location?.city || 'Nepal'} • {b.roomId?.roomType} Room (#{b.roomId?.roomNumber})</span>
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                            {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500">({b.numberOfNights} Night{b.numberOfNights > 1 ? 's' : ''})</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 gap-3">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Amount</span>
                        <span className="text-xl font-extrabold text-cyan-400">${b.totalAmount}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.paymentStatus === 'unpaid' && !isCancelled && !isCompleted && (
                          <Link
                            to={`/payment/checkout/${b._id}`}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Pay Now</span>
                          </Link>
                        )}

                        <Link
                          to={`/my-bookings/${b._id}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Receipt className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Receipt</span>
                        </Link>

                        {!isCancelled && !isCompleted && (
                          <button
                            onClick={() => handleOpenCancelModal(b)}
                            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Booking Cancellation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to cancel your reservation for <strong className="text-white">{cancelModal.hotelId?.name}</strong> ({new Date(cancelModal.checkIn).toLocaleDateString()})? This action will immediately release your room dates.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cancellation Reason (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                rows="2"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={!!cancellingId}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 disabled:opacity-50"
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookings;
