import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getPendingAdmins: () => api.get('/users/pending-admins'),
  approveCountyAdmin: (id, approved) => api.put(`/users/${id}/approve`, { approved }),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByNationalId: (nationalId) => api.get(`/users/search/national-id/${nationalId}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  // Super Admin only - NLC Admin management
  createNLCAdmin: (data) => api.post('/users/nlc-admin', data),
  getAllNLCAdmins: () => api.get('/users/nlc-admins'),
  updateNLCAdmin: (id, data) => api.put(`/users/nlc-admin/${id}`, data),
  deleteNLCAdmin: (id) => api.delete(`/users/nlc-admin/${id}`),
};

// Parcel APIs
export const parcelAPI = {
  getAllParcels: (params) => api.get('/parcels', { params }),
  getParcelById: (id) => api.get(`/parcels/${id}`),
  getParcelByTitleNumber: (titleNumber) => api.get(`/parcels/title/${titleNumber}`),
  getMyParcels: () => api.get('/parcels/my/parcels'),
  createParcel: (data) => api.post('/parcels', data),
  updateParcel: (id, data) => api.put(`/parcels/${id}`, data),
  deleteParcel: (id) => api.delete(`/parcels/${id}`),
  searchParcels: (query) => api.get('/parcels/search', { params: { q: query } }),
  // Approval workflows
  getPendingParcels: () => api.get('/parcels/pending/approvals'),
  countyAdminApproval: (id, data) => api.put(`/parcels/${id}/county-approval`, data),
  nlcAdminApproval: (id, data) => api.put(`/parcels/${id}/nlc-approval`, data),
  // PDF and Transfer History
  getTitleDeedPDF: (id) => api.get(`/parcels/${id}/title-deed-pdf`, { responseType: 'blob' }),
  viewTitleDeedPDF: (id) => api.get(`/parcels/${id}/title-deed-pdf/view`, { responseType: 'blob' }),
  getTransferHistoryPDF: (id) => api.get(`/parcels/${id}/transfer-history-pdf`, { responseType: 'blob' }),
  getTransferHistory: (id) => api.get(`/parcels/${id}/transfer-history`),
};

// Transfer APIs
export const transferAPI = {
  initiateTransfer: (data) => api.post('/transfers', data),
  getAllTransfers: (params) => api.get('/transfers', { params }),
  getTransferById: (id) => api.get(`/transfers/${id}`),
  acceptTransfer: (id, remarks) => api.put(`/transfers/${id}/accept`, { remarks }),
  rejectTransfer: (id, reason) => api.put(`/transfers/${id}/reject`, { reason }),
  countyVerifyTransfer: (id, data) => api.put(`/transfers/${id}/county-verify`, data),
  nlcApproveTransfer: (id, data) => api.put(`/transfers/${id}/nlc-approve`, data),
  cancelTransfer: (id, reason) => api.put(`/transfers/${id}/cancel`, { reason }),
};

// Region APIs
export const regionAPI = {
  getAllRegions: () => api.get('/regions'),
  getRegionByCounty: (county) => api.get(`/regions/${county}`),
  getCountiesList: () => api.get('/regions/counties/list'),
  getConstituenciesByCounty: (county) => api.get(`/regions/${county}/constituencies`),
  getWardsByConstituency: (county, constituency) => api.get(`/regions/${county}/${constituency}/wards`),
};

// Document APIs
export const documentAPI = {
  uploadDocument: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAllDocuments: (params) => api.get('/documents', { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  verifyDocument: (id, data) => api.put(`/documents/${id}/verify`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// County Admin APIs
export const countyAdminAPI = {
  getDashboard: () => api.get('/county-admin/dashboard'),
  getParcels: (params) => api.get('/county-admin/parcels', { params }),
  createParcel: (data) => api.post('/county-admin/parcels', data),
  updateParcel: (id, data) => api.put(`/county-admin/parcels/${id}`, data),
  deleteParcel: (id) => api.delete(`/county-admin/parcels/${id}`),
  getTitleDeeds: () => api.get('/county-admin/title-deeds'),
  getTransfers: (params) => api.get('/county-admin/transfers', { params }),
  stopTransfer: (id, data) => api.put(`/county-admin/transfers/${id}/stop`, data),
  getTransferHistory: (id) => api.get(`/county-admin/parcels/${id}/transfer-history`),
  getFraudulentParcels: () => api.get('/county-admin/fraud-review'),
  removeFraudFlag: (id, data) => api.put(`/county-admin/parcels/${id}/remove-fraud-flag`, data),
  getCountyUsers: () => api.get('/county-admin/users'),
};

export default api;
