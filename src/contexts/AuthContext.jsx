import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 

// 1. Iniciamos com null para o VS Code entender que o valor virá depois
export const AuthContext = createContext(null); // erro que funciona

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      try {
        setUser(JSON.parse(recoveredUser)); // Corrigido de 'set' para 'setUser'
        axios.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Erro ao converter usuário", error);
      }
    }

    setLoading(false); // erro que funciona
  }, []);

  const login = async (email, password) => {
    // Aponta para a porta 3000 do seu backend Openest
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
    // ADICIONE O REGISTER NO VALUE TAMBÉM
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


