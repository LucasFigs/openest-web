import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

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
    <div className="admin-page-container">
      {/* Sidebar Lateral (Estilo Protótipo) */}
      <aside className="admin-sidebar">
        <div className="admin-badge">
           <span className="badge-number">2</span>
           <span className="badge-icon"> whistle-icon </span>
        </div>
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
                  <strong>1.580</strong>
                </div>
                <div className="stat-box">
                  <span>Crescimento</span>
                  <strong className="positive">+17%</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="reports-view">
              {/* Aqui entraria a lista de denúncias ou gráficos de denúncia */}
              <h3>Denúncias Pendentes</h3>
              <div className="reports-list">
                 {/* Lógica para mapear denúncias via GET /api/admin/denuncias */}
                 <p>Nenhuma denúncia crítica no momento.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;