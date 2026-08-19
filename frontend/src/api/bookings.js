import apiClient from './client';

export const createBooking = (payload) => apiClient.post('/bookings', payload).then((r) => r.data);

export const getMyBookings = (params = {}) =>
  apiClient.get('/bookings', { params }).then((r) => r.data);

export const getBookingById = (id) => apiClient.get(`/bookings/${id}`).then((r) => r.data);

export const cancelBooking = (id) => apiClient.put(`/bookings/${id}/cancel`).then((r) => r.data);
