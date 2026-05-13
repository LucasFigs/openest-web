import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; 

// Esta linha resolve o erro: "Fast refresh only works when a file only exports components"
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const recoveredUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (recoveredUser && token) {
        try {
          setUser(JSON.parse(recoveredUser));
        } catch {
          console.error("Erro ao recuperar sessão");
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    // REGRA ADMIN OFFLINE
    if (email === 'admin@openest.com' && password === '123456') {
      const adminUser = { id: 999, name: 'Eduardo Admin', email: 'admin@openest.com', role: 'admin' };
      const adminToken = 'fake-jwt-token-admin';
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', adminToken);
      setUser(adminUser);
      return; 
    }

    // Chamada real usando a instância api.js que já tem a baseURL configurada
    const response = await api.post('/api/users/login', { email, password });
    const { user: loggedUser, token } = response.data;

    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};