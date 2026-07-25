import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const predictYield = async (predictionData) => {
  const response = await apiClient.post('/prediction/predict', predictionData);
  return response.data;
};

export const analyzeWeather = async (weatherData) => {
  const response = await apiClient.post('/weather/analyze', weatherData);
  return response.data;
};

export const assessSoil = async (soilData) => {
  const response = await apiClient.post('/soil/assess', soilData);
  return response.data;
};

export const getRecommendations = async (queryData) => {
  const response = await apiClient.post('/recommendation/query', queryData);
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
