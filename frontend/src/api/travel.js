import apiClient from './client';

// params: destination, minPrice, maxPrice, travelType, travelers, dateFrom, dateTo, page, limit, sort
export const searchTravel = (params = {}) =>
  apiClient.get('/travel', { params }).then((r) => r.data);

export const getTravelById = (id) => apiClient.get(`/travel/${id}`).then((r) => r.data);

export const createTravel = (payload) => apiClient.post('/travel', payload).then((r) => r.data);

export const updateTravel = (id, payload) => apiClient.put(`/travel/${id}`, payload).then((r) => r.data);

export const deleteTravel = (id) => apiClient.delete(`/travel/${id}`).then((r) => r.data);
