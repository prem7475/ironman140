import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('paceforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (data) => api.post('/auth/google', data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRegistrations: () => api.get('/admin/registrations'),
  createUser: (data) => api.post('/admin/users', data),
  updateSettings: (data) => api.patch('/admin/settings', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

export const eventService = {
  getEvents: () => api.get('/events'),
  getEventBySlug: (category, slug) => api.get(`/events/${category}/${slug}`),
};

export const registrationService = {
  registerForEvent: (data) => api.post(`/registrations/events/${data.eventId}/register`, data),
  getMyRaces: () => api.get('/registrations/my-races'),
  getRegistration: (id) => api.get(`/registrations/${encodeURIComponent(id)}`),
  getTicket: (id) => api.get(`/registrations/${id}/ticket`),
};

export default api;
