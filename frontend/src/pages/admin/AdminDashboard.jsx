import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserStatus,
  getManagerHotels,
  deleteHotel
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

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Master Data States
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // User Filter State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, hotelsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers({ role: userRoleFilter }),
        getManagerHotels(),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (hotelsRes.success) setHotels(hotelsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
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
  }, [userRoleFilter]);

  // Handle User Block / Unblock Toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    setMsg({ type: '', text: '' });
    const targetStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      const res = await updateUserStatus(userId, targetStatus);
      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Action failed' });
    }
  };

  const usersCount = analytics?.users || { total: 0, customers: 0, managers: 0 };
  const inventory = analytics?.inventory || { totalHotels: 0, totalRooms: 0 };
  const bookingsStats = analytics?.bookings || { totalBookings: 0, confirmedCount: 0, completedCount: 0, cancelledCount: 0, totalRevenue: 0 };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <DashboardLayout
      title="System Admin Control Center"
      subtitle="Master system analytics, user account moderation, property oversight, and financial audits."
    >
      {/* Alert Banner */}
      {msg.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { label: 'System Overview', value: 'overview' },
          { label: 'User Management', value: 'users' },
          { label: 'Hotels & Inventory', value: 'hotels' },
          { label: 'Global Reservations', value: 'bookings' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setSearchParams({ tab: t.value })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === t.value
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Master KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Users</span>
                  <div className="text-3xl font-extrabold text-white">{usersCount.total}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{usersCount.customers} Customers • {usersCount.managers} Managers</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">System Hotels</span>
                  <div className="text-3xl font-extrabold text-cyan-400">{inventory.totalHotels}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{inventory.totalRooms} Total Rooms</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Global Bookings</span>
                  <div className="text-3xl font-extrabold text-purple-400">{bookingsStats.totalBookings}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{bookingsStats.confirmedCount} Active Confirmed</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed Stays</span>
                  <div className="text-3xl font-extrabold text-blue-400">{bookingsStats.completedCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Successfully fulfilled</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">System Revenue</span>
                  <div className="text-3xl font-extrabold text-emerald-400">${bookingsStats.totalRevenue}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Total processed volume</p>
                </div>
              </div>

              {/* Recent User Registrations */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-base">Recent Registered Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">User Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {analytics?.recentUsers?.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              u.status === 'blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT & BLOCKING */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">System User Moderation ({filteredUsers.length})</h2>

                {/* Filter Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="hotel_manager">Hotel Managers</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-400">{u.phone || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                            u.status === 'blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ml-auto ${
                                u.status === 'blocked'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {u.status === 'blocked' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              <span>{u.status === 'blocked' ? 'Unblock User' : 'Block User'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white">All Hotel Properties ({hotels.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Manager</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {hotels.map((hotel) => (
                      <tr key={hotel._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{hotel.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{hotel.location?.city || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-300">{hotel.managerId?.name || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-400 capitalize">{hotel.status}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteHotel(hotel)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;
