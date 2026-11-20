import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import './Login.css';

import logoFogo from "../../assets/images/LOGO.png";
import logoNome from "../../assets/images/NOME.png";
import logoGoogle from "../../assets/images/google.png";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(email, password);

      // REDIRECIONAMENTO INTELIGENTE (TASK #30): admin vai para a dashboard.
      if (email === 'admin@openest.com') {
        navigate('/admin');
      } else {
        navigate('/discovery');
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      // Erro na própria tela (antes era um alert() do navegador).
      setErro('E-mail ou senha incorretos. Confira e tente de novo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <button className="close-btn" onClick={() => navigate('/welcome')} aria-label="Voltar">
          <X size={18} aria-hidden="true" />
        </button>

        <div className="login-header">
          <img src={logoFogo} alt="" className="login-logo-fogo" />
          <img src={logoNome} alt="Openest" className="login-logo-nome" />
        </div>
        <h1 className="login-title">Entrar</h1>
        <p className="login-subtitle">Que bom te ver de novo.</p>

        <form onSubmit={handleLogin} noValidate={false}>
          {erro ? <p className="login-error" role="alert">{erro}</p> : null}

          <div className="input-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <label htmlFor="login-senha">Senha</label>
            <div className="password-wrap">
              <input
                id="login-senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Sua senha"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button type="button" className="forgot-pass" onClick={() => navigate('/recovery')}>
            Esqueceu a senha?
          </button>

          <button type="submit" className="btn-entrar-submit" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Ainda não implementado: fica visível, mas honestamente desativado. */}
          <button type="button" className="btn-google-auth" disabled title="Em breve">
            <img src={logoGoogle} alt="" className="google-icon" />
            Entrar com Google <small>(em breve)</small>
          </button>
        </form>

        <p className="signup-call">
          Não tem uma conta? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}
