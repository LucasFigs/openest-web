import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. Importar o hook de navegação
import './styles.css';

// Caminho do logo
import logoOpenest from '../../assets/logo-openest.png';

// Importando os componentes das etapas
import Step1Credentials from './Step1';
import Step2PersonalInfo from './Step2';
import Step3PhotoStatus from './Step3';

const RegisterPage = () => { // 2. Remover o { setPage } das props
  const { register } = useContext(AuthContext);
  const navigate = useNavigate(); // 3. Inicializar o navigate
  
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

  const handleSubmitFinal = async () => {
    try {
      const dataToSend = {
        name: formData.fullName, 
        email: formData.email,
        password: formData.password
      };

      await register(dataToSend); 
      // Se o cadastro der certo, o AuthContext loga o usuário e nós jogamos para a Discovery
      navigate('/discovery'); 
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
      // 4. Trocar setPage por navigate
      navigate('/welcome');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        {/* 5. Trocar setPage por navigate no botão de fechar */}
        <button className="close-btn" onClick={() => navigate('/welcome')}>✕</button>

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
          <Step2PersonalInfo 
            next={nextStep} 
            back={prevStep} 
            update={updateFormData} 
            data={formData} 
          />
        )}
        {currentStep === 3 && (
          <Step3PhotoStatus 
            back={prevStep} 
            update={updateFormData} 
            data={formData} 
            submit={handleSubmitFinal} 
          />
        )}
        
        <p className="footer-text">
          {/* 6. Trocar setPage por navigate no link de entrar */}
          Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;