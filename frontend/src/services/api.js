import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getHealth = () => api.get('/api/health');
export const getProjects = () => api.get('/api/projects');
export const getHistory = () => api.get('/api/history');
export const createDemoProject = () => api.post('/api/projects/demo');
export const importGitHubProject = (repoUrl) => api.post('/api/projects/github', { repo_url: repoUrl });
export const uploadProject = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const analyzeProject = (projectId) => api.post(`/api/analyze/${projectId}`);
export const getGraph = (projectId) => api.get(`/api/graph/${projectId}`);
export const getModules = (projectId) => api.get(`/api/modules/${projectId}`);
export const predictPropagation = (projectId, sourceBug) => api.post('/api/predict', { project_id: projectId, source_bug: sourceBug });
export const getRisk = (projectId) => api.get(`/api/risk/${projectId}`);
export const getReport = (projectId) => api.get(`/api/reports/${projectId}`);

export default api;
