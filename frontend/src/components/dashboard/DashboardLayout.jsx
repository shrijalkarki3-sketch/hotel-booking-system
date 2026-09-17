import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Briefcase, 
  ShieldCheck, 
  User, 
  CalendarCheck, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  Bed, 
  Users, 
  TrendingUp,
  Search
} from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navByRole = {
    customer: [
      { label: 'Dashboard Overview', path: '/customer/dashboard', icon: LayoutDashboard },
      { label: 'My Bookings', path: '/my-bookings', icon: CalendarCheck },
      { label: 'Browse Hotels', path: '/hotels', icon: Search },
      { label: 'Account Profile', path: '/profile', icon: User },
    ],
    hotel_manager: [
      { label: 'Manager Overview', path: '/manager/dashboard', icon: LayoutDashboard },
      { label: 'Manage Hotels & Rooms', path: '/manager/dashboard?tab=hotels', icon: Building2 },
      { label: 'Hotel Bookings', path: '/manager/dashboard?tab=bookings', icon: CalendarCheck },
      { label: 'Account Profile', path: '/profile', icon: User },
    ],
    admin: [
      { label: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Management', path: '/admin/dashboard?tab=users', icon: Users },
      { label: 'System Hotels', path: '/admin/dashboard?tab=hotels', icon: Building2 },
      { label: 'Global Bookings', path: '/admin/dashboard?tab=bookings', icon: CalendarCheck },
      { label: 'Account Profile', path: '/profile', icon: User },
    ],
  };

  const currentNav = navByRole[user?.role] || navByRole.customer;

  const roleBadgeColor = {
    customer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hotel_manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Mobile Topbar Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-base">GrandStay</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen z-30 transition-transform md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 bg-slate-900' : '-translate-x-full md:block hidden'
      }`}>
        <div className="space-y-6">
          
          {/* Brand Header */}
          <Link to="/" className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">GrandStay</span>
              <span className="block text-[10px] text-slate-400 capitalize">{user?.role?.replace('_', ' ')} Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {currentNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname + location.search === item.path || (location.pathname === item.path && !location.search);
              
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Card */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30 shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <span className={`inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded border capitalize ${roleBadgeColor[user?.role]}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Top Header */}
        <header className="bg-slate-900/60 border-b border-slate-800 py-4 px-6 sm:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link to="/" className="text-xs text-slate-400 hover:text-cyan-400 font-semibold">
              Return to Public Site →
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
