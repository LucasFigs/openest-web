import React, { useState } from 'react';
import Welcome from "./pages/welcome/Welcome";
import Login from "./pages/login/Login";
import Register from "./pages/Register/index"; 
import Recovery from "./pages/recovery/Recovery"; 
import './App.css';

function App() {
  // Começamos na tela de boas-vindas
  const [page, setPage] = useState('welcome');

  return (
    <div className="App">
      {page === 'welcome' && <Welcome setPage={setPage} />}
      {page === 'login' && <Login setPage={setPage} />}
      {page === 'register' && <Register setPage={setPage} />}
      {page === 'forgot' && <Recovery setPage={setPage} />}
    </div>
  );
}

export default App;