import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; 
import { connectSocket, disconnectSocket } from '../services/socket';

// Token do admin offline (não existe no backend): não abre socket com ele.
const OFFLINE_ADMIN_TOKEN = 'fake-jwt-token-admin';

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

  // Chat em tempo real: conecta o Socket.IO com o JWT sempre que há sessão
  // (o servidor valida o token no handshake) e desconecta no logout.
  // Sem isso, mensagens enviadas pelo app mobile só apareciam após recarregar.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token && token !== OFFLINE_ADMIN_TOKEN) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [user]);

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

    const response = await api.post('/users/login', { email, password });
   const { user: loggedUser, token } = response.data;
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);
    setUser(loggedUser);
  

    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', token);
    setUser(loggedUser);
  };

  // --- NOVA FUNÇÃO DE REGISTRO ---
const register = async (userData) => {
    // Adicionamos o /users/ para completar a URL corretamente!
    const response = await api.post('/users/register', userData);
    const { user: registeredUser, token } = response.data;

    localStorage.setItem('user', JSON.stringify(registeredUser));
    localStorage.setItem('token', token);
    setUser(registeredUser);
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    // AQUI ESTÁ O SEGREDO: O 'register' agora foi adicionado à lista de valores!
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};