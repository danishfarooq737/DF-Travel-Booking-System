import apiClient from './client';

export const registerUser = (payload) =>
  apiClient.post('/auth/register', payload).then((r) => r.data);

export const loginUser = (payload) =>
  apiClient.post('/auth/login', payload).then((r) => r.data);

export const googleLoginUser = (credential) =>
  apiClient
    .post('/auth/google', { credential })
    .then((r) => r.data);

export const fetchMe = () =>
  apiClient.get('/auth/me').then((r) => r.data);

export const updateProfile = (payload) =>
  apiClient.put('/auth/profile', payload).then((r) => r.data);

export const changePassword = (payload) =>
  apiClient
    .put('/auth/change-password', payload)
    .then((r) => r.data);

export const logoutUser = () =>
  apiClient.post('/auth/logout').then((r) => r.data);