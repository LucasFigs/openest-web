import React, { useState } from 'react';
import './styles.css';

// Caminho do logo conforme seu print
import logoOpenest from '../../assets/logo-openest.png';

// Importando os componentes das etapas
import Step1Credentials from './Step1';
import Step2PersonalInfo from './Step2';
import Step3PhotoStatus from './Step3';

// ADICIONADO: Recebendo a prop setPage para navegação
const RegisterPage = ({ setPage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    bio: '',
    photo: null,
    relationshipStatus: 'individual'
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);

  // AJUSTADO: Se estiver no passo 1 e voltar, vai para a Welcome
  const prevStep = () => {
    if (currentStep === 1) {
      setPage('welcome');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitFinal = () => {
    console.log('Cadastro Finalizado:', formData);
    alert('Cadastro realizado com sucesso!');
    // Após sucesso, você pode mandar para o Login
    setPage('login'); 
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        {/* BOTÃO DE FECHAR: Volta direto para a Welcome */}
        <button className="close-btn" onClick={() => setPage('welcome')}>✕</button>

        <div className="card-tittle">
          <img src={logoOpenest} alt="Openest" className="register-logo" />
        </div>

        {/* Renderização das Etapas */}
        {currentStep === 1 && (
          <Step1Credentials 
            next={nextStep} 
            update={updateFormData} 
            data={formData} 
            back={prevStep} // Agora o Step 1 também tem a função de voltar (para a Welcome)
          />
        )}
        {currentStep === 2 && (
          <Step2PersonalInfo next={nextStep} back={prevStep} update={updateFormData} data={formData} />
        )}
        {currentStep === 3 && (
          <Step3PhotoStatus back={prevStep} update={updateFormData} data={formData} submit={handleSubmitFinal} />
        )}
        
        <p className="footer-text">
          Já tem uma conta? <a href="#" onClick={() => setPage('login')}>Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;