import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; 
import userService from '../../services/userService'; 
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    location: '',
    bio: '',
    relationshipStatus: 'individual',
    discreteMode: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. CARREGAR DADOS (Busca do banco e mapeia para o formulário)
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await userService.getProfile();
        setFormData({
          fullName: data.name || '',
          age: data.age || '',
          location: data.location || '',
          bio: data.bio || '',
          relationshipStatus: data.status_relacionamento || 'individual',
          discreteMode: data.modo_discreto || false
        });
        if (data.foto_url) setPhotos([data.foto_url]);
      } catch { 
        // Catch sem variável resolve o erro de "unused variable"
        console.error("Erro ao carregar dados do perfil");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, []);

  // 2. UPLOAD DE FOTO (Cloudinary via API)
  const handleAddPhoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsSaving(true);
        const photoUrl = await userService.uploadPhoto(file);
        setPhotos(prev => [...prev, photoUrl]);
        setActivePhoto(photos.length);
      } catch {
        alert("Erro ao realizar o upload da imagem.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeletePhoto = (e, index) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (activePhoto >= updated.length) setActivePhoto(updated.length - 1);
  };

  // 3. SALVAR ALTERAÇÕES (Mapeia do formulário para as colunas do Postgres)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Objeto formatado com os nomes exatos das colunas do seu banco de dados
    const dataToSave = {
      name: formData.fullName,
      bio: formData.bio,
      status_relacionamento: formData.relationshipStatus,
      modo_discreto: formData.discreteMode,
      location: formData.location,
      age: formData.age
    };

    try {
      await userService.updateProfile(dataToSave);
      alert("Perfil atualizado com sucesso!");
    } catch {
      alert("Erro ao salvar alterações no banco de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="loading-overlay">Sincronizando dados...</div>;

  return (
    <motion.div 
      className="profile-edit-wrapper"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="profile-edit-glass-card">
        <header className="profile-edit-header">
          <h2>Editar Perfil</h2>
          <button type="button" className="exit-button" onClick={() => navigate('/discovery')}>✕</button>
        </header>

        <form className="profile-edit-body" onSubmit={handleSave}>
          <div className="column-left">
            <div className="image-container-3x4">
              {photos.length > 0 ? (
                <img src={photos[activePhoto]} alt="Perfil" className="img-render-3x4" />
              ) : (
                <div className="img-placeholder">Sem fotos</div>
              )}
              <div className="image-overlay-info">
                <h3>{formData.fullName || "Usuário"}, {formData.age || "0"}</h3>
                <p>{formData.location || "Localização"}</p>
              </div>
            </div>

            <div className="carousel-mini-list">
              {photos.map((photo, index) => (
                <div 
                  key={index} 
                  className={`mini-item ${index === activePhoto ? 'active' : ''}`} 
                  onClick={() => setActivePhoto(index)}
                >
                  <img src={photo} alt="Thumb" className="img-render-3x4" />
                  <span className="remove-item-btn" onClick={(e) => handleDeletePhoto(e, index)}>×</span>
                </div>
              ))}
              <div className="add-item-btn" onClick={() => document.getElementById('fileIn').click()}>+</div>
            </div>
            <input id="fileIn" type="file" hidden onChange={handleAddPhoto} accept="image/*" />
          </div>

          <div className="column-right">
            <div className="input-field-premium">
              <label>NOME COMPLETO</label>
              <input 
                type="text" 
                required
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>

            <div className="input-field-row">
              <div className="input-field-premium">
                <label>IDADE</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData({...formData, age: e.target.value})} 
                />
              </div>
              <div className="input-field-premium">
                <label>LOCALIZAÇÃO</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>

            <div className="input-field-premium">
              <label>STATUS DE RELACIONAMENTO</label>
              <select 
                value={formData.relationshipStatus} 
                onChange={e => setFormData({...formData, relationshipStatus: e.target.value})}
              >
                <option value="individual">Indivíduo</option>
                <option value="couple">Casal</option>
              </select>
            </div>

            <div className="input-field-premium">
              <label>BIOGRAFIA</label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})} 
              />
            </div>

            <div className="lgpd-security-bar-glass">
              <span>Modo Discreto (LGPD)</span>
              <label className="ui-switch-mini">
                <input 
                  type="checkbox" 
                  checked={formData.discreteMode} 
                  onChange={e => setFormData({...formData, discreteMode: e.target.checked})} 
                />
                <span className="ui-slider-mini"></span>
              </label>
            </div>

            <div className="form-action-buttons">
              <button type="submit" className="save-button-action" disabled={isSaving}>
                {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProfile;