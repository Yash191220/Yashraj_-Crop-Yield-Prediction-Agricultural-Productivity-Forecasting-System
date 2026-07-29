import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
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
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
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
