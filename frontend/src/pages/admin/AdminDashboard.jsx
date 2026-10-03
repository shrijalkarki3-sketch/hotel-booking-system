import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserStatus,
  getManagerHotels,
  deleteHotel,
  getAdminReports,
  getManagerBookings,
} from '../../services/dashboardService';
import { 
  Users, 
  Building2, 
  Bed, 
  CalendarCheck, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  X,
  Trash2
} from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric',
});

const statusClass = (status) => ({
  pending: 'control-status-pending',
  confirmed: 'control-status-confirmed',
  completed: 'control-status-completed',
  cancelled: 'control-status-cancelled',
  paid: 'control-status-confirmed',
  unpaid: 'control-status-pending',
  refunded: 'control-status-neutral',
  active: 'control-status-confirmed',
  blocked: 'control-status-cancelled',
}[status] || 'control-status-neutral');

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Master Data States
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // User Filter State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [busyUserId, setBusyUserId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, hotelsRes, reportRes, bookingsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers({ role: userRoleFilter, status: userStatusFilter }),
        getManagerHotels(),
        getAdminReports(),
        getManagerBookings({ status: bookingStatusFilter }),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (hotelsRes.success) setHotels(hotelsRes.data);
      if (reportRes.success) setReport(reportRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || 'Admin data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}" and all of its rooms and reviews? This cannot be undone.`)) {
      return;
    }

    setMsg({ type: '', text: '' });
    try {
      const res = await deleteHotel(hotel._id);
      if (res.success) {
        setMsg({ type: 'success', text: `${hotel.name} was deleted successfully.` });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete hotel' });
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRoleFilter, userStatusFilter, bookingStatusFilter]);

  // Handle User Block / Unblock Toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (currentStatus !== 'blocked' && !window.confirm('Block this account? The user will no longer be able to sign in.')) return;
    setMsg({ type: '', text: '' });
    const targetStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setBusyUserId(userId);
    try {
      const res = await updateUserStatus(userId, targetStatus);
      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Action failed' });
    } finally {
      setBusyUserId('');
    }
  };

  const usersCount = analytics?.users || { total: 0, customers: 0, managers: 0 };
  const inventory = analytics?.inventory || { totalHotels: 0, totalRooms: 0 };
  const bookingsStats = analytics?.bookings || { totalBookings: 0, confirmedCount: 0, completedCount: 0, cancelledCount: 0, totalRevenue: 0 };

  const filteredUsers = users.filter((user) =>
    String(user.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    String(user.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredHotels = hotels.filter((hotel) => {
    const query = hotelSearch.trim().toLowerCase();
    return !query || [hotel.name, hotel.location?.city, hotel.managerId?.name]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const exportAdminReportCsv = () => {
    const rows = report?.hotelBreakdown || [];
    const csvRows = [
      ['Hotel Name', 'Bookings', 'Paid Revenue', 'Confirmed', 'Completed'],
      ...rows.map((row) => [
        row.hotelName,
        row.bookingCount,
        row.revenue,
        row.confirmedCount,
        row.completedCount,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      className="control-dashboard-shell admin-dashboard-shell"
      title="System Admin Control Center"
      subtitle="Master system analytics, user account moderation, property oversight, and financial audits."
    >
      {/* Alert Banner */}
      {msg.text && (
        <div className={`control-alert flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
          msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg({ type: '', text: '' })} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="control-tabs flex gap-2 overflow-x-auto border-b pb-3" aria-label="Admin dashboard sections">
        {[
          { label: 'System Overview', value: 'overview' },
          { label: 'User Management', value: 'users' },
          { label: 'Hotels & Inventory', value: 'hotels' },
          { label: 'Global Reservations', value: 'bookings' },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSearchParams({ tab: t.value })}
            aria-current={activeTab === t.value ? 'page' : undefined}
            className={`min-h-10 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-all ${
              activeTab === t.value
                ? 'control-tab-active bg-forest-50 text-forest-700 border-forest-500'
                : 'bg-white text-slate-500 border-slate-200 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="control-loading-skeleton h-64 rounded-xl" aria-label="Loading admin dashboard" aria-busy="true"></div>
      ) : error ? (
        <div className="control-empty-state rounded-xl border p-8 text-center" role="alert">
          <AlertCircle className="mx-auto h-9 w-9" />
          <h2 className="mt-3 text-lg font-semibold">Admin data unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button type="button" onClick={fetchData} className="control-primary-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Master KPI Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total users</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{usersCount.total}</div>
                  <p className="mt-1 text-xs text-slate-500">{usersCount.customers} customers · {usersCount.managers} managers</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hotels</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{inventory.totalHotels}</div>
                  <p className="mt-1 text-xs text-slate-500">{inventory.totalRooms} rooms</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Global bookings</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{bookingsStats.totalBookings}</div>
                  <p className="mt-1 text-xs text-slate-500">{bookingsStats.confirmedCount} confirmed</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed stays</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{bookingsStats.completedCount}</div>
                  <p className="mt-1 text-xs text-slate-500">Successfully fulfilled</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid revenue</span>
                  <div className="mt-2 text-3xl font-bold text-forest-700">${bookingsStats.totalRevenue}</div>
                  <p className="mt-1 text-xs text-slate-500">Payments marked paid</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending payments</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{analytics?.payments?.pending ?? 0}</div>
                  <p className="mt-1 text-xs text-slate-500">Initiated transactions</p>
                </div>
              </div>

              <div className="control-surface rounded-xl border p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reports</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">System summary</h3>
                  </div>
                  <button type="button" onClick={exportAdminReportCsv} className="control-secondary-button min-h-10 rounded-lg border px-3 text-sm font-semibold">
                    Export report
                  </button>
                </div>

                {report ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Total bookings</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.summary?.totalBookings ?? bookingsStats.totalBookings}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Confirmed</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.bookingStatusBreakdown?.confirmed ?? bookingsStats.confirmedCount}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Completed revenue</div>
                    <div className="mt-1 text-2xl font-bold text-forest-700">${report.revenue?.completedRevenue ?? 0}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Hotel count</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.summary?.totalHotels ?? inventory.totalHotels}</div>
                  </div>
                </div> : <p className="rounded-lg border border-dashed p-5 text-sm text-slate-500">Report data is not available.</p>}
              </div>

              {/* Recent User Registrations */}
              <div className="control-surface space-y-4 rounded-xl border p-5 sm:p-6">
                <h3 className="text-base font-semibold text-ink">Recent registered users</h3>
                {analytics?.recentUsers?.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {analytics.recentUsers.map((user) => (
                    <article key={user._id} className="control-record rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-sm text-ink">{user.name}</strong>
                        <span className={`control-status-badge ${statusClass(user.status)}`}>{user.status}</span>
                      </div>
                      <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-slate-500">
                        <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                        {user.createdAt && <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>}
                      </div>
                    </article>
                  ))}
                </div> : <div className="control-empty-state rounded-lg border border-dashed p-6 text-center text-sm">No recent users are available.</div>}
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT & BLOCKING */}
          {activeTab === 'users' && (
            <div className="control-surface space-y-4 rounded-xl border p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">User management</h2>
                    <p className="mt-1 text-sm text-slate-500">{filteredUsers.length} users in the current result set</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="relative sm:col-span-1">
                    <span className="sr-only">Search users by name or email</span>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="control-field min-h-11 w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                    Role
                    <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="control-field min-h-11 rounded-lg border px-3 text-sm">
                      <option value="">All roles</option>
                      <option value="customer">Customers</option>
                      <option value="hotel_manager">Hotel managers</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                    Account status
                    <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} className="control-field min-h-11 rounded-lg border px-3 text-sm">
                      <option value="">All statuses</option>
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </label>
                </div>
              </div>

              {filteredUsers.length ? <div className="grid gap-3 lg:grid-cols-2">
                {filteredUsers.map((user) => (
                  <article key={user._id} className="control-record grid gap-4 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-ink">{user.name}</h3><span className={`control-status-badge ${statusClass(user.status)}`}>{user.status}</span></div>
                      <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.phone || 'No phone listed'} · {user.role?.replace('_', ' ')}</p>
                      {user.createdAt && <time dateTime={user.createdAt} className="mt-1 block text-xs text-slate-400">Joined {formatDate(user.createdAt)}</time>}
                    </div>
                    {user.role !== 'admin' && (
                      <button type="button" onClick={() => handleToggleUserStatus(user._id, user.status)} disabled={busyUserId === user._id} className={`${user.status === 'blocked' ? 'control-secondary-button' : 'control-danger-button'} inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold disabled:opacity-50`}>
                        {busyUserId === user._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : user.status === 'blocked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {busyUserId === user._id ? 'Updating...' : user.status === 'blocked' ? 'Unblock' : 'Block account'}
                      </button>
                    )}
                  </article>
                ))}
              </div> : <div className="control-empty-state rounded-lg border border-dashed p-8 text-center text-sm">No users match these filters.</div>}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="control-surface space-y-4 rounded-xl border p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div><h2 className="text-lg font-semibold text-ink">Hotel inventory</h2><p className="mt-1 text-sm text-slate-500">{filteredHotels.length} of {hotels.length} properties</p></div>
                <label className="relative sm:w-72"><span className="sr-only">Search hotels</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={hotelSearch} onChange={(event) => setHotelSearch(event.target.value)} placeholder="Search hotel, city, or manager" className="control-field min-h-11 w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm" /></label>
              </div>
              {filteredHotels.length ? <div className="grid gap-3 lg:grid-cols-2">
                {filteredHotels.map((hotel) => (
                  <article key={hotel._id} className="control-record grid gap-4 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-ink">{hotel.name}</h3><span className={`control-status-badge ${statusClass(hotel.status)}`}>{hotel.status}</span></div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Building2 className="h-4 w-4" />{[hotel.location?.address, hotel.location?.city].filter(Boolean).join(', ')}</p>
                      <p className="mt-1 text-xs text-slate-500">Manager: {hotel.managerId?.name || 'Not assigned'}</p>
                    </div>
                    <button type="button" onClick={() => handleDeleteHotel(hotel)} className="control-danger-button inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Trash2 className="h-4 w-4" />Delete</button>
                  </article>
                ))}
              </div> : <div className="control-empty-state rounded-lg border border-dashed p-8 text-center text-sm">No hotels match this search.</div>}
            </div>
          )}

          {activeTab === 'bookings' && (
            <section className="control-surface space-y-4 rounded-xl border p-5 sm:p-6" aria-labelledby="admin-bookings-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="admin-bookings-heading" className="text-lg font-semibold text-ink">Global reservations</h2>
                  <p className="mt-1 text-sm text-slate-500">Read-only booking and payment status overview</p>
                </div>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 sm:w-52">
                  Booking status
                  <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value)} className="control-field min-h-11 rounded-lg border px-3 text-sm">
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
              {bookings.length ? <div className="grid gap-3">
                {bookings.map((booking) => (
                  <article key={booking._id} className="control-record grid gap-4 rounded-lg border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`control-status-badge ${statusClass(booking.bookingStatus)}`}>{booking.bookingStatus}</span>
                        <span className={`control-status-badge ${statusClass(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                        <span className="break-all text-[11px] text-slate-400">#{booking._id}</span>
                      </div>
                      <h3 className="mt-2 font-semibold text-ink">{booking.hotelId?.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span>{booking.userId?.name} · {booking.userId?.email}</span>
                        <span>{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</span>
                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                        <span>{Number(booking.guests?.adults || 0) + Number(booking.guests?.children || 0)} guests</span>
                      </div>
                    </div>
                    <strong className="border-t pt-3 text-xl text-forest-700 lg:border-0 lg:pt-0">${booking.totalAmount}</strong>
                  </article>
                ))}
              </div> : <div className="control-empty-state rounded-lg border border-dashed p-8 text-center text-sm">No reservations match this status.</div>}
            </section>
          )}
        </>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;
