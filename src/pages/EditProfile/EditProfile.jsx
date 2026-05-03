import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  // Estado das Fotos original
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800'
  ]);
  const [activePhoto, setActivePhoto] = useState(0);

  // Estado do Formulário completo
  const [formData, setFormData] = useState({
    fullName: 'Leandro Soares',
    age: 25,
    location: 'Fortaleza, CE',
    bio: 'Apaixonado por tecnologia e integração de sistemas.',
    relationshipStatus: 'individual',
    discreteMode: true
  });

  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleAddPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setPhotos([...photos, newUrl]);
      setActivePhoto(photos.length);
    }
  };

  const handleDeletePhoto = (e, index) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (activePhoto >= updated.length) setActivePhoto(updated.length - 1);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem('userProfile', JSON.stringify(formData));
      setIsSaving(false);
      alert("Perfil atualizado com sucesso!");
    }, 1500);
  };

  return (
    <motion.div 
      className="profile-edit-wrapper"
      initial={{ opacity: 0, y: 15 }} // Começa invisível e um pouco abaixo
      animate={{ opacity: 1, y: 0 }}  // Sobe suavemente
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="profile-edit-card">
        <header className="profile-edit-header">
          <h2>Editar Perfil</h2>
          {/* Ação de fechar agora volta para a Discovery */}
          <button className="exit-button" onClick={() => navigate('/discovery')}>✕</button>
        </header>

        <form className="profile-edit-body" onSubmit={handleSave}>
          
          <div className="column-left">
            <div className="image-container-3x4">
              <img src={photos[activePhoto]} alt="Perfil" className="img-render-3x4" />
              <div className="image-overlay-info">
                <h3>{formData.fullName}, {formData.age}</h3>
                <p>{formData.location}</p>
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
              <label>STATUS</label>
              <select 
                value={formData.relationshipStatus} 
                onChange={e => setFormData({...formData, relationshipStatus: e.target.value})}
              >
                <option value="individual">Indivíduo</option>
                <option value="couple">Casal</option>
              </select>
            </div>

            <div className="input-field-premium">
              <label>BIOGRAFIA (SOBRE MIM)</label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})} 
              />
            </div>

            <div className="lgpd-security-bar">
              <span>Modo Discreto (LGPD)</span>
              <input 
                type="checkbox" 
                checked={formData.discreteMode} 
                onChange={e => setFormData({...formData, discreteMode: e.target.checked})} 
              />
            </div>

            <div className="form-action-buttons">
              <span className="delete-link-action" onClick={() => alert('Deseja excluir?')}>Excluir Conta</span>
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