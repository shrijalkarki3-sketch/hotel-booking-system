import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { getCustomerStats } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Search, 
  User, 
  Receipt,
  MapPin,
  ArrowRight,
  AlertCircle,
  Bed,
  Users,
  CalendarDays,
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

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCustomerStats();
        if (res.success) {
          setData(res.data);
        } else {
          throw new Error(res.message || 'Account overview could not be loaded.');
        }
      } catch (err) {
        console.error('Failed to load customer stats:', err);
        setError(err.response?.data?.message || 'We could not load your overview. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalBookings: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalSpent: 0,
  };

  return (
    <DashboardLayout
      className="customer-dashboard-shell"
      title="Customer Portal Dashboard"
      subtitle="Overview of your hotel reservations, stay stats, and recent activity."
    >
      <div className="customer-dashboard-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Your account</p>
          <h2 className="mt-1 font-display text-3xl text-ink">Welcome, {user?.name}</h2>
        </div>
        <Link to="/my-bookings" className="customer-secondary-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">Booking history<ArrowRight className="h-4 w-4" /></Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="customer-error-state rounded-xl border p-8 text-center" role="alert">
          <AlertCircle className="mx-auto h-9 w-9" />
          <h3 className="mt-3 text-lg font-semibold">Overview unavailable</h3>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="customer-surface rounded-xl border p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Reservations</span>
              <div className="text-3xl font-extrabold text-white">{stats.totalBookings}</div>
              <p className="text-[11px] text-slate-500 mt-1">All time bookings</p>
            </div>

            <div className="customer-surface rounded-xl border p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Confirmed Stays</span>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.confirmedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Upcoming reservations</p>
            </div>

            <div className="customer-surface rounded-xl border p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed Stays</span>
              <div className="text-3xl font-extrabold text-blue-400">{stats.completedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Past completed stays</p>
            </div>

            <div className="customer-surface rounded-xl border p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cancelled Stays</span>
              <div className="text-3xl font-extrabold text-red-400">{stats.cancelledCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Cancelled reservations</p>
            </div>

            <div className="customer-surface rounded-xl border p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">Total Amount Spent</span>
              <div className="text-3xl font-extrabold text-cyan-400">${stats.totalSpent}</div>
              <p className="text-[11px] text-slate-500 mt-1">Verified payments</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/hotels" className="customer-shortcut rounded-lg border p-4 text-sm font-semibold transition-colors group">
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                Search Hotels
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
            </Link>

            <Link to="/my-bookings" className="customer-shortcut rounded-lg border p-4 text-sm font-semibold transition-colors group">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-purple-400" />
                My Bookings History
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400" />
            </Link>

            <Link to="/profile" className="customer-shortcut rounded-lg border p-4 text-sm font-semibold transition-colors group">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Profile Settings
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400" />
            </Link>

            <Link to="/" className="customer-shortcut rounded-lg border p-4 text-sm font-semibold transition-colors group">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-400" />
                Home Page
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400" />
            </Link>
          </div>

          <div className="customer-surface space-y-4 rounded-xl border p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Recent bookings</h3>
              <Link to="/my-bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {data?.recentBookings && data.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {data.recentBookings.map((booking) => (
                  <article key={booking._id} className="customer-booking-preview grid gap-4 rounded-lg border p-4 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center">
                    {booking.hotelId?.images?.[0]
                      ? <img src={booking.hotelId.images[0]} alt={booking.hotelId.name || 'Hotel'} className="h-24 w-full rounded-md object-cover sm:h-20 sm:w-24" loading="lazy" />
                      : <div className="grid h-24 place-items-center rounded-md bg-slate-100 text-slate-500 sm:h-20"><ImageOff className="h-5 w-5" /></div>}
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2"><span className={`customer-status-badge ${statusClass(booking.bookingStatus)}`}>{booking.bookingStatus}</span><span className={`customer-status-badge ${statusClass(booking.paymentStatus)}`}>{booking.paymentStatus}</span></div>
                      <h4 className="mt-2 truncate font-semibold text-ink">{booking.hotelId?.name}</h4>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{booking.roomId?.roomType}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{booking.hotelId?.location?.city}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <span className="text-lg font-bold text-forest-700">${booking.totalAmount}</span>
                      <Link to={`/my-bookings/${booking._id}`} className="customer-secondary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Receipt className="h-4 w-4" />Details</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-empty-state rounded-lg border p-8 text-center text-sm">
                No recent bookings to show. <Link to="/hotels" className="font-semibold text-forest-700 underline">Browse hotels</Link>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
