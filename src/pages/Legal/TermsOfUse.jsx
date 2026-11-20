import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import './Legal.css';

const TermsOfUse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Aberta direto pelo link (sem histórico no app): volta para o início.
  const voltar = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  return (
    <div className="legal-page-wrapper">
      <Motion.div
        className="legal-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="legal-header">
          <button type="button" className="legal-back-button" onClick={voltar}>
            <ArrowLeft size={16} aria-hidden="true" /> Voltar
          </button>
          <h1>Termos de Uso</h1>
          <div className="legal-divider"></div>
        </header>

        <div className="legal-scroll-content">
          <section>
            <h3>1. Aceitação e Finalidade</h3>
            <p>Ao utilizar o Openest, você concorda com o tratamento de dados estritamente necessários para a viabilização de conexões sociais, conforme as diretrizes da <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>. O serviço é restrito a maiores de 18 anos.</p>
          </section>

          <section>
            <h3>2. Tolerância Zero para Exposição</h3>
            <p>O Openest é fundamentado na discrição. A captura de telas, gravação de vídeos ou qualquer forma de indexação de perfis de terceiros é proibida. O descumprimento gera exclusão imediata e permanente.</p>
          </section>

          <section>
            <h3>3. Responsabilidade do Usuário</h3>
            <p>O usuário é o único responsável pela veracidade dos dados fornecidos e pela segurança de suas credenciais de acesso.</p>
          </section>
        </div>
      </Motion.div>
    </div>
  );
};

export default TermsOfUse;