import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    console.log('🌐 API: Making login request...', {
      url: '/auth/login',
      credentials: { email: credentials.email, password: '***' }
    });
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('🌐 API: Login response received:', response);
      return response;
    } catch (error) {
      console.error('🌐 API: Login request failed:', error);
      throw error;
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/overview'),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params = {}) => api.get('/vehicles', { params }),
  getAvailable: () => api.get('/vehicles/available'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
  assignDriver: (id, driverId) => api.put(`/vehicles/${id}/assign-driver`, { driverId }),
  unassignDriver: (id) => api.put(`/vehicles/${id}/unassign-driver`),
  updateStatus: (id, status, availability) => api.put(`/vehicles/${id}/status`, { status, availability }),
  getStats: () => api.get('/vehicles/stats/overview'),
};

// Drivers API
export const driversAPI = {
  getAll: (params = {}) => api.get('/drivers', { params }),
  getAvailable: () => api.get('/drivers/available'),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (driverData) => api.post('/drivers', driverData),
  update: (id, driverData) => api.put(`/drivers/${id}`, driverData),
  delete: (id) => api.delete(`/drivers/${id}`),
  updateStatus: (id, status, availability) => api.put(`/drivers/${id}/status`, { status, availability }),
  getPerformance: (id) => api.get(`/drivers/${id}/performance`),
  getStats: () => api.get('/drivers/stats/overview'),
};

// Trips API
export const tripsAPI = {
  getAll: (params = {}) => api.get('/trips', { params }),
  getActive: () => api.get('/trips/active'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (tripData) => api.post('/trips', tripData),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  start: (id, startData) => api.put(`/trips/${id}/start`, startData),
  complete: (id, completionData) => api.put(`/trips/${id}/complete`, completionData),
  cancel: (id, reason) => api.put(`/trips/${id}/cancel`, { reason }),
  getStats: () => api.get('/trips/stats/overview'),
};

// Fuel API
export const fuelAPI = {
  getAll: (params = {}) => api.get('/fuel', { params }),
  getById: (id) => api.get(`/fuel/${id}`),
  create: (fuelData) => api.post('/fuel', fuelData),
  update: (id, fuelData) => api.put(`/fuel/${id}`, fuelData),
  verify: (id) => api.put(`/fuel/${id}/verify`),
  approve: (id, reimbursementAmount) => api.put(`/fuel/${id}/approve`, { reimbursementAmount }),
  getEfficiency: (vehicleId, startDate, endDate) => 
    api.get(`/fuel/vehicle/${vehicleId}/efficiency`, { params: { startDate, endDate } }),
  getStats: () => api.get('/fuel/stats/overview'),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: (params = {}) => api.get('/maintenance', { params }),
  getOverdue: () => api.get('/maintenance/overdue'),
  getUpcoming: (days = 30) => api.get('/maintenance/upcoming', { params: { days } }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (maintenanceData) => api.post('/maintenance', maintenanceData),
  update: (id, maintenanceData) => api.put(`/maintenance/${id}`, maintenanceData),
  start: (id, startData) => api.put(`/maintenance/${id}/start`, startData),
  complete: (id, completionData) => api.put(`/maintenance/${id}/complete`, completionData),
  approve: (id, comments) => api.put(`/maintenance/${id}/approve`, { comments }),
  getHistory: (vehicleId, status) => 
    api.get(`/maintenance/vehicle/${vehicleId}/history`, { params: { status } }),
  getStats: () => api.get('/maintenance/stats/overview'),
};

// Alerts API
export const alertsAPI = {
  getAll: (params = {}) => api.get('/alerts', { params }),
  getActive: () => api.get('/alerts/active'),
  getUnacknowledged: () => api.get('/alerts/unacknowledged'),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (alertData) => api.post('/alerts', alertData),
  acknowledge: (id, note) => api.put(`/alerts/${id}/acknowledge`, { note }),
  resolve: (id, note, action) => api.put(`/alerts/${id}/resolve`, { note, action }),
  dismiss: (id) => api.put(`/alerts/${id}/dismiss`),
  getByVehicle: (vehicleId, status) => 
    api.get(`/alerts/vehicle/${vehicleId}`, { params: { status } }),
  getByDriver: (driverId, status) => 
    api.get(`/alerts/driver/${driverId}`, { params: { status } }),
  getStats: () => api.get('/alerts/stats/overview'),
};

// Dashboard API - uses dedicated dashboard endpoints
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getActivity: () => api.get('/dashboard/activity')
};

export default api;
