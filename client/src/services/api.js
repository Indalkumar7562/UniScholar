import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('uss_token');
      localStorage.removeItem('uss_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe:    ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
  getConfig: ()    => api.get('/auth/config'),
};


// ─── Documents ───────────────────────────────────────────────────────────────
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/documents'),
  delete: (id) => api.delete(`/documents/${id}`),
};


// ─── User / Profile ──────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:      ()         => api.get('/users/profile'),
  saveProfile:     (data)     => api.put('/users/profile', data),
  uploadAvatar:    (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getBookmarks:    ()         => api.get('/users/bookmarks'),
  toggleBookmark:  (schemeId) => api.post(`/users/bookmarks/${schemeId}`),
};


// ─── Schemes ─────────────────────────────────────────────────────────────────
export const schemeAPI = {
  getAll:   (params) => api.get('/schemes', { params }),
  getById:  (id)     => api.get(`/schemes/${id}`),  compareAndRank: () => api.get('/schemes/compare/ranked'),  create:   (data)   => api.post('/schemes', data),
  update:   (id, data) => api.put(`/schemes/${id}`, data),
  delete:   (id)     => api.delete(`/schemes/${id}`),
};

// ─── Eligibility ─────────────────────────────────────────────────────────────
export const eligibilityAPI = {
  check:      () => api.post('/eligibility/check'),
  getResults: () => api.get('/eligibility/results'),
};

// ─── AI Endpoints ────────────────────────────────────────────────────────────
export const aiAPI = {
  verifyDocument: (documentType, fileUrl) => api.post('/ai/verify-document', { documentType, fileUrl }),
  getRecommendations: () => api.get('/ai/recommendations'),
  chat: (message, context) => api.post('/ai/chat', { message, context }),
};

// ─── Notifications Endpoints ──────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Admin Endpoints ─────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  exportReport: () => api.get('/admin/reports/export', { responseType: 'blob' }),
};

export default api;

