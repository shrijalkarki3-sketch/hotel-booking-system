import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Discovery Pages
import Home from './pages/public/Home';
import SearchResults from './pages/public/SearchResults';
import HotelDetail from './pages/public/HotelDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Unauthorized from './pages/public/Unauthorized';

// Protected Customer Pages
import Profile from './pages/customer/Profile';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PaymentCheckout from './pages/customer/PaymentCheckout';
import PaymentResult from './pages/customer/PaymentResult';

// Protected Role Dashboards
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<SearchResults />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Profile Route */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Customer Portal Routes */}
              <Route 
                path="/customer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-bookings/:id" 
                element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                } 
              />

              {/* Customer Payment Routes */}
              <Route 
                path="/payment/checkout/:bookingId" 
                element={
                  <ProtectedRoute>
                    <PaymentCheckout />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/payment/result" 
                element={
                  <ProtectedRoute>
                    <PaymentResult />
                  </ProtectedRoute>
                } 
              />

              {/* Hotel Manager Dashboard */}
              <Route 
                path="/manager/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['hotel_manager', 'admin']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* System Admin Dashboard */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
