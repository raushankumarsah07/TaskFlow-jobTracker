import api from './axios.js';

export const applicationsAPI = {
  list:    (params) => api.get('/applications', { params }),
  get:     (id)     => api.get(`/applications/${id}`),
  create:  (data)   => api.post('/applications', data),
  update:  (id, data) => api.put(`/applications/${id}`, data),
  delete:  (id)     => api.delete(`/applications/${id}`),
  status:  (id, data) => api.patch(`/applications/${id}/status`, data),
  reorder: (data)   => api.patch('/applications/reorder', data),
  history: (id)     => api.get(`/applications/${id}/history`),
  stats:   ()       => api.get('/applications/stats'),
  exportCSV:()      => api.get('/applications/export', { responseType: 'blob' }),
  bulkDelete:(ids)  => api.delete('/applications/bulk', { data: { ids } }),
  kanban:  ()       => api.get('/applications/kanban'),
};
