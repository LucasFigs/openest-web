import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/users/perfil');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/perfil', data);
    return response.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  // Nova função adicionada
  deleteAccount: async () => {
    return await api.delete('/users/conta');
  },
};

export default userService;