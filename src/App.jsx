import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Páginas
import Welcome from "./pages/welcome/Welcome";
import Login from "./pages/login/Login";
import Register from "./pages/Register/index"; 
import Recovery from "./pages/recovery/Recovery"; 
import Discovery from './pages/Discovery/Discovery';
import EditProfile from './pages/EditProfile/EditProfile';
import Settings from './pages/Settings/Settings';
import Chat from './pages/Chat/Chat';
import Admin from './pages/Admin/Admin'; 

import './App.css';

function App() {
  const { authenticated, user, loading } = useContext(AuthContext);

  // Se estiver carregando os dados do localStorage, exibe um fallback
  if (loading) {
    return <div style={{ background: '#6a1b9a', height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>Carregando Openest...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* SE NÃO ESTIVER AUTENTICADO (Ou após limpar o console) */}
          {!authenticated ? (
            <>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recovery" element={<Recovery />} />
              {/* Se tentar acessar qualquer coisa sem estar logado, volta pro Welcome */}
              <Route path="*" element={<Navigate to="/welcome" />} />
            </>
          ) : (
            /* SE ESTIVER LOGADO */
            <>
              {/* Redirecionamento Inicial Baseado na Role */}
              <Route 
                path="/" 
                element={<Navigate to={user?.role === 'admin' ? "/admin" : "/discovery"} />} 
              />
              
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/chat/:conversationId?" element={<Chat />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Rota Protegida Admin */}
              <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <Admin /> : <Navigate to="/discovery" />} 
              />

              {/* Evita que o Admin caia na Discovery se digitar URL errada */}
              <Route 
                path="*" 
                element={<Navigate to={user?.role === 'admin' ? "/admin" : "/discovery"} />} 
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;