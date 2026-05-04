import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import './Admin.css';

import logoOn from '../../assets/images/LOGO.png'; 

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metrics');
  
  // Estado para os dados da API
  const [stats, setStats] = useState({
    growth: [],
    matches: [],
    reportsData: []
  });

  // Cores para o gráfico de denúncias
  const COLORS = ['#FF8042', '#FFBB28', '#00C49F'];

  useEffect(() => {
    const fetchKPIs = () => {
      // Simulação de chamada de API (Substitua pelo seu fetch real)
      const mockKPIs = {
        growth: [
          { name: 'Seg', value: 120 }, { name: 'Ter', value: 210 },
          { name: 'Qua', value: 190 }, { name: 'Qui', value: 300 },
          { name: 'Sex', value: 280 }, { name: 'Sáb', value: 450 },
          { name: 'Dom', value: 410 },
        ],
        matches: [
          { name: 'Seg', count: 40 }, { name: 'Ter', count: 55 },
          { name: 'Qua', count: 48 }, { name: 'Qui', count: 70 },
          { name: 'Sex', count: 65 }, { name: 'Sáb', count: 90 },
          { name: 'Dom', count: 85 },
        ],
        reportsData: [
          { name: 'Pendentes', value: 5 },
          { name: 'Em Análise', value: 3 },
          { name: 'Resolvidos', value: 12 }
        ]
      };
      setStats(mockKPIs);
    };

    // const fetchKPIs = async () => {
    //   try {
    // const response = await fetch('http://seu-api-url/admin/stats');
    // const data = await response.json();
    // setStats(data);
    // } catch (error) {
    // console.error("Erro ao buscar KPIs:", error);
    // }
    // };

    fetchKPIs();
    const interval = setInterval(fetchKPIs, 30000); // Refresh a cada 30s
    return () => clearInterval(interval);
  }, []);

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
      <aside className="admin-sidebar">
        <motion.div className="admin-logo-wrapper" whileHover={{ scale: 1.1 }}>
           <img src={logoOn} alt="Openest Logo" style={{ width: '40px' }} />
        </motion.div>
        <button className="logout-btn" onClick={() => navigate('/discovery')}> ➔ </button>
      </aside>

      <main className="admin-main-content">
        <header className="admin-header">
          <div className="admin-user-info">
            <h2>PAINEL DE CONTROLE</h2>
            <p>{user?.name || "Eduardo Dourado"}</p>
          </div>
          <img src={user?.avatar || "https://github.com/edudouraado.png"} alt="Admin" className="admin-avatar" />
        </header>

        <nav className="admin-tabs">
          <button className={activeTab === 'metrics' ? 'active' : ''} onClick={() => setActiveTab('metrics')}>
            Usuários & Matches
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            Status de Denúncias
          </button>
        </nav>

        <section className="dashboard-card">
          {activeTab === 'metrics' ? (
            <div className="metrics-view">
              <div className="chart-group">
                <h3>Crescimento (Últimos 7 dias)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.growth}>
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
                    <Area type="monotone" dataKey="value" stroke="#8e24aa" fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-group" style={{ marginTop: '30px' }}>
                <h3>Matches Realizados</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.matches}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4a148c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="reports-view">
              <h3>Distribuição de Denúncias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.reportsData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.reportsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="reports-legend">
                {stats.reportsData.map((item, i) => (
                  <div key={i}><span style={{ color: COLORS[i] }}>●</span> {item.name}: {item.value}</div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
};

export default Admin;