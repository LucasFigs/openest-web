import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; 

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
import TermsOfUse from './pages/Legal/TermsOfUse';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';

import './App.css';

function App() {
  const { authenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        {/* Task #40: Notificações globais */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 5000,
            style: {
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
              padding: 0,
            }
          }}
        />

        <Routes>
          {/* 
            TASK #43: ROTAS PÚBLICAS UNIVERSAIS 
            Colocadas fora do bloco condicional para que os botões da Navbar 
            da Welcome funcionem sem exigir login.
          */}
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />

          {!authenticated ? (
            /* BLOCO: NÃO LOGADO */
            <>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="*" element={<Navigate to="/welcome" />} />
            </>
          ) : (
            /* BLOCO: AUTENTICADO */
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