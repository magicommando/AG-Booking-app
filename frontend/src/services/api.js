import axios from 'axios';

const getBaseUrl = () => {
  const configured = process.env.REACT_APP_API_URL;
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (currentOrigin && currentOrigin !== 'http://localhost:3000') {
      return `${currentOrigin}/api`;
    }
  }

  return 'http://localhost:5000/api';
};

const api = axios.create({
	baseURL: getBaseUrl(),
	headers: {
		'Content-Type': 'application/json'
	}
});

export function setAuthToken(token) {
	if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	else delete api.defaults.headers.common['Authorization'];
}

export default api;

