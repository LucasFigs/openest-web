import api from './api';

const authService = {
  login: async (email, password) => {
    // Esta chamada bate no seu backend
    const response = await api.post('/users/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // --- NOVA FUNÇÃO DE REGISTRO ADICIONADA ---
  register: async (userData) => {
    // Aponta para a rota correta do seu backend (ajuste se a sua baseURL já tiver o /users)
    const response = await api.post('/users/register', userData);
    
    // Se o seu backend já devolver o token logo no cadastro (auto-login), nós já o guardamos:
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
};

export default authService;