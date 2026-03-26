import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './styles.css';

// Caminho do logo conforme seu print
import logoOpenest from '../../assets/logo-openest.png';

// Importando os componentes das etapas
import Step1Credentials from './Step1';
import Step2PersonalInfo from './Step2';
import Step3PhotoStatus from './Step3';

const RegisterPage = ({ setPage }) => {
  const { register } = useContext(AuthContext);
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

  // Função unificada e corrigida para enviar os dados certos ao backend
  const handleSubmitFinal = async () => {
    try {
      const dataToSend = {
        name: formData.fullName, 
        email: formData.email,
        password: formData.password
      };

      await register(dataToSend); 
      // O AuthContext cuidará do redirecionamento se o token for salvo
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
    }
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);

  const prevStep = () => {
    if (currentStep === 1) {
      setPage('welcome');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // O return agora está DENTRO da função RegisterPage
  return (
    <div className="register-page-container">
      <div className="register-card">
        <button className="close-btn" onClick={() => setPage('welcome')}>✕</button>

        <div className="card-tittle">
          <img src={logoOpenest} alt="Openest" className="register-logo" />
        </div>

        {currentStep === 1 && (
          <Step1Credentials 
            next={nextStep} 
            update={updateFormData} 
            data={formData} 
            back={prevStep} 
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
}; // Chave que fecha o componente principal

export default RegisterPage;