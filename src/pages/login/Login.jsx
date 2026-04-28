import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom'; // Importante
import './Login.css';

import logoFogo from "../../assets/images/LOGO.png";
import logoNome from "../../assets/images/NOME.png";
import logoGoogle from "../../assets/images/google.png";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Inicializa o navegador

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // O App.jsx vai detectar o login e redirecionar, 
      // mas podemos forçar para garantir:
      navigate('/discovery');
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert("Falha no login. Verifique seu e-mail e senha.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Botão fechar volta para welcome via URL */}
        <button className="close-btn" onClick={() => navigate('/welcome')}>✕</button>
        
        <div className="login-header">
          <img src={logoFogo} alt="Logo" className="login-logo-fogo" />
          <br />
          <img src={logoNome} alt="Openest" className="login-logo-nome" />
        </div>

        <form onSubmit={handleLogin}>
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

          <p className="forgot-pass" onClick={() => navigate('/recovery')}>
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
          Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Cadastre-se grátis!</a>
        </p>
      </div>
    </div>
  );
}