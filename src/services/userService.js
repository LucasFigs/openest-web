import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/perfil');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/users/perfil', data);
    return response.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/api/users/upload-photo', formData);
    return response.data.url; // ← retorna só a URL
  },
};

export default userService;