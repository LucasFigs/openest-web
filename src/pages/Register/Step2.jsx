// src/pages/Register/Step2.jsx — nome, nascimento e bio.
import React, { useState } from 'react';

const Step2PersonalInfo = ({ next, back, update, data }) => {
  const [errors, setErrors] = useState({});

  const validateAndNext = (e) => {
    e.preventDefault();
    const currentErrors = {};
    if (!data.fullName || !data.fullName.trim()) {
      currentErrors.fullName = 'Informe seu nome.';
    }
    if (!data.birthDate) {
      currentErrors.birthDate = 'Informe sua data de nascimento.';
    }
    // Bio é opcional.

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length === 0) next();
  };

  return (
    <form className="step-form" onSubmit={validateAndNext} noValidate>
      <h1 className="register-title">Conte sobre você</h1>

      <div className="register-field">
        <label htmlFor="reg-nome">Nome</label>
        <input
          id="reg-nome"
          type="text"
          autoComplete="name"
          value={data.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder="Seu nome"
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
      </div>

      <div className="register-field">
        <label htmlFor="reg-nascimento">Data de nascimento</label>
        <input
          id="reg-nascimento"
          type="date"
          autoComplete="bday"
          value={data.birthDate}
          onChange={(e) => update({ birthDate: e.target.value })}
          aria-invalid={!!errors.birthDate}
        />
        {errors.birthDate && <span className="error-msg">{errors.birthDate}</span>}
      </div>

      <div className="register-field">
        <label htmlFor="reg-bio">Bio <span className="register-optional">(opcional)</span></label>
        <textarea
          id="reg-bio"
          value={data.bio}
          onChange={(e) => update({ bio: e.target.value })}
          placeholder="Um pouco sobre você..."
          rows="3"
        />
      </div>

      <div className="button-group">
        <button type="button" className="btn-secondary" onClick={back}>Voltar</button>
        <button type="submit" className="btn-primary">Próximo</button>
      </div>
    </form>
  );
};

export default Step2PersonalInfo;
