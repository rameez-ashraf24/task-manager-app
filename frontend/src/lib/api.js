import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
const apiUrl = rawApiUrl.trim().replace(/\/+$/, '');

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
