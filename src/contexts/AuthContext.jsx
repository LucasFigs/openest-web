import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 

// Verifique se o nome está exatamente assim
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
          const parsedUser = JSON.parse(recoveredUser);
          setUser(parsedUser);
          axios.defaults.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error("Erro ao recuperar usuário", error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    // REGRA ADMIN OFFLINE - Eduardo Admin
    if (email === 'admin@openest.com' && password === '123456') {
      const adminUser = { 
        id: 999, 
        name: 'Eduardo Admin', 
        email: 'admin@openest.com',
        role: 'admin' 
      };
      const adminToken = 'fake-jwt-token-admin';

      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', adminToken);
      axios.defaults.headers.Authorization = `Bearer ${adminToken}`;
      setUser(adminUser);
      return; 
    }

    const response = await axios.post('http://localhost:3000/api/users/login', { email, password });
    const { user: loggedUser, token } = response.data;
    const userWithRole = { ...loggedUser, role: loggedUser.role || 'user' };

    localStorage.setItem('user', JSON.stringify(userWithRole));
    localStorage.setItem('token', token);
    axios.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(userWithRole);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    axios.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};