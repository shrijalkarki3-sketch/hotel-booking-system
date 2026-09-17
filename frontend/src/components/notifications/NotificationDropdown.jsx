import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, CreditCard, Star, CalendarCheck, AlertCircle, X, CheckCheck } from 'lucide-react';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
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
      await markAsRead(id);
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
    payment_completed: <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />,
    payment_failed: <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />,
    review_submitted: <Star className="h-4 w-4 text-purple-400 shrink-0" />,
    review_approved: <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="pt-0.5">
                    {iconByType[n.type] || <Bell className="h-4 w-4 text-slate-400" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <Bell className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <span>No notifications yet</span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationDropdown;
