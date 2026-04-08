import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ setPage }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Estado inicial das configurações
  const [settings, setSettings] = useState({
    discreteMode: true,
    matchNotifications: true,
    messageNotifications: true
  });

  // Carregar dados salvos ao iniciar (Persistência)
  useEffect(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setLoading(false);
      alert("Configurações salvas com sucesso!");
    }, 1200);
  };

  return (
    <div className="settings-screen-wrapper">
      <div className="settings-premium-card">
        <header className="settings-header-box">
          <h2>Configurações</h2>
          <button className="close-x-btn" onClick={() => setPage('welcome')}>✕</button>
        </header>

        <div className="settings-scroll-area">
          
          {/* PRIVACIDADE */}
          <section className="settings-group">
            <h3 className="group-title">Privacidade</h3>
            <div className="setting-row">
              <div className="setting-text">
                <span className="label-dark">Modo Discreto</span>
                <p className="desc-text">Oculta seu perfil para quem não tem match com você.</p>
              </div>
              <label className="ui-switch">
                <input 
                  type="checkbox" 
                  checked={settings.discreteMode} 
                  onChange={() => handleToggle('discreteMode')} 
                />
                <span className="ui-slider"></span>
              </label>
            </div>
          </section>

          {/* NOTIFICAÇÕES */}
          <section className="settings-group">
            <h3 className="group-title">Notificações</h3>
            <div className="setting-row">
              <span className="label-dark">Notificações de Match</span>
              <label className="ui-switch">
                <input 
                  type="checkbox" 
                  checked={settings.matchNotifications} 
                  onChange={() => handleToggle('matchNotifications')} 
                />
                <span className="ui-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <span className="label-dark">Notificações de Mensagem</span>
              <label className="ui-switch">
                <input 
                  type="checkbox" 
                  checked={settings.messageNotifications} 
                  onChange={() => handleToggle('messageNotifications')} 
                />
                <span className="ui-slider"></span>
              </label>
            </div>
          </section>

          {/* CONTA */}
          <section className="settings-group">
            <h3 className="group-title">Conta</h3>
            <button className="settings-action-btn" onClick={() => setShowPassModal(true)}>Alterar senha</button>
            <button className="settings-action-btn btn-danger-soft" onClick={() => setShowDeleteModal(true)}>Excluir conta</button>
          </section>

          {/* SOBRE */}
          <section className="settings-group">
            <h3 className="group-title">Sobre</h3>
            <div className="legal-links">
              <a href="#">Termos de Uso</a>
              <a href="#">Política de Privacidade</a>
            </div>
          </section>
        </div>

        <footer className="settings-footer-action">
          <button className="main-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        </footer>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="modal-blur-overlay">
          <div className="modal-content-card">
            <h4>Excluir conta?</h4>
            <p>Seus dados serão removidos permanentemente.</p>
            <div className="modal-btns">
              <button className="m-btn-back" onClick={() => setShowDeleteModal(false)}>VOLTAR</button>
              <button className="m-btn-danger" onClick={() => alert('Conta excluída!')}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SENHA */}
      {showPassModal && (
        <div className="modal-blur-overlay">
          <div className="modal-content-card">
            <h4>Alterar senha</h4>
            <input type="password" placeholder="Senha atual" className="m-input" />
            <input type="password" placeholder="Nova senha" className="m-input" />
            <div className="modal-btns">
              <button className="m-btn-back" onClick={() => setShowPassModal(false)}>CANCELAR</button>
              <button className="m-btn-save" onClick={() => setShowPassModal(false)}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;