import React, { useContext, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/theme';
import './Admin.css';

import logoOn from '../../assets/images/LOGO.png';

// Dados de exemplo: ainda não existe rota de métricas na API. Quando existir
// (ex.: GET /api/admin/stats), troque MOCK_KPIS pelo retorno dela.
const MOCK_KPIS = {
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
    { name: 'Em análise', value: 3 },
    { name: 'Resolvidos', value: 12 },
  ],
};

// O SVG dos gráficos precisa da cor em si (não da variável CSS).
// Série única validada (faixa de luminosidade, croma e contraste >= 3:1)
// contra a superfície de cada tema: #6d28d9 no claro, #8b5cf6 no escuro.
const CHART_COLORS = {
  light: { series: '#6d28d9', grid: '#eeebf3', axis: '#6b6578', surface: '#ffffff', border: '#e5e2ec', text: '#1a1523', cursor: '#f1eef6' },
  dark: { series: '#8b5cf6', grid: '#2a2636', axis: '#a19db0', surface: '#1b1824', border: '#2a2636', text: '#f4f3f8', cursor: '#221e2c' },
};

// Status com ícone + rótulo + número: a cor nunca carrega o sentido sozinha.
const REPORT_STATUS = [
  { Icon: AlertCircle, tone: 'critical' },
  { Icon: Clock, tone: 'warning' },
  { Icon: CheckCircle2, tone: 'good' },
];

const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'A';

// Tabela só para leitores de tela: os mesmos números dos gráficos.
// O sr-only fica num <div>: tabela ignora height/overflow e esticaria a página.
function DataTable({ caption, rows, valueLabel, valueKey }) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Dia</th><th scope="col">{valueLabel}</th></tr></thead>
        <tbody>
          {rows.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td>{r[valueKey]}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

const Admin = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metrics');

  if (user?.role !== 'admin') {
    return <Navigate to="/discovery" />;
  }

  const stats = MOCK_KPIS;
  const c = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const axisProps = { axisLine: false, tickLine: false, tick: { fill: c.axis, fontSize: 12 } };
  const tooltipProps = {
    contentStyle: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 13 },
    labelStyle: { color: c.axis, marginBottom: 2 },
    itemStyle: { color: c.text },
  };
  const totalDenuncias = stats.reportsData.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <div className="admin-page-container">
      <aside className="admin-sidebar">
        <img src={logoOn} alt="Openest" className="admin-logo" />
        <button type="button" className="logout-btn" onClick={() => navigate('/discovery')} aria-label="Voltar ao app" title="Voltar ao app">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      </aside>

      <main className="admin-main-content">
        <header className="admin-header">
          <div className="admin-user-info">
            <h2>Painel de controle</h2>
            <p>{user?.name || 'Administrador'}</p>
            <span className="admin-sample-badge">Dados de exemplo</span>
          </div>
          <span className="admin-avatar" aria-hidden="true">{iniciais(user?.name)}</span>
        </header>

        <nav className="admin-tabs" role="tablist" aria-label="Seções do painel">
          <button type="button" role="tab" aria-selected={activeTab === 'metrics'} className={activeTab === 'metrics' ? 'active' : ''} onClick={() => setActiveTab('metrics')}>
            Usuários & Matches
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'reports'} className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            Status de Denúncias
          </button>
        </nav>

        <section className="dashboard-card">
          {activeTab === 'metrics' ? (
            <div className="metrics-view">
              <figure className="chart-group">
                <figcaption><h3>Crescimento (Últimos 7 dias)</h3><span>Novos usuários por dia</span></figcaption>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.growth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="admin-growth-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.series} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={c.series} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={c.grid} vertical={false} />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis {...axisProps} width={44} />
                    <Tooltip {...tooltipProps} cursor={{ stroke: c.border, strokeWidth: 1 }} formatter={(v) => [v, 'Novos usuários']} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={c.series}
                      strokeWidth={2}
                      fill="url(#admin-growth-fill)"
                      activeDot={{ r: 5, fill: c.series, stroke: c.surface, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <DataTable caption="Novos usuários por dia" rows={stats.growth} valueLabel="Novos usuários" valueKey="value" />
              </figure>

              <figure className="chart-group">
                <figcaption><h3>Matches Realizados</h3><span>Matches por dia</span></figcaption>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.matches} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
                    <CartesianGrid stroke={c.grid} vertical={false} />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis {...axisProps} width={44} />
                    <Tooltip {...tooltipProps} cursor={{ fill: c.cursor }} formatter={(v) => [v, 'Matches']} />
                    <Bar dataKey="count" fill={c.series} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
                <DataTable caption="Matches por dia" rows={stats.matches} valueLabel="Matches" valueKey="count" />
              </figure>
            </div>
          ) : (
            <div className="reports-view">
              <h3>Distribuição de Denúncias</h3>
              <ul className="report-stats">
                {stats.reportsData.map((item, i) => {
                  const { Icon, tone } = REPORT_STATUS[i] || REPORT_STATUS[0];
                  const pct = Math.round((item.value / totalDenuncias) * 100);
                  return (
                    <li key={item.name} className={`report-stat is-${tone}`}>
                      <span className="report-stat__icon"><Icon size={18} aria-hidden="true" /></span>
                      <span className="report-stat__label">{item.name}</span>
                      <strong className="report-stat__value">{item.value}</strong>
                      <span className="report-stat__pct">{pct}% do total</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;
