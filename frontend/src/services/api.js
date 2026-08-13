import axios from 'axios';

const getApiOrigin = () => {
  const configured = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL;
  if (configured) {
    return configured.replace(/\/api$/, '').replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const isLocalOrigin = /^(http:\/\/localhost|http:\/\/127\.0\.0\.1|http:\/\/0\.0\.0\.0)/i.test(currentOrigin);
    if (currentOrigin && !isLocalOrigin) {
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

export const resolveAssetUrl = (url) => {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${getApiOrigin()}${normalizedPath}`;
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

