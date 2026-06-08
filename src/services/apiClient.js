import axios from 'axios';

const runtimeApiBaseUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
    : 'http://localhost:5000/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || runtimeApiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAuthToken() {
  return localStorage.getItem('finora_token');
}

export function setAuthToken(token) {
  localStorage.setItem('finora_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('finora_token');
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.details?.[0]?.message ||
      (error.code === 'ERR_NETWORK'
        ? `Cannot connect to Finora API at ${API_BASE_URL}. Please make sure the backend is running.`
        : '') ||
      error.message ||
      'Finora API request failed';

    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  login: (payload) => apiClient.post('/auth/login', payload).then((res) => res.data),
  register: (payload) => apiClient.post('/auth/register', payload).then((res) => res.data),
  me: () => apiClient.get('/auth/me').then((res) => res.data),
};

export const dashboardApi = {
  summary: () => apiClient.get('/dashboard/summary').then((res) => res.data),
};

export const customersApi = {
  list: (search = '', status = '') =>
    apiClient
      .get(
        `/customers?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}${
          status ? `&status=${encodeURIComponent(status)}` : ''
        }`,
      )
      .then((res) => res.data),
  create: (payload) => apiClient.post('/customers', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/customers/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/customers/${id}`).then((res) => res.data),
  addNote: (id, payload) => apiClient.post(`/customers/${id}/notes`, payload).then((res) => res.data),
  timeline: (id) => apiClient.get(`/customers/${id}/timeline`).then((res) => res.data),
};

export const loansApi = {
  list: () => apiClient.get('/loans').then((res) => res.data),
  create: (payload) => apiClient.post('/loans', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/loans/${id}`, payload).then((res) => res.data),
  cancel: (id, payload) => apiClient.patch(`/loans/${id}/cancel`, payload).then((res) => res.data),
  simpleInterest: (id, payload = {}) =>
    apiClient.post(`/loans/${id}/calculate/simple-interest`, payload).then((res) => res.data),
  compoundInterest: (id, payload = {}) =>
    apiClient.post(`/loans/${id}/calculate/compound-interest`, payload).then((res) => res.data),
  close: (id, payload = {}) => apiClient.patch(`/loans/${id}/close`, payload).then((res) => res.data),
  markPaid: (id, payload = {}) => apiClient.patch(`/loans/${id}/mark-paid`, payload).then((res) => res.data),
};

export const emisApi = {
  list: () => apiClient.get('/emis').then((res) => res.data),
  create: (payload) => apiClient.post('/emis', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/emis/${id}`, payload).then((res) => res.data),
  markPaid: (id, payload = {}) => apiClient.patch(`/emis/${id}/mark-paid`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/emis/${id}`).then((res) => res.data),
};

export const paymentsApi = {
  list: () => apiClient.get('/payments').then((res) => res.data),
  create: (payload) => apiClient.post('/payments', payload).then((res) => res.data),
  refund: (id) => apiClient.post(`/payments/${id}/refund`).then((res) => res.data),
};
