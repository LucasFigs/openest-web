import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { motion } from 'framer-motion'; // Import para animação
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

// Importação da sua logo local
import logoOn from '../../assets/images/LOGO.png'; 

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metrics');
  const [reports, setReports] = useState([]);

  // Mock de dados para os gráficos do protótipo
  const growthData = [
    { name: 'Jan', value: 400 }, { name: 'Fev', value: 500 },
    { name: 'Mar', value: 700 }, { name: 'Abr', value: 650 },
    { name: 'Mai', value: 900 }, { name: 'Jun', value: 1100 },
    { name: 'Jul', value: 1000 }, { name: 'Ago', value: 1300 },
    { name: 'Set', value: 1400 }, { name: 'Out', value: 1580 },
  ];

  // Proteção de Rota: Verifica se é Admin
  if (user?.role !== 'admin') {
    return <Navigate to="/discovery" />;
  }

  return (
    <motion.div 
      className="admin-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sidebar Lateral (Estilo Protótipo) */}
      <aside className="admin-sidebar">
        {/* SUBSTITUIÇÃO DA DIV PELO LOGO COM ANIMAÇÃO */}
        <motion.div 
          className="admin-logo-wrapper"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
           <img 
             src={logoOn} 
             alt="Openest Logo" 
             style={{ width: '40px', height: 'auto', objectFit: 'contain' }} 
           />
        </motion.div>

        <button className="logout-btn" onClick={() => navigate('/discovery')}> ➔ </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="admin-main-content">
        <header className="admin-header">
          <div className="admin-user-info">
            <h2>ADMINISTRADOR</h2>
            <p>{user?.name || "Leandro Soares"}</p>
            <span>{user?.email || "admin@openest.com"}</span>
          </div>
          <img src={user?.avatar || "https://github.com/edudouraado.png"} alt="Admin" className="admin-avatar" />
        </header>

        {/* Abas de Navegação */}
        <nav className="admin-tabs">
          <button 
            className={activeTab === 'metrics' ? 'active' : ''} 
            onClick={() => setActiveTab('metrics')}
          >
            Crescimento de usuários
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Taxa de Denúncias
          </button>
        </nav>

        {/* Container Branco do Dashboard */}
        <section className="dashboard-card">
          {activeTab === 'metrics' ? (
            <div className="metrics-view">
              <h3>Crescimento de usuários</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8e24aa" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8e24aa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8e24aa" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="metrics-footer">
                <div className="stat-box">
                  <span>Total de Usuários</span>
                  <strong>205</strong>
                </div>
                <div className="stat-box">
                  <span>Crescimento</span>
                  <strong className="positive">+17%</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="reports-view">
              <h3>Denúncias Pendentes</h3>
              <div className="reports-list">
                  <p>Nenhuma denúncia crítica no momento.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
};

export default Admin;