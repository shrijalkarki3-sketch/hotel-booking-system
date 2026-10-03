import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../services/bookingService';
import Footer from '../../components/common/Footer';
import { 
  Receipt, 
  MapPin, 
  Bed, 
  CalendarDays,
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Printer, 
  ArrowLeft,
  AlertCircle,
  DollarSign,
  Home,
  X
} from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
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

const BookingDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isJustConfirmed = searchParams.get('confirmed') === 'true';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
        setError(err.response?.status === 403
          ? 'You do not have access to this booking.'
          : err.response?.status === 404
            ? 'We could not find this booking.'
            : 'We could not load this booking right now. Please try again.');
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
    setCancelling(true);
    try {
      const res = await cancelBooking(id, 'Cancelled via receipt panel');
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Booking cancelled successfully' });
        setBooking(res.data);
        setCancelOpen(false);
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Cancellation failed' });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Loading your booking...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="customer-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <div className="customer-empty-state w-full max-w-lg rounded-xl border p-8">
          <h1 className="font-display text-3xl">Booking details unavailable</h1>
          <p className="mt-3 text-sm">{error || 'We could not find this booking.'}</p>
          <Link to="/my-bookings" className="customer-primary-button mx-auto mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>My bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = booking.bookingStatus === 'cancelled';
  const isCompleted = booking.bookingStatus === 'completed';
  const totalGuests = (Number(booking.guests?.adults) || 0) + (Number(booking.guests?.children) || 0);

  return (
    <>
      <main className="customer-page min-h-screen print:bg-white print:text-black">
        <div className="customer-page-header border-b px-4 py-4 sm:px-6 lg:px-8 print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <Link to="/my-bookings" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-500 hover:text-forest-600">
              <ArrowLeft className="h-4 w-4" />
              <span>My bookings</span>
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {booking.paymentStatus === 'unpaid' && !isCancelled && (
                <Link
                  to={`/payment/checkout/${booking._id}`}
                  className="customer-primary-button inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pay ${booking.totalAmount}</span>
                </Link>
              )}

              <button
                onClick={handlePrint}
                className="customer-secondary-button inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Confirmed Banner */}
          {isJustConfirmed && (
            <div className="booking-confirmed-banner flex items-start gap-3 rounded-xl border px-4 py-4 text-sm print:hidden">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <span className="block font-bold">Booking request received</span>
                <span>Current booking and payment status are shown below.</span>
              </div>
            </div>
          )}

          {actionMsg.text && (
            <div className={`customer-action-message flex items-center gap-2 rounded-lg border px-4 py-3 text-sm print:hidden ${
              actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {actionMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{actionMsg.text}</span>
            </div>
          )}

          {/* Printable Receipt Card */}
          <div className="customer-receipt space-y-8 rounded-xl border bg-white p-5 shadow-sm sm:p-8 print:border-none print:shadow-none print:p-0">
            
            {/* Header */}
            <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-forest-700">
                  <Receipt className="h-5 w-5" />
                  <span>{isJustConfirmed ? 'Booking confirmation' : 'Booking receipt'}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Booking ID <strong className="break-all font-mono text-ink">{booking._id}</strong></p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`customer-status-badge ${statusClass(booking.bookingStatus)}`}>Booking: {booking.bookingStatus}</span>
                <span className={`customer-status-badge ${statusClass(booking.paymentStatus)}`}>Payment: {booking.paymentStatus}</span>
              </div>
            </div>

            <div className="booking-hotel-summary grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr]">
              {booking.hotelId?.images?.[0] ? (
                <img src={booking.hotelId.images[0]} alt={booking.hotelId.name || 'Hotel'} className="h-36 w-full rounded-lg object-cover sm:h-full" />
              ) : (
                <div className="booking-image-placeholder grid h-36 place-items-center rounded-lg text-sm sm:h-full">Hotel image unavailable</div>
              )}
              <div className="flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hotel</span>
                <h2 className="mt-1 font-display text-2xl text-ink">{booking.hotelId?.name}</h2>
                {booking.hotelId?.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-forest-600" />
                    {[booking.hotelId.location.address, booking.hotelId.location.city, booking.hotelId.location.country].filter(Boolean).join(', ')}
                  </p>
                )}
                {booking.hotelId?.contact?.phone && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Phone className="h-4 w-4" />{booking.hotelId.contact.phone}</p>
                )}
              </div>
            </div>

            <section className="booking-detail-grid grid grid-cols-1 gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0" aria-label="Stay details">
              <div className="booking-detail-cell">
                <Bed className="h-4 w-4 text-forest-600" />
                <span className="block text-xs text-slate-500">Room</span>
                <strong className="mt-1 block text-sm text-ink">{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</strong>
              </div>
              <div className="booking-detail-cell">
                <CalendarDays className="h-4 w-4 text-forest-600" />
                <span className="block text-xs text-slate-500">Check-in</span>
                <strong className="mt-1 block text-sm text-ink">{formatDate(booking.checkIn)}</strong>
              </div>
              <div className="booking-detail-cell">
                <CalendarDays className="h-4 w-4 text-forest-600" />
                <span className="block text-xs text-slate-500">Check-out</span>
                <strong className="mt-1 block text-sm text-ink">{formatDate(booking.checkOut)}</strong>
              </div>
              <div className="booking-detail-cell">
                <User className="h-4 w-4 text-forest-600" />
                <span className="block text-xs text-slate-500">Guests</span>
                <strong className="mt-1 block text-sm text-ink">{totalGuests} total ({booking.guests?.adults || 0} adults, {booking.guests?.children || 0} children)</strong>
              </div>
            </section>

            <section className="booking-billing-summary rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-forest-600" />
                <h3 className="text-sm font-semibold text-ink">Price summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-slate-500">
                  <span>Room rate</span><span>${booking.pricePerNight} / night</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-500">
                  <span>{booking.numberOfNights} {booking.numberOfNights === 1 ? 'night' : 'nights'}</span>
                  <span>Server-calculated</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-t pt-4">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="text-2xl font-bold text-forest-700">${booking.totalAmount}</span>
                </div>
              </div>
            </section>

            {/* Cancellation Status Footer */}
            {isCancelled && (
              <div className="customer-cancelled-note rounded-lg border px-4 py-3 text-sm">
                <strong>Booking Cancelled:</strong> Reason - {booking.cancellationReason || 'Cancelled by customer'}
              </div>
            )}

            {!isCancelled && !isCompleted && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 print:hidden">
                <p className="text-xs text-slate-500">Cancellation eligibility is checked when you confirm.</p>
                <button
                  onClick={() => setCancelOpen(true)}
                  className="customer-danger-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold"
                >
                  <X className="h-4 w-4" />
                  Cancel booking
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t pt-5 print:hidden">
              <Link to="/my-bookings" className="customer-secondary-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">My bookings</Link>
              <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-forest-700"><Home className="h-4 w-4" />Home</Link>
            </div>
          </div>

        </div>
        {cancelOpen && (
          <div className="customer-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
            <section className="customer-dialog w-full max-w-md rounded-xl border bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title">
              <h2 id="cancel-booking-title" className="font-display text-2xl text-ink">Cancel this booking?</h2>
              <p className="mt-3 text-sm text-slate-500">Cancellation eligibility will be confirmed by the booking service. This action may release your reserved dates.</p>
              {actionMsg.type === 'error' && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{actionMsg.text}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setCancelOpen(false)} disabled={cancelling} className="customer-secondary-button min-h-11 rounded-lg border px-4 text-sm font-semibold">Keep booking</button>
                <button type="button" onClick={handleCancelBooking} disabled={cancelling} className="customer-danger-button min-h-11 rounded-lg border px-4 text-sm font-semibold disabled:opacity-60">
                  {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

    </>
  );
};

export default BookingDetail;
