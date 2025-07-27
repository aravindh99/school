import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for admin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.authorization = token;
  }
  return config;
});

// Schools API
export const schoolsAPI = {
  getAll: () => api.get('/schools'),
  create: (data) => api.post('/schools', data),
  getRumors: (schoolId, classFilter) => {
    const params = classFilter ? { class: classFilter } : {};
    return api.get(`/schools/${schoolId}/rumors`, { params });
  },
  createRumor: (schoolId, data) => api.post(`/schools/${schoolId}/rumors`, data),
  getClasses: (schoolId) => api.get(`/schools/${schoolId}/classes`),
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getPendingSchools: () => api.get('/admin/schools/pending'),
  getAllSchools: () => api.get('/admin/schools'),
  approveSchool: (schoolId) => api.put(`/admin/schools/${schoolId}/approve`),
  rejectSchool: (schoolId) => api.delete(`/admin/schools/${schoolId}/reject`),
};

// Individual function exports for component compatibility
export const getSchools = () => schoolsAPI.getAll().then(res => res.data.data);
export const getSchool = (schoolId) => api.get(`/schools/${schoolId}`).then(res => res.data.data);
export const getRumors = (schoolId, classFilter) => schoolsAPI.getRumors(schoolId, classFilter).then(res => res.data.data);
export const createRumor = (schoolId, data) => schoolsAPI.createRumor(schoolId, data).then(res => res.data.data);
export const adminLogin = (credentials) => adminAPI.login(credentials).then(res => res.data);
export const getAdminStats = () => api.get('/admin/stats').then(res => res.data.data);
export const deleteRumor = (rumorId) => api.delete(`/admin/rumors/${rumorId}`).then(res => res.data.data);
export const editRumor = (rumorId, content) => api.put(`/admin/rumors/${rumorId}`, { content }).then(res => res.data.data);
export const editSchool = (schoolId, data) => api.put(`/admin/schools/${schoolId}`, data).then(res => res.data.data);
export const deleteSchool = (schoolId) => api.delete(`/admin/schools/${schoolId}`).then(res => res.data.data);
export const getPendingSchools = () => api.get('/admin/schools/pending').then(res => res.data.data);
export const approveSchool = (schoolId) => api.put(`/admin/schools/${schoolId}/approve`).then(res => res.data.data);
export const rejectSchool = (schoolId) => api.delete(`/admin/schools/${schoolId}/reject`).then(res => res.data.data);
export const adminCreateSchool = (data) => api.post('/admin/schools', data).then(res => res.data.data);
export const getSchoolThreads = (schoolId) => api.get(`/admin/schools/${schoolId}/threads`).then(res => res.data.data);
export const getAllSchools = () => api.get('/admin/schools').then(res => res.data.data);
export const createSuggestion = (content) => api.post('/schools/suggestions', { content }).then(res => res.data.data);
export const getSuggestions = () => api.get('/admin/suggestions').then(res => res.data.data);
export const deleteSuggestion = (suggestionId) => api.delete(`/admin/suggestions/${suggestionId}`).then(res => res.data.data);
export const getAnnouncement = () => api.get('/schools/announcement').then(res => res.data.data);
export const getAdminAnnouncement = () => api.get('/admin/announcement').then(res => res.data.data);
export const updateAnnouncement = (content) => api.put('/admin/announcement', { content }).then(res => res.data.data);

export default api;