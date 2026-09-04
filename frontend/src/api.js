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

export const getCropRecommendations = async (predictionData) => {
  const response = await apiClient.post('/prediction/crop-recommend', predictionData);
  return response.data;
};

export const getPredictionHistory = async (userId = 'guest') => {
  const response = await apiClient.get(`/prediction/history?user_id=${userId}`);
  return response.data;
};

// Productivity & Seasonal Reporting APIs
export const getProductivitySeasonalReport = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.region && params.region !== 'All Regions') query.append('region', params.region);
  if (params.season && params.season !== 'All Seasons') query.append('season', params.season);
  if (params.area_hectares) query.append('area_hectares', params.area_hectares);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await apiClient.get(`/reports/productivity-seasonal${queryString}`);
  return response.data;
};

export const generateCustomReport = async (reportData) => {
  const response = await apiClient.post('/reports/generate-custom', reportData);
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

// Recommendation & Agronomic Workflow APIs
export const getRecommendations = async (queryData) => {
  const response = await apiClient.post('/recommendation/query', queryData);
  return response.data;
};

export const runCropSelectionWorkflow = async (data) => {
  const response = await apiClient.post('/recommendation/workflows/crop-selection', data);
  return response.data;
};

export const runNutrientPlanWorkflow = async (data) => {
  const response = await apiClient.post('/recommendation/workflows/nutrient-plan', data);
  return response.data;
};

export const runPestManagementWorkflow = async (data) => {
  const response = await apiClient.post('/recommendation/workflows/pest-management', data);
  return response.data;
};

export const runIrrigationScheduleWorkflow = async (data) => {
  const response = await apiClient.post('/recommendation/workflows/irrigation-schedule', data);
  return response.data;
};

export const runCropRotationWorkflow = async (data) => {
  const response = await apiClient.post('/recommendation/workflows/crop-rotation', data);
  return response.data;
};

export const getRecommendationCatalog = async () => {
  const response = await apiClient.get('/recommendation/catalog');
  return response.data;
};

// Risk Assessment & Disaster Mitigation APIs
export const evaluateFarmRisk = async (data) => {
  const response = await apiClient.post('/risk/evaluate', data);
  return response.data;
};

export const simulateClimateStressTest = async (data) => {
  const response = await apiClient.post('/risk/stress-test', data);
  return response.data;
};

export const getRegionalRiskMatrix = async () => {
  const response = await apiClient.get('/risk/regional-matrix');
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

export const updateFarm = async (farmId, farmData) => {
  const response = await apiClient.put(`/farm/${farmId}`, farmData);
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

// Admin Approval & Stats APIs
export const getAdminStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

export const getPendingUsers = async () => {
  const response = await apiClient.get('/admin/pending-users');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/admin/all-users');
  return response.data;
};

export const approveUser = async (userId) => {
  const response = await apiClient.put(`/admin/approve/${userId}`);
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await apiClient.put(`/admin/reject/${userId}`);
  return response.data;
};

export const getFarmerActivity = async (userId) => {
  const response = await apiClient.get(`/admin/user/${userId}/activity`);
  return response.data;
};
export const getUserActivity = getFarmerActivity;

export const deleteFarmer = async (userId) => {
  const response = await apiClient.delete(`/admin/user/${userId}`);
  return response.data;
};
export const deleteUser = deleteFarmer;


// Advisor Portal & Live Consultation APIs
export const getAdvisorStats = async () => {
  const response = await apiClient.get('/advisor/stats');
  return response.data;
};

export const listAdvisorInquiries = async (status = 'all') => {
  const response = await apiClient.get(`/advisor/inquiries?status=${status}`);
  return response.data;
};

export const getInquiryThread = async (inquiryId) => {
  const response = await apiClient.get(`/advisor/thread/${inquiryId}`);
  return response.data;
};

export const getFarmerActiveThread = async (email = '') => {
  if (!email) return null;
  const response = await apiClient.get(`/advisor/farmer-thread?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const submitFarmerInquiry = async (payload) => {
  const response = await apiClient.post('/advisor/inquiry', payload);
  return response.data;
};

export const replyToInquiry = async (payload) => {
  const response = await apiClient.post('/advisor/reply', payload);
  return response.data;
};

export const updateInquiryStatus = async (inquiryId, status) => {
  const response = await apiClient.post('/advisor/status', { inquiry_id: inquiryId, status });
  return response.data;
};

export default apiClient;
