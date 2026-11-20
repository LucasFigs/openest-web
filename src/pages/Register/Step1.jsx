// src/pages/Register/Step1.jsx — e-mail e senha.
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Step1Credentials = ({ next, update, data }) => {
  const [errors, setErrors] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const validateAndNext = (e) => {
    e.preventDefault();
    const currentErrors = {};
    if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
      currentErrors.email = 'Informe um e-mail válido.';
    }
    if (!data.password || data.password.length < 6) {
      currentErrors.password = 'A senha precisa ter pelo menos 6 caracteres.';
    }
    if (data.password !== data.confirmPassword) {
      currentErrors.confirmPassword = 'As senhas não coincidem.';
    }

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length === 0) next();
  };

  return (
    <form className="step-form" onSubmit={validateAndNext} noValidate>
      <h1 className="register-title">Crie sua conta</h1>

      <div className="register-field">
        <label htmlFor="reg-email">E-mail</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="exemplo@email.com"
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      <div className="register-field">
        <label htmlFor="reg-senha">Senha</label>
        <div className="register-password">
          <input
            id="reg-senha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => update({ password: e.target.value })}
            placeholder="Mínimo de 6 caracteres"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="register-password-toggle"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {errors.password && <span className="error-msg">{errors.password}</span>}
      </div>

      <div className="register-field">
        <label htmlFor="reg-confirmar">Confirmar senha</label>
        <input
          id="reg-confirmar"
          type={mostrarSenha ? 'text' : 'password'}
          autoComplete="new-password"
          value={data.confirmPassword}
          onChange={(e) => update({ confirmPassword: e.target.value })}
          placeholder="Repita a senha"
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
      </div>

      <button type="submit" className="btn-primary">Próximo</button>
    </form>
  );
};

export default Step1Credentials;
