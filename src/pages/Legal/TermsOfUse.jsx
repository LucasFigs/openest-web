import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Legal.css';

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <div className="legal-animated-bg"></div>
      
      <motion.div 
        className="legal-glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="legal-header">
          <button className="legal-back-button" onClick={() => navigate(-1)}>
            ← Voltar
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
      </motion.div>
    </div>
  );
};

export default TermsOfUse;