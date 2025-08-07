import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (role, code) => api.post('/auth/login', { role, code }),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
};

// Public Petition API functions (no auth required)
export const publicPetitionAPI = {
  submit: (petitionData) => api.post('/petitions', petitionData),
  track: (petitionId) => api.get(`/petitions/track/${petitionId}`),
};

// Protected Petition API functions (requires auth)
export const petitionAPI = {
  getAll: (params = {}) => api.get('/petitions', { params }),
  getById: (id) => api.get(`/petitions/${id}`),
  updateStatus: (id, statusData) => api.put(`/petitions/${id}/status`, statusData),
  addResponse: (id, responseData) => api.post(`/petitions/${id}/response`, responseData),
  getStats: () => api.get('/petitions/stats/overview'),
};

// Admin API functions (admin only)
export const adminAPI = {
  deletePetition: (id) => api.delete(`/admin/petitions/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  exportData: (params = {}) => api.get('/admin/reports/export', { params }),
  systemCleanup: (daysOld = 365) => api.post('/admin/system/cleanup', { days_old: daysOld }),
  getSystemHealth: () => api.get('/admin/system/health'),
};

// Utility functions
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

export const downloadCSV = async (params = {}) => {
  try {
    const response = await api.get('/admin/reports/export', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `petitions-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(handleAPIError(error));
  }
};

// Department list for dropdowns
export const DEPARTMENTS = [
  'Revenue Department',
  'Police Department', 
  'Health Department',
  'Education Department',
  'Public Works Department (PWD)',
  'Agriculture Department',
  'Forest Department',
  'Transport Department',
  'Municipal Administration',
  'Rural Development',
  'Social Welfare',
  'Labour Department',
  'Industries Department',
  'Tourism Department',
  'Fire & Rescue Services',
  'Electricity Board (TNEB)',
  'Water Supply',
  'Waste Management',
  'Other'
];

// Status display configurations
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    icon: '🟡',
    description: 'Just submitted, awaiting assignment'
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    icon: '🔵',
    description: 'Assigned and being worked on'
  },
  resolved: {
    label: 'Resolved',
    color: 'green',
    icon: '🟢',
    description: 'Completed with response'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    icon: '🔴',
    description: 'Cannot be processed'
  }
};

// Priority display configurations
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'gray',
    icon: '⬇️'
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    icon: '➡️'
  },
  high: {
    label: 'High',
    color: 'orange',
    icon: '⬆️'
  },
  urgent: {
    label: 'Urgent',
    color: 'red',
    icon: '🚨'
  }
};

export default api;