import api from './api';

// A baseURL do `api` já termina em /api: as rotas aqui começam em /users.
// (Antes eram '/api/users/...', o que virava /api/api/... e dava 404.)
const recoveryService = {
  sendCode: async (email) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  // O e-mail sai do próprio token no servidor; só o token e a senha nova vão.
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/users/reset-password', { token, newPassword });
    return response.data;
  },
};

export default recoveryService;
