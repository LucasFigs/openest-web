import React, { useState, useContext } from 'react';
import { AuthContext } from './contexts/AuthContext'; // teste
import Welcome from "./pages/welcome/Welcome";
import Login from "./pages/login/Login";
import Register from "./pages/Register/index"; 
import Recovery from "./pages/recovery/Recovery"; 
import './App.css';

function App() {
  // Pega os estados globais do Contexto
  const { authenticated, loading } = useContext(AuthContext);
  
  // Estado local para navegação simples
  const [page, setPage] = useState('welcome');

  // 1. Enquanto o Contexto verifica o localStorage, exibe um loading
  if (loading) {
    return <div className="loading">Carregando Openest...</div>;
  }

  return (
    <div className="App">
      
      {/* 2. Se NÃO estiver logado, mostra as páginas públicas */}
      {!authenticated && (
        <>
          {page === 'welcome' && <Welcome setPage={setPage} />}
          {page === 'login' && <Login setPage={setPage} />}
          {page === 'register' && <Register setPage={setPage} />}
          {page === 'forgot' && <Recovery setPage={setPage} />}
        </>
      )}

      {/* 3. Se ESTIVER logado, mostra a área privada */}
      {authenticated && (
        <div className="dashboard-container">
          <h1>🚀 Bem-vindo à Openest API, logado!</h1>
          <p>Você transpôs a barreira do JWT.</p>
          <button onClick={() => setPage('dashboard')}>Ir para Painel</button>
          
          {/* Dica: Você pode criar um botão de Logout aqui depois chamando a função logout() do contexto */}
        </div>
      )}

    </div>
  );
}

export default App;