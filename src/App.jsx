import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Páginas de Autenticação
import Welcome from "./pages/welcome/Welcome";
import Login from "./pages/login/Login";
import Register from "./pages/Register/index"; 
import Recovery from "./pages/recovery/Recovery"; 

// Páginas Privadas
import Discovery from './pages/Discovery/Discovery';
import EditProfile from './pages/EditProfile/EditProfile';
import Settings from './pages/Settings/Settings';

import './App.css';

function App() {
  const { authenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Carregando Openest...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* SE NÃO ESTIVER LOGADO */}
          {!authenticated ? (
            <>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recovery" element={<Recovery />} />
              {/* Qualquer tentativa de acesso cai no Welcome */}
              <Route path="*" element={<Navigate to="/welcome" />} />
            </>
          ) : (
            /* SE ESTIVER LOGADO */
            <>
              <Route path="/" element={<Navigate to="/discovery" />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              {/* Qualquer erro de rota logado cai na Discovery */}
              <Route path="*" element={<Navigate to="/discovery" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;