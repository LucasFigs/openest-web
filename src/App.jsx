import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Componentes Universais
import Loading from './components/Loading/Loading';

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

  // Se estiver carregando, exibe o Foguinho Roxo animado
  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ROTAS PÚBLICAS */}
          {!authenticated ? (
            <>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="*" element={<Navigate to="/welcome" />} />
            </>
          ) : (
            /* ROTAS PRIVADAS */
            <>
              <Route 
                path="/" 
                element={<Navigate to={user?.role === 'admin' ? "/admin" : "/discovery"} />} 
              />
              
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/chat/:conversationId?" element={<Chat />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />

              <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <Admin /> : <Navigate to="/discovery" />} 
              />

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