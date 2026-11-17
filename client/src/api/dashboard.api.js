import api from './axios.js';

export const dashboardAPI = {
  stats:      () => api.get('/dashboard/stats'),
  charts:     () => api.get('/dashboard/charts'),
  activity:   () => api.get('/dashboard/activity'),
  funnel:     () => api.get('/dashboard/funnel'),
};
