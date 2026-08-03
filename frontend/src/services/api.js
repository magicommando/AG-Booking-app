import axios from 'axios';

const getApiOrigin = () => {
  const configured = process.env.REACT_APP_API_URL;
  if (configured) {
    return configured.replace(/\/api$/, '');
  }

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (currentOrigin && currentOrigin !== 'http://localhost:3000') {
      return currentOrigin;
    }
  }

  return 'http://localhost:5000';
};

export const getBaseUrl = () => `${getApiOrigin()}/api`;

export const getApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', getApiOrigin());
  }

  return config;
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;

