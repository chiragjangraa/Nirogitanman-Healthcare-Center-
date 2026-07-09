import axios from 'axios';

const api = axios.create({
 baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — auto-attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — log 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized — token may be expired or invalid');
    }
    return Promise.reject(error);
  }
);

// ─── Auth (Admin) ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// ─── Users (Patients) ─────────────────────────────────────────
export const usersAPI = {
  register: (data) => api.post('/users/register', data),
  login: (email, password) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: () => api.get('/users'),             // Admin: get all patients
};

// ─── Doctors ──────────────────────────────────────────────────
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// ─── Services ─────────────────────────────────────────────────
export const servicesAPI = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),                      // Admin: all
  getMy: () => api.get('/appointments/my'),                    // Patient: own
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
};

// ─── Messages ─────────────────────────────────────────────────
export const messagesAPI = {
  create: (data) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  delete: (id) => api.delete(`/messages/${id}`),
};

// ─── Blogs ────────────────────────────────────────────────────
export const blogsAPI = {
  getAll: () => api.get('/blogs'),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

// ─── Gallery ──────────────────────────────────────────────────
export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  create: (data) => api.post('/gallery', data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// ─── Settings ─────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// ─── Medical Records ──────────────────────────────────────────
export const medicalRecordsAPI = {
  getByUserId: (userId) => api.get(`/medical-records/user/${userId}`),
  getAll: () => api.get('/medical-records'),
  create: (data) => api.post('/medical-records', data),
  update: (id, data) => api.put(`/medical-records/${id}`, data),
  delete: (id) => api.delete(`/medical-records/${id}`),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications', data),             // Admin: send notification
  getAllAdmin: () => api.get('/notifications/admin/all'),        // Admin: view all
};

// ─── FAQs ─────────────────────────────────────────────────────
export const faqsAPI = {
  getAll: () => api.get('/faqs'),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
};

export default api;
