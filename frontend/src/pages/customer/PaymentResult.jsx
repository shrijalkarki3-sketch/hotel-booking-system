import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import { CheckCircle2, XCircle, AlertCircle, Receipt, RefreshCw, ArrowRight } from 'lucide-react';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const status = searchParams.get('status') || 'completed';
  const txnId = searchParams.get('txn') || 'N/A';

  const isSuccess = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          
          {/* Success Result */}
          {isSuccess && (
            <>
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Payment Successful!</h1>
                <p className="text-xs text-slate-400 mt-1">Your reservation payment has been verified and completed.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-cyan-400 font-bold truncate max-w-[180px]">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">PAID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <Link
                to={`/my-bookings/${bookingId}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Receipt className="h-4 w-4" />
                <span>View Official Booking Receipt</span>
              </Link>
            </>
          )}

          {/* Failed Result */}
          {isFailed && (
            <>
              <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-xl shadow-red-500/10">
                <XCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Payment Declined</h1>
                <p className="text-xs text-slate-400 mt-1">Your payment could not be processed. Your booking remains active as unpaid.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-red-400 font-bold truncate max-w-[180px]">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Failure Reason:</span>
                  <span className="text-red-400">Card declined or insufficient funds</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/payment/checkout/${bookingId}`}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Link>
                <Link
                  to="/my-bookings"
                  className="py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  My Bookings
                </Link>
              </div>
            </>
          )}

          {/* Cancelled Result */}
          {!isSuccess && !isFailed && (
            <>
              <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Payment Cancelled</h1>
                <p className="text-xs text-slate-400 mt-1">You cancelled the payment process. You can complete payment at any time from your bookings history.</p>
              </div>

              <Link
                to="/my-bookings"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <span>Return to Booking History</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentResult;
