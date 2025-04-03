import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import SignUp from './pages/signup';
import ForgotPassword from './pages/forgot-password';
import Admin from './pages/admin/admin';
import AdminViewEvents from './pages/admin/admin-view-events';
import CreateEvent from './pages/admin/admin-create-event';
import AdminUsers from './pages/admin/admin-users';
import User from './pages/user/user';
import Tickets from './pages/user/user-tickets';
import UserTicketsDetail from './pages/user/user-tickets-detail';
import ViewTickets from './pages/user/user-view-tickets';
import ProfileSettings from './pages/user/user-profile';
import { AuthProvider } from "./context/authContext";
import { EventProvider } from "./context/eventContext";
import { TicketProvider } from "./context/ticketContext";
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminProfile from './pages/admin/admin-profile';
import AdminSettings from './pages/admin/admin-settings';
import AdminCheckIn from './pages/admin/admin-checkin';
import AdminAttendance from "./pages/admin/admin-attendance.jsx";
import UserEvents from "./pages/user/user-events";
import Landing from './pages/landing';
import TicketConfirmation from './pages/user/ticket-confirmation';

function App() {
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <TicketProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* User Routes */}
              <Route path="/user" element={<User />} />
              <Route path="/user-tickets" element={<Tickets />} />
              <Route path="/user-tickets/:id" element={<UserTicketsDetail />} />
              <Route path="/user-view-tickets" element={<ViewTickets />} />
              <Route path="/user-profile" element={<ProfileSettings />} />
              <Route path="/user-events" element={<UserEvents />} />
              <Route path="/ticket-confirmation" element={<TicketConfirmation />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-view-events" element={
                <ProtectedAdminRoute>
                  <AdminViewEvents />
                </ProtectedAdminRoute>
              } />
              <Route path="/create-event" element={
                <ProtectedAdminRoute>
                  <CreateEvent />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-users" element={
                <ProtectedAdminRoute>
                  <AdminUsers />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-profile" element={
                <ProtectedAdminRoute>
                  <AdminProfile />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-settings" element={
                <ProtectedAdminRoute>
                  <AdminSettings />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-checkin" element={
                <ProtectedAdminRoute>
                  <AdminCheckIn />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin-attendance" element={
                <ProtectedAdminRoute>
                  <AdminAttendance />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </TicketProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;