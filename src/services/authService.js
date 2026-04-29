import api from './api';

const authService = {
  login: async (email, password) => {
    // Esta chamada bate no seu backend (ex: POST /api/login)
    const response = await api.post('/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
};

export default authService;