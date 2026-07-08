import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  register: (data) => api.post('/users/register', data),
  login: (email, password) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
};

export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
};

export const messagesAPI = {
  create: (data) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  delete: (id) => api.delete(`/messages/${id}`),
};

export const blogsAPI = {
  getAll: () => api.get('/blogs'),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  create: (data) => api.post('/gallery', data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
