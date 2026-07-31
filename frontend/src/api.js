import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cookie Utility Helpers
export const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

export const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Interceptor to attach JWT token from Cookies or LocalStorage automatically
apiClient.interceptors.request.use((config) => {
  const token = getCookie('access_token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth APIs
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
    setCookie('access_token', response.data.access_token);
    if (response.data.user) {
      setCookie('user_role', response.data.user.role);
      setCookie('user_email', response.data.user.email);
    }
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
    setCookie('access_token', response.data.access_token);
    if (response.data.user) {
      setCookie('user_role', response.data.user.role);
      setCookie('user_email', response.data.user.email);
    }
  }
  return response.data;
};

export const loginWithGoogle = async (googleData) => {
  const response = await apiClient.post('/auth/google', googleData);
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
    setCookie('access_token', response.data.access_token);
    if (response.data.user) {
      setCookie('user_role', response.data.user.role);
      setCookie('user_email', response.data.user.email);
    }
  }
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  deleteCookie('access_token');
  deleteCookie('user_role');
  deleteCookie('user_email');
};

// Prediction APIs
export const predictYield = async (predictionData) => {
  const response = await apiClient.post('/prediction/predict', predictionData);
  return response.data;
};

export const getPredictionHistory = async (userId = 'guest') => {
  const response = await apiClient.get(`/prediction/history?user_id=${userId}`);
  return response.data;
};

// Weather APIs
export const analyzeWeather = async (weatherData) => {
  const response = await apiClient.post('/weather/analyze', weatherData);
  return response.data;
};

// Soil APIs
export const assessSoil = async (soilData) => {
  const response = await apiClient.post('/soil/assess', soilData);
  return response.data;
};

// Recommendation APIs
export const getRecommendations = async (queryData) => {
  const response = await apiClient.post('/recommendation/query', queryData);
  return response.data;
};

// Farm Management APIs
export const listFarms = async () => {
  const response = await apiClient.get('/farm/list');
  return response.data;
};

export const createFarm = async (farmData) => {
  const response = await apiClient.post('/farm/create', farmData);
  return response.data;
};

export const deleteFarm = async (farmId) => {
  const response = await apiClient.delete(`/farm/${farmId}`);
  return response.data;
};

// Role Portal APIs
export const getFarmerDashboard = async () => {
  const response = await apiClient.get('/user/farmer-dashboard');
  return response.data;
};

export const getAgronomistReports = async () => {
  const response = await apiClient.get('/user/agronomist-reports');
  return response.data;
};

export const getAdminPanel = async () => {
  const response = await apiClient.get('/user/admin-panel');
  return response.data;
};

export default apiClient;
