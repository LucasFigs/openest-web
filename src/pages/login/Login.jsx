import React, { useState, useContext } from 'react'; // Adicionado useContext
import { AuthContext } from '../../contexts/AuthContext'; 
import './Login.css';

// CAMINHOS EXATOS BASEADOS NO SEU PRINT
import logoFogo from "../../assets/images/LOGO.png";
import logoNome from "../../assets/images/NOME.png";
import logoGoogle from "../../assets/images/google.png";

export default function Login({ setPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Pegamos a função de login do contexto global
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Chama a função login do Contexto enviando os dados para a API
      await login(email, password);
      
      // Se o login for bem-sucedido, o App.jsx mudará a tela automaticamente
      // Não precisamos mais do setPage('home') manual aqui.
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert("Falha no login. Verifique seu e-mail e senha.");
    }
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
          Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }}>Cadastre-se grátis!</a>
        </p>
      </div>
    </div>
  );
}