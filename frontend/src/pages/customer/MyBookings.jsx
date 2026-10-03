import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import Footer from '../../components/common/Footer';
import { 
  CalendarCheck, 
  MapPin, 
  Bed, 
  CalendarDays,
  Users,
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Receipt,
  ArrowRight,
  RotateCw,
  ImageOff
} from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric',
});

const statusClass = (status) => ({
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  paid: 'status-confirmed',
  unpaid: 'status-pending',
  refunded: 'status-refunded',
}[status] || 'status-neutral');

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(''); // '' (all), 'confirmed', 'completed', 'cancelled'
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyBookings({ status: activeTab });
      if (res.success) {
        setBookings(res.data || []);
      } else {
        throw new Error(res.message || 'Bookings could not be loaded.');
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err.response?.data?.message || 'We could not load your bookings. Please try again.');
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
        await fetchBookings();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <main className="customer-page min-h-screen">
        <section className="customer-page-header border-b px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Your trips</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl text-ink sm:text-4xl">My bookings</h1>
                <p className="mt-2 text-sm text-slate-500">Your reservations, payment status, and stay details.</p>
              </div>
              <Link to="/hotels" className="customer-primary-button inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"><span>Find a stay</span><ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="booking-filter-tabs mt-6 flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter bookings">
              {[
                { label: 'All Bookings', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  aria-pressed={activeTab === tab.value}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'booking-filter-active bg-forest-50 text-forest-700 border-forest-500'
                      : 'bg-white text-slate-500 border-slate-200 hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {actionMsg.text && (
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className={`customer-action-message flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              actionMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {actionMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{actionMsg.text}</span>
            </div>
          </div>
        )}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-live="polite">
          {loading ? (
            <div className="grid gap-4" aria-busy="true" aria-label="Loading bookings">
              {[1, 2].map((item) => (
                <div key={item} className="hotel-loading-skeleton h-44 rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="customer-error-state rounded-xl border p-8 text-center" role="alert">
              <AlertCircle className="mx-auto h-9 w-9" />
              <h2 className="mt-3 text-lg font-semibold">Bookings unavailable</h2>
              <p className="mt-2 text-sm">{error}</p>
              <button type="button" onClick={fetchBookings} className="customer-primary-button mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"><RotateCw className="h-4 w-4" />Try again</button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="customer-empty-state my-6 mx-auto max-w-lg rounded-xl border p-8 text-center sm:p-12">
              <CalendarCheck className="mx-auto mb-4 h-10 w-10 text-forest-600" />
              <h2 className="font-display text-2xl text-ink">No {activeTab || ''} bookings yet</h2>
              <p className="mb-6 mt-2 text-sm text-slate-500">
                Your reservations will appear here after you book a stay.
              </p>
              <Link
                to="/hotels"
                className="customer-primary-button inline-flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white"
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
                    className="booking-card customer-surface grid gap-5 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div className="booking-card-image relative h-36 overflow-hidden rounded-lg bg-slate-100 sm:h-44 lg:h-36">
                      {b.hotelId?.images?.[0] ? (
                        <img src={b.hotelId.images[0]} alt={b.hotelId?.name || 'Hotel'} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="grid h-full place-items-center text-slate-500"><ImageOff className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`customer-status-badge ${statusClass(b.bookingStatus)}`}>{b.bookingStatus}</span>
                        <span className={`customer-status-badge ${statusClass(b.paymentStatus)}`}>{b.paymentStatus}</span>
                      </div>
                      <h2 className="text-lg font-semibold leading-snug text-ink">{b.hotelId?.name}</h2>
                      {b.hotelId?.location?.city && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4 shrink-0 text-forest-600" />{[b.hotelId.location.city, b.hotelId.location.country].filter(Boolean).join(', ')}</p>
                      )}
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><Bed className="h-4 w-4 text-forest-600" />{b.roomId?.roomType} Room (#{b.roomId?.roomNumber})</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-forest-600" />{formatDate(b.checkIn)} - {formatDate(b.checkOut)}</span>
                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-forest-600" />{Number(b.guests?.adults || 0) + Number(b.guests?.children || 0)} guests</span>
                      </div>
                      <p className="mt-2 break-all text-[11px] text-slate-400">Booking ID: <span className="font-mono">{b._id}</span></p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                      <div className="lg:text-right">
                        <span className="block text-xs text-slate-500">{b.numberOfNights} {b.numberOfNights === 1 ? 'night' : 'nights'} · total</span>
                        <span className="text-2xl font-bold text-forest-700">${b.totalAmount}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {b.paymentStatus === 'unpaid' && !isCancelled && !isCompleted && (
                          <Link
                            to={`/payment/checkout/${b._id}`}
                            className="customer-primary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Pay Now</span>
                          </Link>
                        )}

                        <Link
                          to={`/my-bookings/${b._id}`}
                          className="customer-secondary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"
                        >
                          <Receipt className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Receipt</span>
                        </Link>

                        {!isCancelled && !isCompleted && (
                          <button
                            onClick={() => handleOpenCancelModal(b)}
                            className="customer-danger-button min-h-10 rounded-lg border px-3 text-sm font-semibold"
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

      </main>

      {cancelModal && (
        <div className="customer-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <div className="customer-dialog w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="booking-cancel-title">
            <h2 id="booking-cancel-title" className="font-display text-2xl text-ink">Cancel this booking?</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Cancellation eligibility will be confirmed by the booking service for <strong className="text-ink">{cancelModal.hotelId?.name}</strong> on {formatDate(cancelModal.checkIn)}.
            </p>

            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Cancellation reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="customer-field w-full rounded-lg border px-3 py-2.5 text-sm"
                rows="2"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                disabled={!!cancellingId}
                className="customer-secondary-button min-h-11 flex-1 rounded-lg border px-4 text-sm font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={!!cancellingId}
                className="customer-danger-button min-h-11 flex-1 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyBookings;
