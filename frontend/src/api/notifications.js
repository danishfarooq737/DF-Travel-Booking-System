import apiClient from './client';

export const getNotifications = () => apiClient.get('/notifications').then((r) => r.data);

export const markNotificationRead = (id) =>
  apiClient.put(`/notifications/${id}/read`).then((r) => r.data);
