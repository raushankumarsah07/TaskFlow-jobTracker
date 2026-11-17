import api from './axios.js';

export const usersAPI = {
  profile:        ()      => api.get('/users/profile'),
  update:         (data)  => api.put('/users/profile', data),
  changePassword: (data)  => api.put('/users/change-password', data),
  uploadAvatar:   (form)  => api.post('/users/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
