// src/pages/Register/Step3.jsx
import React, { useState } from 'react';

const Step3PhotoStatus = ({ back, update, data, submit }) => {
  const [preview, setPreview] = useState(null); // Estado local para o preview da imagem

  // Lógica para capturar o arquivo e criar o preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      update({ photo: file }); // Salva o arquivo real no formData pai
      
      // Cria uma URL temporária para exibir a imagem no preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="step-form">
      <h2 className="register-title">Quase lá...</h2>

      <div>
        <label>Foto de Perfil</label>
        {/* Card do upload (referência da imagem 2) */}
        <div className="photo-upload-card" onClick={() => document.getElementById('photoInput').click()}>
          {preview ? (
            <img src={preview} alt="Preview" className="photo-preview" />
          ) : (
            <div className="upload-placeholder">
              {/* Insira aqui o ícone de upload (nuvem/seta) da imagem 2 */}
              <span>Adicionar Foto</span>
            </div>
          )}
        </div>
        {/* Input escondido para o clique */}
        <input 
          id="photoInput"
          type="file" 
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />
      </div>

      <div>
        <label>Como você se identifica?</label>
        <select 
          value={data.relationshipStatus}
          onChange={(e) => update({ relationshipStatus: e.target.value })}
        >
          <option value="individual">Indivíduo</option>
          <option value="couple">Casal</option>
          <option value="admin">Administrador (Teste)</option>
        </select>
      </div>

      <div className="button-group">
        <button className="btn-secondary" onClick={back}>Voltar</button>
        <button className="btn-primary" onClick={submit}>Finalizar Cadastro</button>
      </div>
    </div>
  );
};

export default Step3PhotoStatus;