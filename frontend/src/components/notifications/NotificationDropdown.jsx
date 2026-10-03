import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, CreditCard, Star, CalendarCheck, AlertCircle, X, CheckCheck, CalendarX, ShieldAlert, ShieldCheck, LoaderCircle, RefreshCw } from 'lucide-react';

const formatTimestamp = (value) => new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
}).format(new Date(value));

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } else {
        throw new Error(res.message || 'Notifications could not be loaded.');
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Notifications could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live notification updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markAsRead(id);
      if (!res.success) return;
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!user) return null;

  const iconByType = {
    booking_confirmed: <CalendarCheck className="h-4 w-4 text-cyan-400 shrink-0" />,
    booking_cancelled: <CalendarX className="h-4 w-4 text-amber-700 shrink-0" />,
    payment_completed: <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />,
    payment_failed: <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />,
    review_submitted: <Star className="h-4 w-4 text-purple-400 shrink-0" />,
    review_approved: <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0" />,
    review_rejected: <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />,
    system_alert: <ShieldAlert className="h-4 w-4 text-forest-600 shrink-0" />,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="notification-trigger relative rounded-lg p-2 text-slate-500 transition-colors hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-cyan-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <section className="notification-panel absolute right-0 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border bg-white shadow-xl animate-in fade-in slide-in-from-top-2" role="dialog" aria-label="Notifications">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Notifications</h2>
              {unreadCount > 0 && (
                <span className="customer-status-badge status-pending">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                type="button"
                className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-forest-700 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[min(26rem,65vh)] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500" role="status">
                <LoaderCircle className="h-4 w-4 animate-spin" />Loading notifications
              </div>
            ) : error ? (
              <div className="p-6 text-center" role="alert">
                <p className="text-sm text-slate-600">{error}</p>
                <button type="button" onClick={fetchNotifications} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-forest-700"><RefreshCw className="h-4 w-4" />Try again</button>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                  type="button"
                  disabled={n.isRead}
                  className={`notification-item flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    !n.isRead ? 'notification-unread' : 'notification-read'
                  }`}
                >
                  <div className="pt-0.5">
                    {iconByType[n.type] || <Bell className="h-4 w-4 text-slate-400" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{n.title}</span>
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {formatTimestamp(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                <Bell className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                <span>No notifications yet</span>
              </div>
            )}
          </div>

        </section>
      )}

    </div>
  );
};

export default NotificationDropdown;
