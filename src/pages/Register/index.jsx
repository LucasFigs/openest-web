import React, { useState } from 'react';
import './styles.css';

// TENTE ESTE CAMINHO EXATO (Subindo dois níveis para chegar em assets)
import logoOpenest from '../../assets/logo-openest.png';

// Importando os componentes das etapas
import Step1Credentials from './Step1';
import Step2PersonalInfo from './Step2';
import Step3PhotoStatus from './Step3';

const RegisterPage = () => {
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
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmitFinal = () => {
    console.log('Cadastro Finalizado:', formData);
    alert('Cadastro realizado com sucesso!');
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="card-tittle">
          {/* USANDO A VARIÁVEL DO IMPORT */}
          <img src={logoOpenest} alt="Openest" className="register-logo" />
        </div>

        {/* Renderização das Etapas */}
        {currentStep === 1 && (
          <Step1Credentials next={nextStep} update={updateFormData} data={formData} />
        )}
        {currentStep === 2 && (
          <Step2PersonalInfo next={nextStep} back={prevStep} update={updateFormData} data={formData} />
        )}
        {currentStep === 3 && (
          <Step3PhotoStatus back={prevStep} update={updateFormData} data={formData} submit={handleSubmitFinal} />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;