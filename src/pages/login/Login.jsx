import React, { useState } from 'react';
import './Login.css';

// 1. CORREÇÃO: Verifique se o nome do arquivo na pasta é "google.png" (com dois 'g')
import logoFogo from "../../assets/images/LOGO.png";
import logoNome from "../../assets/images/NOME.png";
import logoGoogle from "../../assets/images/google.png"; // Ajustei de goole para google

export default function Login({ setPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setPage('home'); 
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <button className="close-btn" onClick={() => setPage('welcome')}>✕</button>
        
        <div className="login-header">
          <img src={logoFogo} alt="Logo" className="login-logo-fogo" />
          <br />
          <img src={logoNome} alt="Openest" className="login-logo-nome" />
        </div>

        <form onSubmit={handleLogin}>
          {/* Usei as classes corrigidas aqui para bater com o CSS novo */}
          <div className="input-field">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Digite seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-field">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <p className="forgot-pass" onClick={() => setPage('forgot')}>
            Esqueceu a senha?
          </p>

          <button type="submit" className="btn-entrar-submit">
            ENTRAR
          </button>

          <button type="button" className="btn-google-auth">
            <img src={logoGoogle} alt="Google" className="google-icon" />
            Entrar com Google
          </button>
        </form>

        <p className="signup-call">
          Não tem uma conta? <a href="#" onClick={() => setPage('register')}>Cadastre-se grátis!</a>
        </p>
      </div>
    </div>
  );
}