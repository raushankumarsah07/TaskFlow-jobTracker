import api from './axios.js';

export const tasksAPI = {
  list:       (params) => api.get('/tasks', { params }),
  get:        (id)     => api.get(`/tasks/${id}`),
  create:     (data)   => api.post('/tasks', data),
  update:     (id, d)  => api.put(`/tasks/${id}`, d),
  delete:     (id)     => api.delete(`/tasks/${id}`),
  status:     (id, d)  => api.patch(`/tasks/${id}/status`, d),
  subtask:    (id, d)  => api.patch(`/tasks/${id}/subtasks`, d),
  board:      ()       => api.get('/tasks/board'),
  calendar:   (params) => api.get('/tasks/calendar', { params }),
  stats:      ()       => api.get('/tasks/stats'),
  bulkDelete: (ids)    => api.delete('/tasks/bulk', { data: { ids } }),
};
