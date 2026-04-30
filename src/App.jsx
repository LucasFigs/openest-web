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
import Chat from './pages/Chat/Chat'; // O App importa o Chat daqui

import './App.css';

function App() {
  const { authenticated, loading } = useContext(AuthContext);

  if (loading) return <div className="loading">Carregando Openest...</div>;

  return (
    <Router>
      <div className="App">
        <Routes>
          {!authenticated ? (
            <>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="*" element={<Navigate to="/welcome" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/discovery" />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/chat/:conversationId?" element={<Chat />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/discovery" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;