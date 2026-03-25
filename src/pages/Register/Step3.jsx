import React, { useState } from 'react';

const Step3PhotoStatus = ({ back, update, data, submit }) => {
  const [preview, setPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      update({ photo: file }); 
      
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

      <div style={{ textAlign: 'center' }}>
        <label>Foto de Perfil</label>
        
        {/* Container redondo fixado no CSS */}
        <div className="photo-upload-card" onClick={() => document.getElementById('photoInput').click()}>
          {preview ? (
            <img src={preview} alt="Preview" className="photo-preview" />
          ) : (
            <div className="upload-placeholder">
              <span style={{ fontSize: '28px', marginBottom: '5px' }}>📷</span>
              <span>ADICIONAR FOTO</span>
            </div>
          )}
        </div>

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
        <button className="btn-secondary" onClick={back}>VOLTAR</button>
        <button className="btn-primary" onClick={submit}>FINALIZAR</button>
      </div>
    </div>
  );
};

export default Step3PhotoStatus;