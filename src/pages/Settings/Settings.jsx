import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext'; 
import userService from '../../services/userService'; 
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Hook para deslogar
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [settings, setSettings] = useState({
    discreteMode: true,
    matchNotifications: true,
    messageNotifications: true
  });

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

  // --- LÓGICA FUNCIONAL DE SAIR ---
  const handleLogout = () => {
    logout(); // Limpa estado global e localStorage
    navigate('/welcome');
  };

  // --- LÓGICA FUNCIONAL DE EXCLUIR ---
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await userService.deleteAccount(); // Chama API para deletar no banco
      logout(); // Limpa sessão
      alert('Conta excluída com sucesso.');
      navigate('/welcome');
    } catch (err) {
      console.error("Erro na exclusão:", err);
      alert('Erro ao excluir conta.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <motion.div 
      className="settings-screen-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="settings-premium-card">
        <header className="settings-header-box">
          <h2>Configurações</h2>
          <button className="close-x-btn" onClick={() => navigate('/discovery')}>✕</button>
        </header>

        <div className="settings-scroll-area">
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

          <section className="settings-group">
            <h3 className="group-title">Conta</h3>
            <button className="settings-action-btn centered-text" onClick={() => setShowPassModal(true)}>
              Alterar senha
            </button>
            <button className="settings-action-btn centered-text" onClick={() => setShowLogoutModal(true)}>
              Sair da conta
            </button>
            <button className="settings-action-btn btn-danger-soft centered-text" onClick={() => setShowDeleteModal(true)}>
              Excluir conta
            </button>
          </section>

          <section className="settings-group">
            <h3 className="group-title">Sobre</h3>
            <div className="legal-links">
              <span className="settings-legal-item" onClick={() => navigate('/termos-de-uso')}>
                Termos de Uso
              </span>
              <span className="settings-legal-item" onClick={() => navigate('/politica-de-privacidade')}>
                Política de Privacidade
              </span>
            </div>
            <p className="settings-version-text">Versão 1.0.4 (Beta) - Fortaleza, CE</p>
          </section>
        </div>

        <footer className="settings-footer-action">
          <button className="main-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        </footer>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="modal-blur-overlay">
            <motion.div className="modal-content-card">
              <h4>Encerrar Sessão?</h4>
              <p>Tem certeza que deseja sair do Openest?</p>
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowLogoutModal(false)}>CANCELAR</button>
                <button className="m-btn-danger" onClick={handleLogout}>SAIR</button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-blur-overlay">
            <motion.div className="modal-content-card">
              <h4>Excluir conta?</h4>
              <p>Seus dados serão removidos permanentemente conforme a LGPD.</p>
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowDeleteModal(false)}>VOLTAR</button>
                <button className="m-btn-danger" onClick={handleConfirmDelete} disabled={loading}>
                  {loading ? "EXCLUINDO..." : "EXCLUIR"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPassModal && (
          <div className="modal-blur-overlay">
            <motion.div className="modal-content-card">
              <h4>Alterar senha</h4>
              <input type="password" placeholder="Senha atual" className="m-input" />
              <input type="password" placeholder="Nova senha" className="m-input" />
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowPassModal(false)}>CANCELAR</button>
                <button className="m-btn-save" onClick={() => setShowPassModal(false)}>SALVAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;