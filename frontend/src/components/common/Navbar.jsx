import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { 
  Building2, 
  User, 
  LogOut, 
  ShieldCheck, 
  Briefcase, 
  Menu, 
  X, 
  ChevronDown,
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const roleBadgeColor = {
    customer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hotel_manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const roleTitle = {
    customer: 'Customer',
    hotel_manager: 'Hotel Manager',
    admin: 'Administrator',
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-wide group-hover:text-cyan-400 transition-colors">
                GrandStay
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Hotel Booking System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link 
              to="/" 
              className={`transition-colors ${location.pathname === '/' ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Home
            </Link>

            <Link 
              to="/hotels" 
              className={`transition-colors ${location.pathname.startsWith('/hotels') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Explore Hotels
            </Link>
            
            {isAuthenticated && user?.role === 'customer' && (
              <Link 
                to="/my-bookings" 
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <CalendarCheck className="h-4 w-4 text-cyan-400" />
                My Bookings
              </Link>
            )}

            {isAuthenticated && user?.role === 'hotel_manager' && (
              <Link 
                to="/manager/dashboard" 
                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <Briefcase className="h-4 w-4" />
                Manager Dashboard
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right Section: Auth Buttons, Notifications & User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 transition-all text-left"
                  >
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{roleTitle[user?.role] || user?.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 text-xs z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-[10px] text-slate-400">Signed in as</p>
                        <p className="font-semibold text-white truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded border ${roleBadgeColor[user?.role]}`}>
                          {roleTitle[user?.role]}
                        </span>
                      </div>

                      {user?.role === 'customer' && (
                        <Link
                          to="/customer/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-400" />
                          <span>Customer Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="h-4 w-4 text-cyan-400" />
                        <span>My Profile</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left border-t border-slate-800 mt-1"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
