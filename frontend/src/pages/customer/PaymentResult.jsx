import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBookingById } from '../../services/bookingService';
import { getPaymentByBooking } from '../../services/paymentService';
import Footer from '../../components/common/Footer';
import { CheckCircle2, XCircle, AlertCircle, Receipt, RefreshCw, ArrowRight, Home, LoaderCircle, CreditCard, CalendarDays, MapPin } from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric',
});

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadResult = async () => {
      setLoading(true);
      setError('');
      if (!bookingId) {
        setError('This payment result is missing its booking reference.');
        setLoading(false);
        return;
      }

      try {
        const bookingResponse = await getBookingById(bookingId);
        if (!bookingResponse.success) throw new Error('Booking status could not be verified.');
        if (active) setBooking(bookingResponse.data);

        try {
          const paymentResponse = await getPaymentByBooking(bookingId);
          if (active && paymentResponse.success) setPayment(paymentResponse.data);
        } catch (paymentError) {
          if (paymentError.response?.status !== 404) throw paymentError;
        }
      } catch (loadError) {
        console.error('Failed to load payment result:', loadError);
        if (active) setError('We could not verify this payment right now. Check your bookings for the latest status.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadResult();
    return () => { active = false; };
  }, [bookingId, refreshCount]);

  const status = payment?.paymentStatus || (booking?.paymentStatus === 'paid' ? 'completed' : 'unverified');
  const isSuccess = status === 'completed' || booking?.paymentStatus === 'paid';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';
  const isPending = status === 'initiated' || status === 'pending';
  const isRefunded = status === 'refunded' || booking?.paymentStatus === 'refunded';
  const totalGuests = (Number(booking?.guests?.adults) || 0) + (Number(booking?.guests?.children) || 0);

  if (loading) {
    return (
      <div className="customer-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-forest-600" />
          <span className="text-sm text-slate-500">Verifying payment status...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="customer-page flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {error ? (
            <section className="customer-empty-state rounded-xl border p-6 text-center sm:p-9" role="alert">
              <AlertCircle className="mx-auto h-9 w-9 text-amber-700" />
              <h1 className="mt-4 font-display text-3xl">Payment status unavailable</h1>
              <p className="mt-2 text-sm">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/my-bookings" className="customer-primary-button inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">My bookings<ArrowRight className="h-4 w-4" /></Link>
                <Link to="/" className="customer-secondary-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold"><Home className="h-4 w-4" />Home</Link>
              </div>
            </section>
          ) : (
            <section className="customer-surface overflow-hidden rounded-xl border shadow-sm">
              <header className={`payment-result-header flex flex-col items-center px-5 py-8 text-center sm:px-8 ${isSuccess ? 'result-success' : isFailed ? 'result-failed' : isCancelled ? 'result-cancelled' : isRefunded ? 'result-refunded' : 'result-pending'}`}>
                {isSuccess ? <CheckCircle2 className="h-11 w-11" /> : isFailed ? <XCircle className="h-11 w-11" /> : isCancelled ? <AlertCircle className="h-11 w-11" /> : <LoaderCircle className={`h-11 w-11 ${isPending ? 'animate-spin' : ''}`} />}
                <h1 className="mt-3 font-display text-3xl">
                  {isSuccess ? 'Payment confirmed' : isFailed ? 'Payment failed' : isCancelled ? 'Payment cancelled' : isRefunded ? 'Payment refunded' : isPending ? 'Payment processing' : 'Payment not verified'}
                </h1>
                <p className="mt-2 max-w-lg text-sm">
                  {isSuccess ? 'The server confirms this reservation has been paid.' : isFailed ? (payment?.failureReason || 'The gateway reported that payment did not complete.') : isCancelled ? (payment?.failureReason || 'The gateway reported that this payment was cancelled.') : isRefunded ? 'The recorded payment status is refunded.' : isPending ? 'The gateway has not finished processing this transaction yet.' : 'No completed payment was returned for this booking. Check your bookings or retry payment.'}
                </p>
              </header>

              {booking && (
                <div className="space-y-5 p-5 sm:p-8">
                  <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hotel</span>
                      <h2 className="mt-1 font-display text-2xl text-ink">{booking.hotelId?.name}</h2>
                      {booking.hotelId?.location?.city && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" />{booking.hotelId.location.city}</p>}
                    </div>
                    <span className={`customer-status-badge ${booking.bookingStatus === 'confirmed' ? 'status-confirmed' : booking.bookingStatus === 'cancelled' ? 'status-cancelled' : 'status-pending'}`}>Booking: {booking.bookingStatus}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="payment-result-fact"><span>Room</span><strong>{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</strong></div>
                    <div className="payment-result-fact"><span>Stay</span><strong>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</strong></div>
                    <div className="payment-result-fact"><span>Guests</span><strong>{totalGuests} ({booking.guests?.adults || 0} adults, {booking.guests?.children || 0} children)</strong></div>
                    <div className="payment-result-fact"><span>Payment status</span><strong>{payment?.paymentStatus || booking.paymentStatus}</strong></div>
                  </div>

                  <div className="rounded-lg border bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-500"><span>{payment ? `${payment.paymentMethod} payment` : 'Booking total'}</span><span>Booking ID <span className="font-mono text-ink">{booking._id}</span></span></div>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t pt-3">
                      <div>
                        {payment?.transactionId && <p className="break-all text-xs text-slate-500">Transaction {payment.transactionId}</p>}
                        {payment?.paidAt && <p className="mt-1 text-xs text-slate-500">Paid {formatDate(payment.paidAt)}</p>}
                      </div>
                      <p className="text-2xl font-bold text-forest-700">${payment?.amount ?? booking.totalAmount}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {isSuccess && <Link to={`/my-bookings/${booking._id}`} className="customer-primary-button inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"><Receipt className="h-4 w-4" />View booking</Link>}
                    {!isSuccess && booking.paymentStatus === 'unpaid' && booking.bookingStatus !== 'cancelled' && <Link to={`/payment/checkout/${booking._id}`} className="customer-primary-button inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Retry payment</Link>}
                    {(isPending || status === 'unverified') && <button type="button" onClick={() => setRefreshCount((count) => count + 1)} className="customer-secondary-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Refresh status</button>}
                    <Link to="/my-bookings" className="customer-secondary-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">My bookings</Link>
                    <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-forest-700"><Home className="h-4 w-4" />Home</Link>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentResult;
