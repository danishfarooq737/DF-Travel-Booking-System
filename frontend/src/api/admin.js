import apiClient from './client';

export const adminGetUsers = () => apiClient.get('/admin/users').then((r) => r.data);

export const adminUpdateUser = (id, payload) =>
  apiClient.put(`/admin/users/${id}`, payload).then((r) => r.data);

export const adminDeleteUser = (id) => apiClient.delete(`/admin/users/${id}`).then((r) => r.data);

export const adminGetBookings = () => apiClient.get('/admin/bookings').then((r) => r.data);

export const adminUpdateBookingStatus = (id, bookingStatus) =>
  apiClient.put(`/admin/bookings/${id}`, { bookingStatus }).then((r) => r.data);

export const adminGetPayments = () => apiClient.get('/admin/payments').then((r) => r.data);
