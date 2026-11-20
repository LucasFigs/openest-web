import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import { ChevronRight, KeyRound, LogOut, Trash2, X } from 'lucide-react';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Hook para deslogar
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [settings, setSettings] = useState({
    discreteMode: false,
    matchNotifications: true,
    messageNotifications: true
  });

  useEffect(() => {
    // Preferências de notificação continuam locais…
    const saved = localStorage.getItem('userSettings');
    if (saved) setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
    // …mas o Modo Discreto é a flag REAL do banco (modo_discreto).
    userService.getProfile()
      .then(data => setSettings(prev => ({ ...prev, discreteMode: data?.modo_discreto === true })))
      .catch(err => console.error('Erro ao carregar o Modo Discreto:', err));
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Modo Discreto grava direto no PostgreSQL (otimista, com rollback no erro).
  const handleToggleDiscreteMode = async () => {
    const novo = !settings.discreteMode;
    setSettings(prev => ({ ...prev, discreteMode: novo }));
    try {
      await userService.setDiscreteMode(novo);
    } catch (err) {
      console.error('Erro ao salvar o Modo Discreto:', err);
      setSettings(prev => ({ ...prev, discreteMode: !novo })); // volta ao estado real
      alert('Não foi possível alterar o Modo Discreto.');
    }
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
    <Motion.div
      className="settings-screen-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="settings-premium-card">
        <header className="settings-header-box">
          <h2>Configurações</h2>
          <button className="close-x-btn" onClick={() => navigate('/discovery')} aria-label="Fechar configurações">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="settings-scroll-area">
          <section className="settings-group">
            <h3 className="group-title">Aparência</h3>
            <div className="settings-group-card settings-group-card--padded">
              <ThemeSelector />
              <p className="settings-hint">Automático acompanha o tema do seu sistema. A escolha fica salva neste navegador.</p>
            </div>
          </section>

          <section className="settings-group">
            <h3 className="group-title">Privacidade</h3>
            <div className="settings-group-card">
            <div className="setting-row">
              <div className="setting-text">
                <span className="label-dark">Modo Discreto</span>
                <p className="desc-text">
                  Oculta seu perfil para quem não tem match com você e desliga a
                  confirmação de leitura: nem você nem a outra pessoa verão os
                  checks azuis de "visualizada" — as mensagens param em entregue.
                </p>
              </div>
              <label className="ui-switch">
                <input
                  type="checkbox"
                  checked={settings.discreteMode}
                  onChange={handleToggleDiscreteMode}
                />
                <span className="ui-slider"></span>
              </label>
            </div>
            </div>
          </section>

          <section className="settings-group">
            <h3 className="group-title">Notificações</h3>
            <div className="settings-group-card">
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
            </div>
          </section>

          <section className="settings-group">
            <h3 className="group-title">Conta</h3>
            <div className="settings-group-card">
              <button className="settings-action-btn" onClick={() => setShowPassModal(true)}>
                <span className="row-icon"><KeyRound size={16} aria-hidden="true" /></span>
                <span style={{ flex: 1 }}>Alterar senha</span>
                <ChevronRight size={18} aria-hidden="true" color="var(--color-text-tertiary)" />
              </button>
              <button className="settings-action-btn" onClick={() => setShowLogoutModal(true)}>
                <span className="row-icon"><LogOut size={16} aria-hidden="true" /></span>
                <span style={{ flex: 1 }}>Sair da conta</span>
              </button>
              <button className="settings-action-btn btn-danger-soft" onClick={() => setShowDeleteModal(true)}>
                <span className="row-icon"><Trash2 size={16} aria-hidden="true" /></span>
                <span style={{ flex: 1 }}>Excluir conta</span>
              </button>
            </div>
          </section>

          <section className="settings-group">
            <h3 className="group-title">Sobre</h3>
            <div className="settings-group-card legal-links">
              <button type="button" className="settings-legal-item" onClick={() => navigate('/termos-de-uso')}>
                Termos de Uso
              </button>
              <button type="button" className="settings-legal-item" onClick={() => navigate('/politica-de-privacidade')}>
                Política de Privacidade
              </button>
            </div>
            <p className="settings-version-text">Versão 1.0.4 (Beta) - Fortaleza, CE</p>
          </section>
        </div>

        <footer className="settings-footer-action">
          <button className="main-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </footer>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="modal-blur-overlay">
            <Motion.div className="modal-content-card">
              <h4>Encerrar Sessão?</h4>
              <p>Tem certeza que deseja sair do Openest?</p>
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                <button className="m-btn-danger" onClick={handleLogout}>Sair</button>
              </div>
            </Motion.div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-blur-overlay">
            <Motion.div className="modal-content-card">
              <h4>Excluir conta?</h4>
              <p>Seus dados serão removidos permanentemente conforme a LGPD.</p>
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowDeleteModal(false)}>Voltar</button>
                <button className="m-btn-danger" onClick={handleConfirmDelete} disabled={loading}>
                  {loading ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </Motion.div>
          </div>
        )}

        {showPassModal && (
          <div className="modal-blur-overlay">
            <Motion.div className="modal-content-card">
              <h4>Alterar senha</h4>
              <input type="password" placeholder="Senha atual" className="m-input" aria-label="Senha atual" />
              <input type="password" placeholder="Nova senha" className="m-input" aria-label="Nova senha" />
              <div className="modal-btns">
                <button className="m-btn-back" onClick={() => setShowPassModal(false)}>Cancelar</button>
                <button className="m-btn-save" onClick={() => setShowPassModal(false)}>Salvar</button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
};

export default Settings;