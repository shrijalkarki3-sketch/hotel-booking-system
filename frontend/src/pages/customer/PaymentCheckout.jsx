import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingById } from '../../services/bookingService';
import { initiatePayment, verifyPayment } from '../../services/paymentService';
import Footer from '../../components/common/Footer';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Building2,
  CalendarDays,
  Users,
  MapPin,
  DollarSign,
  Wallet,
  Lock,
  ArrowRight,
  LoaderCircle
} from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric',
});

const PaymentCheckout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Checkout Form State
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [selectedGateway, setSelectedGateway] = useState('mock');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnInfo, setTxnInfo] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await getBookingById(bookingId);
        if (res.success) {
          if (res.data.paymentStatus === 'paid') {
            setErrorMsg('This reservation has already been paid in full!');
          }
          setBooking(res.data);
        }
      } catch (err) {
        console.error('Failed to load booking for payment:', err);
        setErrorMsg(err.response?.status === 403
          ? 'You do not have access to this booking.'
          : err.response?.status === 404
            ? 'This booking could not be found.'
            : 'We could not load this reservation for payment. Please return to My Bookings and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Initiate Payment Session
  const handleInitiateSession = async (method, gateway) => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await initiatePayment({
        bookingId,
        paymentMethod: method || selectedMethod,
        gateway: gateway || selectedGateway,
      });

      if (res.success) {
        setTxnInfo(res.data);
        return res.data;
      }
      setErrorMsg(res.message || 'Payment setup could not be started. Please try again.');
      return null;
    } catch (err) {
      console.error('Failed to initiate payment:', err);
      setErrorMsg(err.response?.status === 400
        ? (err.response?.data?.message || 'This booking cannot start a payment session.')
        : 'We could not start the payment session. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Gateway Callback & Verification
  const handleSimulateResult = async (simulatedStatus) => {
    const session = txnInfo || await handleInitiateSession(selectedMethod, selectedGateway);
    if (!session?.payment?.transactionId) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await verifyPayment({
        transactionId: session.payment.transactionId,
        gatewayReference: session.payment.gatewayReference,
        simulatedStatus,
        gateway: selectedGateway,
      });

      if (res.success) {
        navigate(`/payment/result?bookingId=${bookingId}&status=${simulatedStatus}&txn=${res.data.payment.transactionId}`);
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      setErrorMsg(err.response?.status === 400
        ? (err.response?.data?.message || 'The gateway could not verify this payment.')
        : 'We could not verify the payment right now. Please retry or check My Bookings.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Loading your reservation...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="customer-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <div className="customer-empty-state w-full max-w-lg rounded-xl border p-8">
          <h1 className="font-display text-3xl">Checkout unavailable</h1>
          <p className="mt-3 text-sm">{errorMsg || 'This booking could not be loaded for payment.'}</p>
          <Link to="/my-bookings" className="customer-primary-button mx-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>My bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="customer-page min-h-screen">
      <div>
        
        {/* Header */}
        <div className="customer-page-header border-b px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Link to={`/my-bookings/${bookingId}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-500 hover:text-forest-600">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Booking Receipt</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-medium text-forest-700">
              <ShieldCheck className="h-4 w-4" />
              <span>Payment handled by the selected gateway</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header Title */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Reservation payment</span>
            <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Complete your payment</h1>
            <p className="mt-2 text-sm text-slate-500">Review the reservation and select a payment method to continue.</p>
          </div>

          {/* Already Paid Warning */}
          {booking.paymentStatus === 'paid' && (
            <div className="booking-confirmed-banner flex items-center justify-between gap-4 rounded-xl border px-4 py-4 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <span className="block font-bold">Payment complete</span>
                  No additional payment is due for this booking.
                </div>
              </div>
              <Link to={`/my-bookings/${bookingId}`} className="customer-primary-button inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold text-white whitespace-nowrap">
                View booking
              </Link>
            </div>
          )}

          {errorMsg && booking.paymentStatus !== 'paid' && (
            <div className="customer-error-banner flex items-center gap-3 rounded-lg border px-4 py-3 text-sm" role="alert">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grid Layout: Booking Summary & Payment Selector */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
            
            {/* Payment Method Selector (Col 2) */}
            <div className="space-y-5 lg:col-span-3">
              
              {/* Payment Provider Options */}
              <div className="customer-surface space-y-4 rounded-xl border p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <CreditCard className="h-5 w-5 text-forest-600" />
                  Payment method
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  
                  {/* Card Simulator */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('card'); setSelectedGateway('mock'); }}
                    disabled={isProcessing}
                    aria-pressed={selectedMethod === 'card' && selectedGateway === 'mock'}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedMethod === 'card' && selectedGateway === 'mock'
                        ? 'payment-method-selected border-forest-500 bg-forest-50 text-ink'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-forest-300'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-forest-600" />
                    <div>
                      <span className="block text-sm font-semibold text-ink">Credit / Debit Card</span>
                      <span className="text-xs text-slate-500">Card gateway</span>
                    </div>
                  </button>

                  {/* eSewa Nepal Gateway */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('esewa'); setSelectedGateway('esewa'); }}
                    disabled={isProcessing}
                    aria-pressed={selectedGateway === 'esewa'}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedGateway === 'esewa'
                        ? 'payment-method-selected border-forest-500 bg-forest-50 text-ink'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-forest-300'
                    }`}
                  >
                    <Wallet className="h-5 w-5 text-forest-600" />
                    <div>
                      <span className="block text-sm font-semibold text-ink">eSewa Wallet</span>
                      <span className="text-xs text-slate-500">eSewa gateway</span>
                    </div>
                  </button>

                  {/* Khalti Nepal Gateway */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('khalti'); setSelectedGateway('khalti'); }}
                    disabled={isProcessing}
                    aria-pressed={selectedGateway === 'khalti'}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedGateway === 'khalti'
                        ? 'payment-method-selected border-forest-500 bg-forest-50 text-ink'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-forest-300'
                    }`}
                  >
                    <Wallet className="h-5 w-5 text-forest-600" />
                    <div>
                      <span className="block text-sm font-semibold text-ink">Khalti Wallet</span>
                      <span className="text-xs text-slate-500">Khalti gateway</span>
                    </div>
                  </button>

                </div>
              </div>

              {txnInfo?.payment && (
                <div className="customer-action-message flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm" role="status" aria-live="polite">
                  <span>Gateway session status</span>
                  <span className={`customer-status-badge ${txnInfo.payment.paymentStatus === 'completed' ? 'status-confirmed' : 'status-pending'}`}>
                    {txnInfo.payment.paymentStatus}
                  </span>
                </div>
              )}

              {/* Development / Defense Simulator Panel */}
              <div className="customer-surface space-y-4 rounded-xl border p-5 sm:p-6">
                <div className="flex items-center gap-2 text-ink">
                  <Lock className="h-5 w-5 text-forest-600" />
                  <h2 className="text-base font-semibold">Gateway test controls</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">
                  These existing test actions call the configured gateway adapter and server verification endpoint. They do not represent a card form.
                </p>

                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                  
                  {/* Simulate Success */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('completed')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="customer-primary-button flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>{isProcessing ? 'Verifying...' : 'Simulate Success'}</span>
                  </button>

                  {/* Simulate Failure */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('failed')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="customer-danger-button flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"
                  >
                    {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    <span>{isProcessing ? 'Verifying...' : 'Simulate Decline'}</span>
                  </button>

                  {/* Simulate Cancellation */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('cancelled')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="customer-secondary-button min-h-11 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"
                  >
                    <span>{isProcessing ? 'Verifying...' : 'Simulate Cancel'}</span>
                  </button>

                </div>
              </div>

            </div>

            {/* Booking Summary Sidebar (Col 1) */}
            <aside className="customer-surface h-fit space-y-4 rounded-xl border p-5 lg:sticky lg:top-24 lg:col-span-2">
              <h2 className="border-b pb-3 text-base font-semibold text-ink">Reservation summary</h2>

              <div className="space-y-3 text-sm text-slate-500">
                <div>
                  <span className="text-slate-500 block">Hotel</span>
                  <span className="font-semibold text-ink">{booking.hotelId?.name}</span>
                  {booking.hotelId?.location?.city && <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{booking.hotelId.location.city}</span>}
                </div>

                <div>
                  <span className="text-slate-500 block">Room</span>
                  <span className="font-semibold text-ink">{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Stay Dates</span>
                  <span className="font-medium text-ink">
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Duration</span>
                  <span className="text-ink">{booking.numberOfNights} {booking.numberOfNights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Guests</span>
                  <span className="text-ink">{booking.guests?.adults || 0} adults, {booking.guests?.children || 0} children</span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Room rate</span><span>${booking.pricePerNight} / night</span>
                </div>
                <div className="flex justify-between gap-4 font-semibold text-ink">
                  <span>Total due</span><span className="text-xl text-forest-700">${booking.totalAmount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm">
                <span className="text-slate-500">Payment</span>
                <span className={`customer-status-badge ${booking.paymentStatus === 'paid' ? 'status-confirmed' : 'status-pending'}`}>{booking.paymentStatus}</span>
              </div>
            </aside>

          </div>

        </div>
        </div>

      </main>
      <Footer />
    </>
  );
};

export default PaymentCheckout;
