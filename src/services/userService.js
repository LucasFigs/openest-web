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

  // Modo Discreto (T022): PATCH altera só a flag modo_discreto no banco.
  // Com ele ligado, nem você nem o outro participante veem os checks azuis
  // de "visualizada" nas conversas.
  setDiscreteMode: async (value) => {
    const response = await api.patch('/users/perfil', { modo_discreto: !!value });
    return response.data;
  },

  // Nova função adicionada
  deleteAccount: async () => {
    return await api.delete('/users/conta');
  },
};

export default userService;