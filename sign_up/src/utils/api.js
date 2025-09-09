import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token')) {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running or not accessible');
      alert('Backend server is not running. Please start the server.');
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      localStorage.removeItem('ispremimumuser');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  signup: (userData) => api.post('/signup', userData),
  login: (credentials) => api.post('/login', credentials),
  verify: (token) => api.get('/verify', { headers: { Authorization: `Bearer ${token}` } })
};

export const expenseAPI = {
  getExpenses: () => api.get('/expenses'),
  addExpense: (expenseData) => api.post('/expenses', expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`)
};

export const categoryAPI = {
  getCategories: () => api.get('/categories')
};

export const paymentAPI = {
  createOrder: (orderData) => api.post('/payment/create-order', orderData),
  getPaymentStatus: (orderId) => api.get(`/payment/status/${orderId}`),
  getPremiumStatus: () => api.get('/payment/premium-status'),
  refreshToken: () => api.post('/payment/refresh-token')
};

export default api;
