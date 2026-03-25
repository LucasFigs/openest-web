// src/pages/Register/Step2.jsx
import React, { useState } from 'react';

const Step2PersonalInfo = ({ next, back, update, data }) => {
  const [errors, setErrors] = useState({});

  const validateAndNext = () => {
    let currentErrors = {};
    if (!data.fullName) {
      currentErrors.fullName = 'Nome completo é obrigatório.';
    }
    if (!data.birthDate) {
      currentErrors.birthDate = 'Data de nascimento é obrigatória.';
    }
    // Bio é opcional, não validamos

    if (Object.keys(currentErrors).length === 0) {
      setErrors({});
      next();
    } else {
      setErrors(currentErrors);
    }
  };

  return (
    <div className="step-form">
      <h2 className="register-title">Conte-nos sobre você</h2>

      <div>
        <label>Nome Completo</label>
        <input 
          type="text" 
          value={data.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder="Seu nome"
        />
        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
      </div>

      <div>
        <label>Data de Nascimento</label>
        <input 
          type="date" 
          value={data.birthDate}
          onChange={(e) => update({ birthDate: e.target.value })}
        />
        {errors.birthDate && <span className="error-msg">{errors.birthDate}</span>}
      </div>

      <div>
        <label>Biografia (Opcional)</label>
        <textarea 
          value={data.bio}
          onChange={(e) => update({ bio: e.target.value })}
          placeholder="Um pouco sobre você..."
          rows="3"
        />
      </div>

      <div className="button-group">
        <button className="btn-secondary" onClick={back}>Voltar</button>
        <button className="btn-primary" onClick={validateAndNext}>Próximo</button>
      </div>
    </div>
  );
};

export default Step2PersonalInfo;