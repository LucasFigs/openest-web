import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Só recupera o usuário se ele já tiver feito login anteriormente
  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      try {
        setUser(JSON.parse(recoveredUser));
        axios.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Erro ao recuperar usuário", error);
        localStorage.clear();
      }
    }
    setLoading(false); 
  }, []);

  // 2. Função de login com a regra do Admin
  const login = async (email, password) => {
    // REGRA ADMIN OFFLINE
    if (email === 'admin@openest.com' && password === '123456') {
      const adminUser = { id: 999, name: 'Eduardo Admin', email: 'admin@openest.com' };
      const adminToken = 'fake-jwt-token-admin';

      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', adminToken);
      
      axios.defaults.headers.Authorization = `Bearer ${adminToken}`;
      setUser(adminUser);
      return; 
    }

    // Fluxo normal com API
    const response = await axios.post('http://localhost:3000/api/users/login', { email, password });
    const { user: loggedUser, token } = response.data;

    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);
    axios.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    axios.defaults.headers.Authorization = null;
    setUser(null);
  };

  const register = async (userData) => {
    const response = await axios.post('http://localhost:3000/api/users/register', userData);
    const { user: loggedUser, token } = response.data;
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);
    axios.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(loggedUser);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};