import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("Sending token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Medications
export const createMedication = (data) => api.post('/medications', data);
export const getMedications = () => api.get('/medications');
export const updateMedication = (id, data) => api.put(`/medications/${id}`, data);
export const deleteMedication = (id) => api.delete(`/medications/${id}`);

// Reminders
export const createReminder = (data) => api.post('/reminders', data);
export const getReminders = () => api.get('/reminders');
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);

// Doctors
export const createDoctor = (data) => api.post('/doctors', data);
export const getDoctors = () => api.get('/doctors');
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// History
export const createHistory = (data) => api.post('/history', data);
export const getHistory = () => api.get('/history');

// Reports
export const createReport = (data) => api.post('/reports', data);
export const getReports = () => api.get('/reports');

export default api;