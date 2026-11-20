import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import './styles.css';

import logoFogo from '../../assets/images/LOGO.png';
import logoNome from '../../assets/images/NOME.png';

import Step1Credentials from './Step1';
import Step2PersonalInfo from './Step2';
import Step3PhotoStatus from './Step3';

const TOTAL_STEPS = 3;

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    bio: '',
    photo: null,
    relationshipStatus: 'individual',
  });

  const handleSubmitFinal = async () => {
    setErro('');
    setEnviando(true);
    try {
      const birthDate = formData.birthDate && formData.birthDate.trim() !== '' ? formData.birthDate : null;

      const { profileCompleted } = await register(
        {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          // Antes, data, bio, status e foto eram coletados aqui e descartados:
          // a rota de cadastro só grava nome, e-mail e senha.
          afterCreate: async () => {
            await userService.updateProfile({
              birth_date: birthDate,
              bio: formData.bio,
              status_relacionamento: formData.relationshipStatus,
            });
            if (formData.photo) await userService.uploadPhoto(formData.photo);
          },
        },
      );

      navigate(profileCompleted ? '/discovery' : '/edit-profile');
    } catch (error) {
      console.error('Cadastro:', error.response?.status, error.response?.data);
      const mensagem = error.response?.data?.error || error.response?.data?.message;
      setErro(mensagem || 'Não foi possível criar a conta agora. Confira sua conexão e tente de novo.');
      setEnviando(false);
    }
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));

  const prevStep = () => {
    setErro('');
    if (currentStep === 1) navigate('/welcome');
    else setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <button type="button" className="register-close-btn" onClick={() => navigate('/welcome')} aria-label="Voltar">
          <X size={18} aria-hidden="true" />
        </button>

        <div className="register-header">
          <img src={logoFogo} alt="" className="register-logo-fogo" />
          <img src={logoNome} alt="Openest" className="register-logo-nome" />
          <div
            className="register-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={currentStep}
            aria-label={`Etapa ${currentStep} de ${TOTAL_STEPS}`}
          >
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span key={i} className={i < currentStep ? 'is-done' : ''} />
            ))}
          </div>
          <span className="register-step-label">Etapa {currentStep} de {TOTAL_STEPS}</span>
        </div>

        {erro ? <p className="register-error" role="alert">{erro}</p> : null}

        {currentStep === 1 && (
          <Step1Credentials next={nextStep} update={updateFormData} data={formData} />
        )}
        {currentStep === 2 && (
          <Step2PersonalInfo next={nextStep} back={prevStep} update={updateFormData} data={formData} />
        )}
        {currentStep === 3 && (
          <Step3PhotoStatus
            back={prevStep}
            update={updateFormData}
            data={formData}
            submit={handleSubmitFinal}
            enviando={enviando}
          />
        )}

        <p className="footer-text">
          Já tem uma conta? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
