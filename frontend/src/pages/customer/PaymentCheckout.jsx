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
  Calendar, 
  Users, 
  DollarSign,
  Wallet,
  Lock,
  ArrowRight
} from 'lucide-react';

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
        setErrorMsg(err.response?.data?.message || 'Booking not found');
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
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Gateway Callback & Verification
  const handleSimulateResult = async (simulatedStatus) => {
    if (!txnInfo) {
      // Initiate first if not initiated
      await handleInitiateSession(selectedMethod, selectedGateway);
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await verifyPayment({
        transactionId: txnInfo?.payment?.transactionId || `TXN_MOCK_${Date.now()}`,
        gatewayReference: txnInfo?.payment?.gatewayReference,
        simulatedStatus,
        gateway: selectedGateway,
      });

      if (res.success) {
        navigate(`/payment/result?bookingId=${bookingId}&status=${simulatedStatus}&txn=${res.data.payment.transactionId}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Initializing checkout session...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Checkout Error</h2>
        <p className="text-slate-400 text-xs mb-6">{errorMsg || 'Booking session unavailable'}</p>
        <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-semibold text-xs">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div>
        
        {/* Header */}
        <div className="bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to={`/my-bookings/${bookingId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Booking Receipt</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Header Title */}
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">Step 3 of 3 • Secure Payment</span>
            <h1 className="text-3xl font-extrabold text-white">Complete Your Reservation Payment</h1>
          </div>

          {/* Already Paid Warning */}
          {booking.paymentStatus === 'paid' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-400 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <span className="font-bold block">Reservation Fully Paid!</span>
                  This booking has already been completed. No additional payment is required.
                </div>
              </div>
              <Link to={`/my-bookings/${bookingId}`} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap">
                View Receipt
              </Link>
            </div>
          )}

          {errorMsg && booking.paymentStatus !== 'paid' && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grid Layout: Booking Summary & Payment Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Payment Method Selector (Col 2) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Payment Provider Options */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Card Simulator */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('card'); setSelectedGateway('mock'); }}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedMethod === 'card' && selectedGateway === 'mock'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white ring-2 ring-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                    <div>
                      <span className="font-bold text-xs block text-white">Credit / Debit Card</span>
                      <span className="text-[10px] text-slate-400">Visa, Mastercard</span>
                    </div>
                  </button>

                  {/* eSewa Nepal Gateway */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('esewa'); setSelectedGateway('esewa'); }}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedGateway === 'esewa'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wallet className="h-5 w-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-xs block text-white">eSewa Wallet</span>
                      <span className="text-[10px] text-emerald-400">Nepal Digital Pay</span>
                    </div>
                  </button>

                  {/* Khalti Nepal Gateway */}
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('khalti'); setSelectedGateway('khalti'); }}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 text-left transition-all ${
                      selectedGateway === 'khalti'
                        ? 'bg-purple-500/10 border-purple-500 text-white ring-2 ring-purple-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wallet className="h-5 w-5 text-purple-400" />
                    <div>
                      <span className="font-bold text-xs block text-white">Khalti Wallet</span>
                      <span className="text-[10px] text-purple-400">Nepal Digital Pay</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* Development / Defense Simulator Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Lock className="h-5 w-5 text-cyan-400" />
                  <span>Gateway Outcome Testing Simulator</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Test the complete payment flow and backend status synchronization for your university presentation:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  
                  {/* Simulate Success */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('completed')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simulate Success</span>
                  </button>

                  {/* Simulate Failure */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('failed')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="py-3 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Simulate Decline</span>
                  </button>

                  {/* Simulate Cancellation */}
                  <button
                    type="button"
                    onClick={() => handleSimulateResult('cancelled')}
                    disabled={isProcessing || booking.paymentStatus === 'paid'}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all disabled:opacity-40"
                  >
                    <span>Simulate Cancel</span>
                  </button>

                </div>
              </div>

            </div>

            {/* Booking Summary Sidebar (Col 1) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 h-fit">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Reservation Summary</h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Hotel</span>
                  <span className="font-bold text-white">{booking.hotelId?.name}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Room</span>
                  <span className="font-semibold text-white">{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Stay Dates</span>
                  <span className="text-emerald-400 font-medium">
                    {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Duration</span>
                  <span className="text-slate-300">{booking.numberOfNights} Night(s)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">${booking.totalAmount}</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg text-white">
                  <span>Total Due</span>
                  <span className="text-cyan-400 text-xl">${booking.totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Backend verified room rates & payment sync</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default PaymentCheckout;
