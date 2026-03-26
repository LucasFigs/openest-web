import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000' // A porta que seu backend Openest está rodando
});

// Lembra da Task? Aqui vamos configurar o Token automaticamente depois
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;