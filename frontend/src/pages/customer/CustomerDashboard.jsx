import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { getCustomerStats } from '../../services/dashboardService';
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
  ArrowRight
} from 'lucide-react';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getCustomerStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer stats:', err);
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

  const statusBadge = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <DashboardLayout
      title="Customer Portal Dashboard"
      subtitle="Overview of your hotel reservations, stay stats, and recent activity."
    >
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Reservations</span>
              <div className="text-3xl font-extrabold text-white">{stats.totalBookings}</div>
              <p className="text-[11px] text-slate-500 mt-1">All time bookings</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Confirmed Stays</span>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.confirmedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Upcoming reservations</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed Stays</span>
              <div className="text-3xl font-extrabold text-blue-400">{stats.completedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Past completed stays</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cancelled Stays</span>
              <div className="text-3xl font-extrabold text-red-400">{stats.cancelledCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Cancelled reservations</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-950">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">Total Amount Spent</span>
              <div className="text-3xl font-extrabold text-cyan-400">${stats.totalSpent}</div>
              <p className="text-[11px] text-slate-500 mt-1">Verified payments</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/hotels" className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-all group">
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                Search Hotels
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
            </Link>

            <Link to="/my-bookings" className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-all group">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-purple-400" />
                My Bookings History
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400" />
            </Link>

            <Link to="/profile" className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-all group">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Profile Settings
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400" />
            </Link>

            <Link to="/" className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-all group">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-400" />
                Home Page
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400" />
            </Link>
          </div>

          {/* Recent Reservations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Recent Reservations</h3>
              <Link to="/my-bookings" className="text-xs font-semibold text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>

            {data?.recentBookings && data.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Room Type</th>
                      <th className="py-3 px-4">Check-In</th>
                      <th className="py-3 px-4">Check-Out</th>
                      <th className="py-3 px-4">Total Price</th>
                      <th className="py-3 px-4">Booking Status</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {b.hotelId?.name || 'Hotel'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {b.roomId?.roomType} (#{b.roomId?.roomNumber})
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {new Date(b.checkIn).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-cyan-400">
                          ${b.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusBadge[b.bookingStatus]}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                            b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/my-bookings/${b._id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 font-semibold text-[11px] border border-slate-800"
                          >
                            Receipt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent reservations found. Search hotels to make your first booking!
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;
