import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AdminRoute from './components/layout/AdminRoute.jsx';
import AccountLayout from './components/layout/AccountLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import TravelDetails from './pages/TravelDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import NotFound from './pages/NotFound.jsx';

import Profile from './pages/user/Profile.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import MyBookings from './pages/user/MyBookings.jsx';
import BookingDetails from './pages/user/BookingDetails.jsx';
import Notifications from './pages/user/Notifications.jsx';
import Checkout from './pages/user/Checkout.jsx';
import Payment from './pages/user/Payment.jsx';
import BookingConfirmation from './pages/user/BookingConfirmation.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageTravel from './pages/admin/ManageTravel.jsx';
import TravelForm from './pages/admin/TravelForm.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ManagePayments from './pages/admin/ManagePayments.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="travel/:id" element={<TravelDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />

        {/* Authenticated (non-nested) booking/payment flow */}
        <Route element={<ProtectedRoute />}>
          <Route path="book/:travelId" element={<Checkout />} />
          <Route path="payment/:bookingId" element={<Payment />} />
          <Route path="payment/:bookingId/return" element={<BookingConfirmation />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* User account section */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<AccountLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Admin section */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="travel" element={<ManageTravel />} />
            <Route path="travel/new" element={<TravelForm />} />
            <Route path="travel/:id/edit" element={<TravelForm />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
