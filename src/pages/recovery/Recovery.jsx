import React, { useState, useEffect } from 'react';
import './Recovery.css';
import logoFogo from "../../assets/images/LOGO.png";
import logoNome from "../../assets/images/NOME.png";

export default function Recovery({ setPage }) {
  // Estados para a Tela 1 (Solicitar)
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Estados para a Tela 2 (Redefinir)
  const [token, setToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReset, setIsReset] = useState(false);

  // Efeito para extrair o token da URL (Critério de Aceite)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

  const handleSendLink = (e) => {
    e.preventDefault();
    // Validação de e-mail já é feita pelo type="email" do HTML5
    setIsSent(true);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Validações (Critérios de Aceite)
    if (newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    setIsReset(true);
  };

  return (
    <div className="recovery-page-container">
      <div className="recovery-card">
        <button className="close-btn" onClick={() => setPage('login')}>✕</button>
        
        <div className="recovery-header">
          <img src={logoFogo} alt="Logo" className="recovery-logo-fogo" />
          <br />
          <img src={logoNome} alt="Openest" className="recovery-logo-nome" />
        </div>

        {/* LOGICA DE TELAS */}
        {!token ? (
          // TELA 1 - SOLICITAR RECUPERAÇÃO
          <div className="step-container">
            {!isSent ? (
              <form onSubmit={handleSendLink}>
                <h2 className="recovery-title">Recuperar Senha</h2>
                <p className="recovery-desc">Enviaremos um link de recuperação para o seu e-mail.</p>
                
                <div className="input-field">
                  <label>E-mail</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn-recovery">ENVIAR LINK</button>
              </form>
            ) : (
              <div className="success-state">
                <div className="icon">📧</div>
                <h2>Link Enviado!</h2>
                <p>Verifique sua caixa de entrada para continuar.</p>
                <button className="btn-secondary" onClick={() => setPage('login')}>VOLTAR AO LOGIN</button>
              </div>
            )}
          </div>
        ) : (
          // TELA 2 - REDEFINIR SENHA (Acessada via token)
          <div className="step-container">
            {!isReset ? (
              <form onSubmit={handleResetPassword}>
                <h2 className="recovery-title">Nova Senha</h2>
                <p className="recovery-desc">Crie uma senha forte de pelo menos 6 caracteres.</p>
                
                <div className="input-field">
                  <label>Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="******" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>

                <div className="input-field">
                  <label>Confirmar Senha</label>
                  <input 
                    type="password" 
                    placeholder="******" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn-recovery">REDEFINIR SENHA</button>
              </form>
            ) : (
              <div className="success-state">
                <div className="icon">✅</div>
                <h2>Senha Alterada!</h2>
                <p>Sua senha foi redefinida com sucesso.</p>
                <button className="btn-recovery" onClick={() => setPage('login')}>FAZER LOGIN</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}