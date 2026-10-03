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
  updateRoom,
  deleteRoom,
  getManagerBookings,
  updateBookingStatus,
  getManagerReports,
} from '../../services/dashboardService';
import { getHotelById } from '../../services/hotelService';
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
  MapPin,
  Search,
  Save,
  ChevronDown,
  LoaderCircle,
  ImageOff
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
  available: 'control-status-confirmed',
  maintenance: 'control-status-pending',
  occupied: 'control-status-cancelled',
}[status] || 'control-status-neutral');

const ManagerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [hotelSearch, setHotelSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [expandedHotelId, setExpandedHotelId] = useState('');
  const [roomsByHotel, setRoomsByHotel] = useState({});
  const [roomsLoadingId, setRoomsLoadingId] = useState('');
  const [roomsError, setRoomsError] = useState('');
  const [savingHotel, setSavingHotel] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [busyRoomId, setBusyRoomId] = useState('');
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

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
    amenities: '',
    status: 'available',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, hotelsRes, bookingsRes, reportsRes] = await Promise.all([
        getManagerStats(),
        getManagerHotels(),
        getManagerBookings({ status: bookingStatusFilter }),
        getManagerReports(),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (hotelsRes.success) setHotels(hotelsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (reportsRes.success) setReport(reportsRes.data);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
      setError(err.response?.data?.message || 'Manager data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bookingStatusFilter]);

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSavingHotel(true);
    try {
      const hotelData = {
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
      };
      const res = editingHotel
        ? await updateHotel(editingHotel._id, hotelData)
        : await createHotel(hotelData);

      if (res.success) {
        setMsg({ type: 'success', text: editingHotel ? 'Hotel property updated successfully.' : 'Hotel property added successfully.' });
        setShowHotelModal(false);
        setEditingHotel(null);
        setHotelForm({ name: '', description: '', city: '', address: '', phone: '', email: '' });
        await fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Hotel could not be saved.' });
    } finally {
      setSavingHotel(false);
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!showRoomModal) return;
    setMsg({ type: '', text: '' });
    setSavingRoom(true);

    try {
      const roomData = {
        roomNumber: roomForm.roomNumber,
        roomType: roomForm.roomType,
        description: roomForm.description,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: { adults: Number(roomForm.adults), children: Number(roomForm.children) },
        amenities: roomForm.amenities.split(',').map((amenity) => amenity.trim()).filter(Boolean),
        ...(editingRoom ? { status: roomForm.status } : {}),
      };
      const res = editingRoom
        ? await updateRoom(editingRoom._id, roomData)
        : await createRoom(showRoomModal._id, roomData);

      if (res.success) {
        setMsg({ type: 'success', text: editingRoom ? `Room #${roomForm.roomNumber} updated.` : `Room #${roomForm.roomNumber} added to ${showRoomModal.name}.` });
        if (res.data) {
          setRoomsByHotel((current) => {
            const existingRooms = current[showRoomModal._id] || [];
            return {
              ...current,
              [showRoomModal._id]: editingRoom
                ? existingRooms.map((room) => room._id === res.data._id ? res.data : room)
                : [...existingRooms, res.data],
            };
          });
        }
        setShowRoomModal(null);
        setEditingRoom(null);
        setRoomForm({ roomNumber: '', roomType: 'Deluxe', description: '', pricePerNight: '', adults: 2, children: 0, amenities: '', status: 'available' });
        await fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Room could not be saved.' });
    } finally {
      setSavingRoom(false);
    }
  };

  const toggleHotelRooms = async (hotel) => {
    if (expandedHotelId === hotel._id) {
      setExpandedHotelId('');
      return;
    }
    setExpandedHotelId(hotel._id);
    setRoomsError('');
    if (roomsByHotel[hotel._id]) return;

    setRoomsLoadingId(hotel._id);
    try {
      const response = await getHotelById(hotel._id);
      if (response.success) {
        setRoomsByHotel((current) => ({ ...current, [hotel._id]: response.data.rooms || [] }));
      }
    } catch (err) {
      console.error('Failed to load hotel rooms:', err);
      setRoomsError('Rooms for this property could not be loaded.');
    } finally {
      setRoomsLoadingId('');
    }
  };

  const openHotelEditor = (hotel) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name || '',
      description: hotel.description || '',
      city: hotel.location?.city || '',
      address: hotel.location?.address || '',
      phone: hotel.contact?.phone || '',
      email: hotel.contact?.email || '',
    });
    setShowHotelModal(true);
  };

  const openRoomEditor = (hotel, room) => {
    setShowRoomModal(hotel);
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'Deluxe',
      description: room.description || '',
      pricePerNight: room.pricePerNight ?? '',
      adults: room.capacity?.adults ?? 2,
      children: room.capacity?.children ?? 0,
      amenities: (room.amenities || []).join(', '),
      status: room.status || 'available',
    });
  };

  const handleDeleteRoom = async (hotel, room) => {
    if (!window.confirm(`Delete room #${room.roomNumber} from ${hotel.name}? This cannot be undone.`)) return;
    setBusyRoomId(room._id);
    setMsg({ type: '', text: '' });
    try {
      const response = await deleteRoom(room._id);
      if (response.success) {
        setRoomsByHotel((current) => ({
          ...current,
          [hotel._id]: (current[hotel._id] || []).filter((item) => item._id !== room._id),
        }));
        setMsg({ type: 'success', text: `Room #${room.roomNumber} deleted.` });
        await fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Room could not be deleted.' });
    } finally {
      setBusyRoomId('');
    }
  };

  // Handle Booking Status Update
  const handleUpdateStatus = async (bookingId, status) => {
    if (status === 'cancelled' && !window.confirm('Cancel this booking? This updates its status in the reservation system.')) return;
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
  const filteredHotels = hotels.filter((hotel) => {
    const query = hotelSearch.trim().toLowerCase();
    return !query || [hotel.name, hotel.location?.city, hotel.location?.address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const exportManagerReportCsv = () => {
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
    link.download = 'manager-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      className="control-dashboard-shell manager-dashboard-shell"
      title="Hotel Manager Dashboard"
      subtitle="Manage your listed hotels, room pricing, guest reservations, and revenue analytics."
    >
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

      <nav className="control-tabs flex gap-2 overflow-x-auto border-b pb-3" aria-label="Manager dashboard sections">
        {[
          { label: 'Overview', value: 'overview' },
          { label: 'Manage Hotels', value: 'hotels' },
          { label: 'Hotel Bookings', value: 'bookings' },
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
        <div className="control-loading-skeleton h-64 rounded-xl" aria-label="Loading manager dashboard" aria-busy="true"></div>
      ) : error ? (
        <div className="control-empty-state rounded-xl border p-8 text-center" role="alert">
          <AlertCircle className="mx-auto h-9 w-9" />
          <h2 className="mt-3 text-lg font-semibold">Manager data unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button type="button" onClick={fetchData} className="control-primary-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">My hotels</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{analytics?.totalHotels ?? 0}</div>
                  <p className="mt-1 text-xs text-slate-500">Listed properties</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total rooms</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{analytics?.totalRooms ?? 0}</div>
                  <p className="mt-1 text-xs text-slate-500">{analytics?.occupiedRooms ?? 0} occupied · {analytics?.availableRooms ?? 0} available</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total bookings</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{stats.totalBookings}</div>
                  <p className="mt-1 text-xs text-slate-500">{stats.pendingCount ?? 0} pending · {stats.confirmedCount} confirmed</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed stays</span>
                  <div className="mt-2 text-3xl font-bold text-ink">{stats.completedCount}</div>
                  <p className="mt-1 text-xs text-slate-500">Guests checked out</p>
                </div>

                <div className="control-surface rounded-xl border p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid revenue</span>
                  <div className="mt-2 text-3xl font-bold text-forest-700">${stats.totalRevenue}</div>
                  <p className="mt-1 text-xs text-slate-500">Payments received</p>
                </div>
              </div>

              <div className="control-surface rounded-xl border p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reports</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">Property summary</h3>
                  </div>
                  <button type="button" onClick={exportManagerReportCsv} className="control-secondary-button min-h-10 rounded-lg border px-3 text-sm font-semibold">
                    Export report
                  </button>
                </div>

                {report ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Bookings</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.summary?.totalBookings ?? stats.totalBookings}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Confirmed</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.bookingStatusBreakdown?.confirmed ?? stats.confirmedCount}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Paid revenue</div>
                    <div className="mt-1 text-2xl font-bold text-forest-700">${report.revenue?.totalRevenue ?? stats.totalRevenue}</div>
                  </div>
                  <div className="control-metric rounded-lg border p-3">
                    <div className="text-xs uppercase text-slate-500">Properties</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{report.summary?.totalHotels ?? analytics?.totalHotels ?? 0}</div>
                  </div>
                </div> : <p className="rounded-lg border border-dashed p-5 text-sm text-slate-500">Report data is not available.</p>}
              </div>

              {/* Recent Hotel Bookings */}
              <div className="control-surface space-y-4 rounded-xl border p-5 sm:p-6">
                <h3 className="text-base font-semibold text-ink">Recent hotel reservations</h3>
                {analytics?.recentBookings?.length ? <div className="grid gap-3">
                  {analytics.recentBookings.map((booking) => (
                    <article key={booking._id} className="control-record grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-ink">{booking.hotelId?.name}</h4>
                        <p className="mt-1 text-sm text-slate-500">{booking.userId?.name} · {booking.roomId?.roomType} Room</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className={`control-status-badge ${statusClass(booking.bookingStatus)}`}>{booking.bookingStatus}</span>
                        <strong className="text-lg text-forest-700">${booking.totalAmount}</strong>
                      </div>
                    </article>
                  ))}
                </div> : <div className="control-empty-state rounded-lg border border-dashed p-6 text-center text-sm">No recent reservations.</div>}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE HOTELS & ROOMS */}
          {activeTab === 'hotels' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Hotel properties</h2>
                  <p className="mt-1 text-sm text-slate-500">{filteredHotels.length} of {hotels.length} properties</p>
                </div>
                <label className="control-search relative w-full sm:max-w-xs">
                  <span className="sr-only">Search hotels</span>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="search" value={hotelSearch} onChange={(event) => setHotelSearch(event.target.value)} placeholder="Search name or location" className="control-field w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm" />
                </label>
                <button
                  onClick={() => { setEditingHotel(null); setHotelForm({ name: '', description: '', city: '', address: '', phone: '', email: '' }); setShowHotelModal(true); }}
                  className="control-primary-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add hotel</span>
                </button>
              </div>

              {filteredHotels.length ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredHotels.map((hotel) => (
                  <article key={hotel._id} className="control-surface overflow-hidden rounded-xl border">
                    <div className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)]">
                      <div className="control-hotel-image h-36 sm:h-full">
                        {hotel.images?.[0] ? <img src={hotel.images[0]} alt={hotel.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full min-h-28 place-items-center text-slate-400"><ImageOff className="h-6 w-6" /></div>}
                      </div>
                      <div className="min-w-0 space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-ink">{hotel.name}</h3>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4 shrink-0" />{[hotel.location?.address, hotel.location?.city].filter(Boolean).join(', ')}</p>
                          </div>
                          <span className={`control-status-badge ${statusClass(hotel.status)}`}>{hotel.status}</span>
                        </div>
                        <p className="line-clamp-2 text-sm text-slate-500">{hotel.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          {Number(hotel.rating?.average) > 0 && <span>Rating {Number(hotel.rating.average).toFixed(1)} · {hotel.rating.count || 0} reviews</span>}
                          {Number(hotel.rating?.average) <= 0 && <span>No rating yet</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t pt-3">
                          <button type="button" onClick={() => openHotelEditor(hotel)} className="control-secondary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Edit className="h-4 w-4" />Edit</button>
                          <button type="button" onClick={() => { setEditingRoom(null); setRoomForm({ roomNumber: '', roomType: 'Deluxe', description: '', pricePerNight: '', adults: 2, children: 0, amenities: '', status: 'available' }); setShowRoomModal(hotel); }} className="control-secondary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Plus className="h-4 w-4" />Add room</button>
                          <button type="button" onClick={() => toggleHotelRooms(hotel)} aria-expanded={expandedHotelId === hotel._id} className="control-secondary-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Bed className="h-4 w-4" />Rooms<ChevronDown className={`h-4 w-4 transition-transform ${expandedHotelId === hotel._id ? 'rotate-180' : ''}`} /></button>
                          <button type="button" onClick={() => handleDeleteHotel(hotel)} className="control-danger-button inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold"><Trash2 className="h-4 w-4" />Delete</button>
                        </div>
                      </div>
                    </div>
                    {expandedHotelId === hotel._id && (
                      <div className="control-room-list border-t p-4">
                        {roomsLoadingId === hotel._id ? <p className="text-sm text-slate-500">Loading rooms...</p>
                          : roomsError ? <p className="text-sm text-red-700" role="alert">{roomsError}</p>
                            : roomsByHotel[hotel._id]?.length ? <div className="space-y-2">
                              {roomsByHotel[hotel._id].map((room) => (
                                <div key={room._id} className="control-room-row grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-ink">{room.roomType} · #{room.roomNumber}</strong><span className={`control-status-badge ${statusClass(room.status)}`}>{room.status}</span></div>
                                    <p className="mt-1 text-xs text-slate-500">${room.pricePerNight} / night · {room.capacity?.adults || 0} adults · {room.capacity?.children || 0} children</p>
                                    {room.amenities?.length > 0 && <p className="mt-1 truncate text-xs text-slate-500">{room.amenities.join(' · ')}</p>}
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => openRoomEditor(hotel, room)} className="control-secondary-button inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold"><Edit className="h-3.5 w-3.5" />Edit</button>
                                    <button type="button" onClick={() => handleDeleteRoom(hotel, room)} disabled={busyRoomId === room._id} className="control-danger-button inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />{busyRoomId === room._id ? 'Deleting' : 'Delete'}</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            : <p className="control-empty-state rounded-lg border border-dashed p-4 text-sm">No rooms are listed for this hotel.</p>}
                      </div>
                    )}
                  </article>
                ))}
              </div> : <div className="control-empty-state rounded-xl border border-dashed p-10 text-center text-sm">{hotels.length ? 'No hotels match this search.' : 'No hotels are assigned to this manager yet.'}</div>}
            </div>
          )}

          {/* TAB 3: BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="control-surface space-y-4 rounded-xl border p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Guest reservations</h2>
                  <p className="mt-1 text-sm text-slate-500">{bookings.length} reservations in this view</p>
                </div>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 sm:w-52">
                  Booking status
                  <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value)} className="control-field min-h-10 rounded-lg border px-3 text-sm">
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
                      <h3 className="mt-2 text-base font-semibold text-ink">{booking.hotelId?.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span>{booking.userId?.name} · {booking.userId?.phone || booking.userId?.email}</span>
                        <span>{booking.roomId?.roomType} Room (#{booking.roomId?.roomNumber})</span>
                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                        <span>{Number(booking.guests?.adults || 0) + Number(booking.guests?.children || 0)} guests</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                      <strong className="text-xl text-forest-700">${booking.totalAmount}</strong>
                      {booking.bookingStatus !== 'completed' && booking.bookingStatus !== 'cancelled' && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleUpdateStatus(booking._id, 'completed')} className="control-secondary-button min-h-10 rounded-lg border px-3 text-sm font-semibold">Check out</button>
                          <button type="button" onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="control-danger-button min-h-10 rounded-lg border px-3 text-sm font-semibold">Cancel</button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div> : <div className="control-empty-state rounded-lg border border-dashed p-8 text-center text-sm">No reservations match this status.</div>}
            </div>
          )}
        </>
      )}

      {/* Add Hotel Modal */}
      {showHotelModal && (
        <div className="control-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="control-dialog max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-xl border bg-white p-5 shadow-xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="manager-hotel-dialog-title">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">Property details</p>
                <h2 id="manager-hotel-dialog-title" className="font-display text-2xl text-ink">{editingHotel ? 'Edit hotel' : 'Add hotel'}</h2>
              </div>
              <button type="button" onClick={() => { setShowHotelModal(false); setEditingHotel(null); }} aria-label="Close hotel form" className="control-secondary-button rounded-lg border p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Hotel name *</label>
                <input
                  type="text"
                  maxLength={120}
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="Property name"
                  className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">City *</label>
                  <input
                    type="text"
                    value={hotelForm.city}
                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                    placeholder="City"
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Street address *</label>
                  <input
                    type="text"
                    value={hotelForm.address}
                    onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                    placeholder="Street address"
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Description *</label>
                <textarea
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  placeholder="Describe the property and guest experience"
                  className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                  rows="4"
                  maxLength={2000}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Contact phone *</label>
                  <input
                    type="tel"
                    value={hotelForm.phone}
                    onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                    placeholder="Phone number"
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Contact email *</label>
                  <input
                    type="email"
                    value={hotelForm.email}
                    onChange={(e) => setHotelForm({ ...hotelForm, email: e.target.value })}
                    placeholder="reservations@example.com"
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowHotelModal(false); setEditingHotel(null); }}
                  disabled={savingHotel}
                  className="control-secondary-button min-h-11 flex-1 rounded-lg border px-4 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHotel}
                  className="control-primary-button min-h-11 flex-1 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingHotel ? 'Saving...' : editingHotel ? 'Save changes' : 'Create hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <div className="control-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="control-dialog max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-xl border bg-white p-5 shadow-xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="manager-room-dialog-title">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">{showRoomModal.name}</p>
                <h2 id="manager-room-dialog-title" className="font-display text-2xl text-ink">{editingRoom ? 'Edit room' : 'Add room'}</h2>
              </div>
              <button type="button" onClick={() => { setShowRoomModal(null); setEditingRoom(null); }} aria-label="Close room form" className="control-secondary-button rounded-lg border p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Room number *</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="101"
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Room type *</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                    <option value="Presidential">Presidential</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Price per night ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  placeholder="120"
                  className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Room description</label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  placeholder="Room specifications and details"
                  className="control-field w-full rounded-lg border px-3 py-3 text-sm"
                  rows="2"
                ></textarea>
              </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">Adult capacity</label>
                    <input type="number" min="1" value={roomForm.adults} onChange={(event) => setRoomForm({ ...roomForm, adults: event.target.value })} className="control-field w-full rounded-lg border px-3 py-3 text-sm" required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">Child capacity</label>
                    <input type="number" min="0" value={roomForm.children} onChange={(event) => setRoomForm({ ...roomForm, children: event.target.value })} className="control-field w-full rounded-lg border px-3 py-3 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Amenities</label>
                  <input type="text" value={roomForm.amenities} onChange={(event) => setRoomForm({ ...roomForm, amenities: event.target.value })} placeholder="Separate amenities with commas" className="control-field w-full rounded-lg border px-3 py-3 text-sm" />
                </div>

                {editingRoom && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">Room status</label>
                    <select value={roomForm.status} onChange={(event) => setRoomForm({ ...roomForm, status: event.target.value })} className="control-field w-full rounded-lg border px-3 py-3 text-sm">
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                    onClick={() => { setShowRoomModal(null); setEditingRoom(null); }}
                    disabled={savingRoom}
                    className="control-secondary-button min-h-11 flex-1 rounded-lg border px-4 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="control-primary-button min-h-11 flex-1 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingRoom ? 'Saving...' : editingRoom ? 'Save room' : 'Create room'}
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
