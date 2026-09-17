import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { 
  getManagerStats, 
  getManagerHotels, 
  createHotel, 
  updateHotel, 
  deleteHotel,
  createRoom,
  deleteRoom,
  getManagerBookings,
  updateBookingStatus
} from '../../services/dashboardService';
import { 
  Building2, 
  Bed, 
  CalendarCheck, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const ManagerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modal States
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });

  const [showRoomModal, setShowRoomModal] = useState(null); // holds target hotel object
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Deluxe',
    description: '',
    pricePerNight: '',
    adults: 2,
    children: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, hotelsRes, bookingsRes] = await Promise.all([
        getManagerStats(),
        getManagerHotels(),
        getManagerBookings(),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (hotelsRes.success) setHotels(hotelsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Hotel Create
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await createHotel({
        name: hotelForm.name,
        description: hotelForm.description,
        location: {
          city: hotelForm.city,
          address: hotelForm.address,
          country: 'Nepal',
        },
        contact: {
          phone: hotelForm.phone,
          email: hotelForm.email,
        },
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Hotel property added successfully!' });
        setShowHotelModal(false);
        setHotelForm({ name: '', description: '', city: '', address: '', phone: '', email: '' });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create hotel' });
    }
  };

  // Handle Room Create
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!showRoomModal) return;
    setMsg({ type: '', text: '' });

    try {
      const res = await createRoom(showRoomModal._id, {
        roomNumber: roomForm.roomNumber,
        roomType: roomForm.roomType,
        description: roomForm.description,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: { adults: roomForm.adults, children: roomForm.children },
      });

      if (res.success) {
        setMsg({ type: 'success', text: `Room #${roomForm.roomNumber} added to ${showRoomModal.name}` });
        setShowRoomModal(null);
        setRoomForm({ roomNumber: '', roomType: 'Deluxe', description: '', pricePerNight: '', adults: 2, children: 0 });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add room' });
    }
  };

  // Handle Booking Status Update
  const handleUpdateStatus = async (bookingId, status) => {
    setMsg({ type: '', text: '' });
    try {
      const res = await updateBookingStatus(bookingId, status);
      if (res.success) {
        setMsg({ type: 'success', text: `Booking status updated to ${status}` });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Status update failed' });
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

  const stats = analytics?.stats || {
    totalBookings: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
  };

  return (
    <DashboardLayout
      title="Hotel Manager Dashboard"
      subtitle="Manage your listed hotels, room pricing, guest reservations, and revenue analytics."
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
          { label: 'Overview', value: 'overview' },
          { label: 'Manage Hotels', value: 'hotels' },
          { label: 'Hotel Bookings', value: 'bookings' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setSearchParams({ tab: t.value })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === t.value
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg shadow-purple-500/10'
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
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">My Hotels</span>
                  <div className="text-3xl font-extrabold text-white">{analytics?.totalHotels || 0}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Listed properties</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Rooms</span>
                  <div className="text-3xl font-extrabold text-purple-400">{analytics?.totalRooms || 0}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{analytics?.availableRooms || 0} Available</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Bookings</span>
                  <div className="text-3xl font-extrabold text-cyan-400">{stats.totalBookings}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{stats.confirmedCount} Confirmed</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed Stays</span>
                  <div className="text-3xl font-extrabold text-blue-400">{stats.completedCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Guests checked out</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">Hotel Revenue</span>
                  <div className="text-3xl font-extrabold text-emerald-400">${stats.totalRevenue}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Verified revenue</p>
                </div>
              </div>

              {/* Recent Hotel Bookings */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-base">Recent Hotel Reservations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Hotel</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4">Check-In</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {analytics?.recentBookings?.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-white">{b.hotelId?.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{b.userId?.name} ({b.userId?.phone || b.userId?.email})</td>
                          <td className="py-3.5 px-4 text-slate-300">{b.roomId?.roomType} (#{b.roomId?.roomNumber})</td>
                          <td className="py-3.5 px-4 text-slate-300">{new Date(b.checkIn).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">${b.totalAmount}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE HOTELS & ROOMS */}
          {activeTab === 'hotels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Managed Hotel Properties ({hotels.length})</h2>
                <button
                  onClick={() => setShowHotelModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Hotel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((h) => (
                  <div key={h._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{h.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{h.location?.address}, {h.location?.city}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {h.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteHotel(h)}
                          title={`Delete ${h.name}`}
                          className="p-2 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2">{h.description}</p>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Rating: <strong className="text-amber-400">{h.rating?.average?.toFixed(1) || '4.8'}★</strong></span>
                      <button
                        onClick={() => setShowRoomModal(h)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-purple-400 font-semibold text-xs border border-slate-800 flex items-center gap-1"
                      >
                        <Bed className="h-3.5 w-3.5" />
                        <span>Add Room Spec</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white">Manage Guest Reservations</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Guest Info</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Stay Dates</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{b.hotelId?.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="font-semibold block">{b.userId?.name}</span>
                          <span className="text-[11px] text-slate-400">{b.userId?.phone || b.userId?.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{b.roomId?.roomType} (#{b.roomId?.roomNumber})</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">${b.totalAmount}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b._id, 'completed')}
                                className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold hover:bg-blue-500/20"
                              >
                                Check Out
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                                className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/20"
                              >
                                Cancel
                              </button>
                            </>
                          )}
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

      {/* Add Hotel Modal */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Add New Hotel Property</h3>
              <button onClick={() => setShowHotelModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g. Everest View Palace"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    value={hotelForm.city}
                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                    placeholder="Pokhara"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Address *</label>
                  <input
                    type="text"
                    value={hotelForm.address}
                    onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                    placeholder="Lakeside Ward 6"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  placeholder="Detailed hotel description..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    value={hotelForm.phone}
                    onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                    placeholder="+977 9800000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={hotelForm.email}
                    onChange={(e) => setHotelForm({ ...hotelForm, email: e.target.value })}
                    placeholder="hotel@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHotelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Save Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Add Room to {showRoomModal.name}</h3>
              <button onClick={() => setShowRoomModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type *</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price per Night ($) *</label>
                <input
                  type="number"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  placeholder="120"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Description</label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  placeholder="Room specs and details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  rows="2"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ManagerDashboard;
