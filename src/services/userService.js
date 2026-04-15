import api from './api';

const userService = {
  // Task T024: Buscar dados do perfil logado
  getProfile: async () => {
    const response = await api.get('/perfil');
    return response.data;
  },

  // Task T025: Atualizar dados do perfil
  updateProfile: async (data) => {
    const response = await api.put('/perfil', data);
    return response.data;
  },

  // Task T012: Upload de foto para o perfil
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload-photo', formData);
    return response.data;
  },
};

export default userService;