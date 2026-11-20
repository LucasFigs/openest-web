import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, MailCheck, X } from 'lucide-react';
import './Recovery.css';
import recoveryService from '../../services/recoveryService';
import logoFogo from '../../assets/images/LOGO.png';
import logoNome from '../../assets/images/NOME.png';

// Recuperação de senha em duas telas:
//  1) sem token na URL: pede o e-mail e envia o link;
//  2) com ?token=... (vindo do link): define a senha nova.
export default function Recovery() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  // O token do link vem na URL; lido já na criação do estado.
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const irParaLogin = () => navigate('/login');

  const handleSendLink = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await recoveryService.sendCode(email.trim());
      setIsSent(true);
    } catch (error) {
      console.error('Recuperação:', error.response?.status, error.response?.data);
      setErro('Não foi possível enviar o link agora. Tente de novo em instantes.');
    } finally {
      setEnviando(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErro('');
    if (newPassword.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }
    setEnviando(true);
    try {
      await recoveryService.resetPassword(token, newPassword);
      setIsReset(true);
    } catch (error) {
      console.error('Redefinir senha:', error.response?.status, error.response?.data);
      setErro(error.response?.data?.error || 'Não foi possível redefinir a senha. O link pode ter expirado.');
    } finally {
      setEnviando(false);
    }
  };

  const erroBox = erro ? <p className="recovery-error" role="alert">{erro}</p> : null;

  return (
    <div className="recovery-page-container">
      <div className="recovery-card">
        <button type="button" className="recovery-close-btn" onClick={irParaLogin} aria-label="Voltar ao login">
          <X size={18} aria-hidden="true" />
        </button>

        <div className="recovery-header">
          <img src={logoFogo} alt="" className="recovery-logo-fogo" />
          <img src={logoNome} alt="Openest" className="recovery-logo-nome" />
        </div>

        {!token ? (
          !isSent ? (
            <form onSubmit={handleSendLink}>
              <h1 className="recovery-title">Recuperar senha</h1>
              <p className="recovery-desc">Informe o e-mail da sua conta. Vamos enviar um link para criar uma senha nova.</p>
              {erroBox}
              <div className="recovery-field">
                <label htmlFor="rec-email">E-mail</label>
                <input
                  id="rec-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-recovery" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar link'}
              </button>
              <button type="button" className="recovery-link-btn" onClick={irParaLogin}>
                Lembrei a senha
              </button>
            </form>
          ) : (
            <div className="success-state">
              <span className="recovery-success-icon"><MailCheck size={28} aria-hidden="true" /></span>
              <h1 className="recovery-title">Confira seu e-mail</h1>
              <p className="recovery-desc">
                Se <strong>{email.trim()}</strong> tiver uma conta no Openest, o link de recuperação chega em instantes.
              </p>
              <button type="button" className="recovery-btn-secondary" onClick={irParaLogin}>Voltar ao login</button>
            </div>
          )
        ) : !isReset ? (
          <form onSubmit={handleResetPassword}>
            <h1 className="recovery-title">Nova senha</h1>
            <p className="recovery-desc">Crie uma senha com pelo menos 6 caracteres.</p>
            {erroBox}
            <div className="recovery-field">
              <label htmlFor="rec-senha">Nova senha</label>
              <div className="recovery-password">
                <input
                  id="rec-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="recovery-password-toggle"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <div className="recovery-field">
              <label htmlFor="rec-confirmar">Confirmar senha</label>
              <input
                id="rec-confirmar"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-recovery" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        ) : (
          <div className="success-state">
            <span className="recovery-success-icon is-success"><CheckCircle2 size={28} aria-hidden="true" /></span>
            <h1 className="recovery-title">Senha alterada</h1>
            <p className="recovery-desc">Pronto. Use a senha nova para entrar.</p>
            <button type="button" className="btn-recovery" onClick={irParaLogin}>Fazer login</button>
          </div>
        )}
      </div>
    </div>
  );
}
