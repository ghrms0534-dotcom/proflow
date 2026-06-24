import axios from 'axios';
import { useAppStore } from './store';

const api = axios.create({
  baseURL: 'http://localhost:8100/api',
});

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
