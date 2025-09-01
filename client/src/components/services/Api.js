import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Medications API
export const getMedications = () => api.get('/medications');
export const createMedication = (data) => api.post('/medications', data);
export const updateMedication = (id, data) => api.patch(`/medications/${id}`, data);
export const deleteMedication = (id) => api.delete(`/medications/${id}`);
export const markAsTaken = (id) => api.post(`/medications/${id}/mark-taken`);
export const getUpcomingMedications = () => api.get('/medications/upcoming/medications');

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (userData) => api.post('/auth/signup', userData);

export default api;