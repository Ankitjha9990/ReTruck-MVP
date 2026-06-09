import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Toast from './components/common/Toast/Toast.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Auth from './pages/Auth/index.jsx';
import DriverDashboard from './pages/DriverDashboard/index.jsx';
import ShipperDashboard from './pages/ShipperDashboard/index.jsx';
import DriverProfile from './pages/DriverProfile/index.jsx';
import AddRoute from './pages/AddRoute/index.jsx';
import TruckSearch from './pages/TruckSearch/index.jsx';
import TruckDetails from './pages/TruckDetails/index.jsx';
import BookingConfirm from './pages/BookingConfirm/index.jsx';
import MyListings from './pages/MyListings/index.jsx';
import BookingRequests from './pages/BookingRequests/index.jsx';
import ConfirmedBookings from './pages/ConfirmedBookings/index.jsx';
import MyTruck from './pages/MyTruck/index.jsx';
import MyBookings from './pages/MyBookings/index.jsx';
import SavedTrucks from './pages/SavedTrucks/index.jsx';
import Settings from './pages/Settings/index.jsx';
import BookingDetails from './pages/BookingDetails/index.jsx';
import BusinessProfile from './pages/BusinessProfile/index.jsx';
import Notifications from './pages/Notifications/index.jsx';
import './styles/variables.css';

/* ─── Route Guard ────────────────────────────────────── */
function RequireAuth(props) {
  var children = props.children;
  var allowedRoles = props.allowedRoles;
  var auth = useAuth();

  // Wait for Supabase auth session to be restored before redirecting
  if (auth.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-border, #E5E7EB)', borderTop: '3px solid var(--color-green, #2ECC8F)', borderRadius: '50%', animation: 'spin 700ms linear infinite' }}></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && allowedRoles.indexOf(auth.role) === -1) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ─── Role-Aware Dashboard Router ────────────────────── */
function DashboardRouter() {
  var auth = useAuth();
  if (auth.role === 'shipper') {
    return <ShipperDashboard />;
  }
  return <DriverDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SearchProvider>
          <BookingProvider>
            <BrowserRouter>
              <Routes>
                {/* PUBLIC */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/trucks" element={<TruckSearch />} />
                <Route path="/trucks/:id" element={<TruckDetails />} />

                {/* PROTECTED — Role-aware Dashboard */}
                <Route path="/dashboard" element={
                  <RequireAuth allowedRoles={['driver', 'shipper']}>
                    <DashboardRouter />
                  </RequireAuth>
                } />

                {/* PROTECTED — Driver Sub-Pages */}
                <Route path="/dashboard/listings" element={
                  <RequireAuth allowedRoles={['driver']}>
                    <MyListings />
                  </RequireAuth>
                } />
                <Route path="/dashboard/requests" element={
                  <RequireAuth allowedRoles={['driver']}>
                    <BookingRequests />
                  </RequireAuth>
                } />
                <Route path="/dashboard/confirmed" element={
                  <RequireAuth allowedRoles={['driver']}>
                    <ConfirmedBookings />
                  </RequireAuth>
                } />
                <Route path="/dashboard/my-truck" element={
                  <RequireAuth allowedRoles={['driver']}>
                    <MyTruck />
                  </RequireAuth>
                } />

                {/* PROTECTED — Shipper Sub-Pages */}
                <Route path="/dashboard/bookings" element={
                  <RequireAuth allowedRoles={['shipper']}>
                    <MyBookings />
                  </RequireAuth>
                } />
                <Route path="/dashboard/bookings/:id" element={
                  <RequireAuth allowedRoles={['shipper']}>
                    <BookingDetails />
                  </RequireAuth>
                } />
                <Route path="/shipper/profile" element={
                  <RequireAuth allowedRoles={['shipper']}>
                    <BusinessProfile />
                  </RequireAuth>
                } />
                <Route path="/dashboard/notifications" element={
                  <RequireAuth allowedRoles={['shipper']}>
                    <Notifications />
                  </RequireAuth>
                } />
                <Route path="/dashboard/saved" element={
                  <RequireAuth allowedRoles={['shipper']}>
                    <SavedTrucks />
                  </RequireAuth>
                } />

                {/* PROTECTED — Profile (both roles) */}
                <Route path="/profile" element={
                  <RequireAuth allowedRoles={['driver', 'shipper']}>
                    <DriverProfile />
                  </RequireAuth>
                } />

                {/* PROTECTED — Driver only: Add Route */}
                <Route path="/driver/add-route" element={
                  <RequireAuth allowedRoles={['driver']}>
                    <AddRoute />
                  </RequireAuth>
                } />

                {/* PROTECTED — Booking Confirmation */}
                <Route path="/booking/confirm" element={
                  <RequireAuth allowedRoles={['driver', 'shipper']}>
                    <BookingConfirm />
                  </RequireAuth>
                } />

                {/* PROTECTED — Settings (both) */}
                <Route path="/settings" element={
                  <RequireAuth allowedRoles={['driver', 'shipper']}>
                    <Settings />
                  </RequireAuth>
                } />

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toast />
            </BrowserRouter>
          </BookingProvider>
        </SearchProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
