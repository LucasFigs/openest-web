// src/pages/Register/Step1.jsx
import React, { useState } from 'react';

const Step1Credentials = ({ next, update, data }) => {
  const [errors, setErrors] = useState({});

  // Validação local antes de avançar
  const validateAndNext = () => {
    let currentErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email || !emailRegex.test(data.email)) {
      currentErrors.email = 'E-mail inválido.';
    }
    if (!data.password || data.password.length < 6) {
      currentErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (data.password !== data.confirmPassword) {
      currentErrors.confirmPassword = 'As senhas não coincidem.';
    }

    if (Object.keys(currentErrors).length === 0) {
      setErrors({});
      next(); // Avança se não houver erros
    } else {
      setErrors(currentErrors);
    }
  };

  return (
    <div className="step-form">
      {/* Insira aqui o logo da chama ON OPENEST da imagem */}
      <h2 className="register-title">Crie sua conta</h2>
      
      <div>
        <label>E-mail</label>
        <input 
          type="email" 
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="exemplo@email.com"
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      <div>
        <label>Senha</label>
        <input 
          type="password" 
          value={data.password}
          onChange={(e) => update({ password: e.target.value })}
          placeholder="******"
        />
        {errors.password && <span className="error-msg">{errors.password}</span>}
      </div>

      <div>
        <label>Confirmar Senha</label>
        <input 
          type="password" 
          value={data.confirmPassword}
          onChange={(e) => update({ confirmPassword: e.target.value })}
          placeholder="******"
        />
        {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
      </div>

      <button className="btn-primary" onClick={validateAndNext}>Próximo</button>
    </div>
  );
};

export default Step1Credentials;