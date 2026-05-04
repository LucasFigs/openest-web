import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Legal.css';

const PrivacyPolicy = () => {
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
          <h1>Privacidade</h1>
          <p className="legal-subtitle">Em total conformidade com a LGPD (Brasil)</p>
          <div className="legal-divider"></div>
        </header>

        <div className="legal-scroll-content">
          <section className="highlight-section">
            <h3>🛡️ Direitos do Titular (Art. 18 LGPD)</h3>
            <p>Garantimos a você o pleno exercício dos seus direitos:</p>
            <ul>
              <li><strong>Confirmação e Acesso:</strong> Direito de saber se tratamos seus dados e acessá-los.</li>
              <li><strong>Direito ao Esquecimento:</strong> Você pode revogar seu consentimento e exigir a exclusão total de seus dados da nossa base de Fortaleza a qualquer momento.</li>
              <li><strong>Portabilidade:</strong> Direito de solicitar a transferência dos seus dados para outro fornecedor de serviço.</li>
              <li><strong>Correção:</strong> Direito de retificar dados incompletos ou inexatos.</li>
            </ul>
          </section>

          <section>
            <h3>Uso de Localização e Dados Sensíveis</h3>
            <p>Coletamos dados de localização aproximada para facilitar o "Discovery" em bairros como Meireles e Aldeota. Não compartilhamos, vendemos ou utilizamos seus dados para finalidades publicitárias de terceiros.</p>
          </section>

          <section>
            <h3>Segurança e Armazenamento</h3>
            <p>Seus dados são armazenados de forma segura e utilizamos protocolos de criptografia para proteger suas interações no Chat.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;