import apiClient from './client';

export const createPayment = (bookingId) =>
  apiClient.post('/payments/create', { bookingId }).then((r) => r.data);

export const getPaymentById = (id) => apiClient.get(`/payments/${id}`).then((r) => r.data);

export const verifyPayment = (id) => apiClient.get(`/payments/${id}/verify`).then((r) => r.data);
