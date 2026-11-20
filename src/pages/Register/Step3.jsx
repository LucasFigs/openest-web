// src/pages/Register/Step3.jsx — foto e tipo de perfil.
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

const Step3PhotoStatus = ({ back, update, data, submit, enviando = false }) => {
  const inputRef = useRef(null);
  // Prévia por URL de objeto: leve e liberada quando a foto muda.
  const [preview, setPreview] = useState(() => (data.photo ? URL.createObjectURL(data.photo) : null));

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update({ photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!enviando) submit();
  };

  return (
    <form className="step-form" onSubmit={handleSubmit}>
      <h1 className="register-title">Quase lá</h1>

      <div className="register-photo">
        <button
          type="button"
          className={`photo-upload-card ${preview ? 'has-photo' : ''}`}
          onClick={() => inputRef.current?.click()}
          aria-label={preview ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}
        >
          {preview ? (
            <img src={preview} alt="" className="photo-preview" />
          ) : (
            <span className="upload-placeholder">
              <Camera size={26} aria-hidden="true" />
              Adicionar foto
            </span>
          )}
        </button>
        <span className="register-photo-hint">
          {preview ? 'Toque na foto para trocar.' : 'Perfis com foto recebem mais curtidas.'}
        </span>
        <input
          ref={inputRef}
          id="photoInput"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          hidden
        />
      </div>

      <div className="register-field">
        <label htmlFor="reg-tipo">Como você se identifica?</label>
        <select
          id="reg-tipo"
          value={data.relationshipStatus}
          onChange={(e) => update({ relationshipStatus: e.target.value })}
        >
          <option value="individual">Indivíduo</option>
          <option value="couple">Casal</option>
        </select>
      </div>

      <div className="button-group">
        <button type="button" className="btn-secondary" onClick={back} disabled={enviando}>Voltar</button>
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </div>
    </form>
  );
};

export default Step3PhotoStatus;
