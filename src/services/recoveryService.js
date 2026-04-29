import api from './api';

const recoveryService = {
  sendCode: async (email) => {
    const response = await api.post('/api/users/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, token, newPassword) => {
    const response = await api.post('/api/users/reset-password', { email, token, newPassword });
    return response.data;
  }
};

export default recoveryService;