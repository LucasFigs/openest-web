import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../services/userService';
import './EditProfile.css';

const calcularIdade = (birth_date) => {
  if (!birth_date) return '';
  const nascimento = new Date(birth_date);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesPassou =
    hoje.getMonth() > nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());
  if (!mesPassou) idade--;
  return idade;
};

const idadeParaBirthDate = (idade) => {
  if (!idade) return '';
  const anoNascimento = new Date().getFullYear() - parseInt(idade);
  return `${anoNascimento}-01-01`;
};

// T021 — limite da galeria de fotos de perfil (mesmo N do mobile e da API).
const MAX_PROFILE_PHOTOS = 6;

const EditProfile = () => {
  const navigate = useNavigate();

  const [photos,      setPhotos]      = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);

  const [formData, setFormData] = useState({
    fullName:           '',
    age:                '',   
    birth_date:         '',   
    bio:                '',
    relationshipStatus: 'individual',
    discreteMode:       false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getProfile();
        const idadeCalculada = calcularIdade(data.birth_date);

        setFormData({
          fullName:           data.name              || '',
          age:                idadeCalculada          || '',
          birth_date:         data.birth_date         || '',
          bio:                data.bio               || '',
          relationshipStatus: data.status_relacionamento || 'individual',
          discreteMode:       data.modo_discreto     || false,
        });

        // T021: a galeria ordenada vem em `photos`; `foto_url` é o fallback
        // dos perfis antigos (T020 — foto única).
        const fotosApi = Array.isArray(data.photos) ? data.photos.filter(Boolean) : [];
        if (fotosApi.length > 0) setPhotos(fotosApi);
        else if (data.foto_url) setPhotos([data.foto_url]);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err?.response?.status, err?.response?.data);
        alert('Erro ao carregar dados do perfil.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAddPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido.');
      return;
    }
    if (photos.length >= MAX_PROFILE_PHOTOS) {
      alert(`Seu perfil permite no máximo ${MAX_PROFILE_PHOTOS} fotos.`);
      return;
    }

    try {
      setIsSaving(true);
      const photoUrl = await userService.uploadPhoto(file);
      // T021: entra no fim da galeria (sem virar a principal) e a ordem é
      // salva imediatamente para valer no Card de Descoberta.
      const updated = [...photos, photoUrl];
      await userService.updateProfile({ photos: updated, foto_url: updated[0] });
      setPhotos(updated);
      setActivePhoto(updated.length - 1);
    } catch (err) {
      console.error('Erro no upload:', err?.response?.status, err?.response?.data);
      alert('Erro ao adicionar a foto. Verifique o console para detalhes.');
    } finally {
      setIsSaving(false);
      e.target.value = '';
    }
  };

  // T021 — persiste a nova ordem da galeria (posição 0 = foto principal).
  const savePhotoOrder = async (nextPhotos, nextActive = 0) => {
    try {
      setIsSaving(true);
      await userService.updateProfile({
        photos: nextPhotos,
        foto_url: nextPhotos[0] || null,
      });
      setPhotos(nextPhotos);
      setActivePhoto(Math.min(nextActive, Math.max(0, nextPhotos.length - 1)));
    } catch (err) {
      console.error('Erro ao salvar a ordem das fotos:', err?.response?.status, err?.response?.data);
      alert('Não foi possível salvar a ordem das fotos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMovePhoto = (e, from, to) => {
    e.stopPropagation();
    if (to < 0 || to >= photos.length || from === to) return;
    const updated = [...photos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    savePhotoOrder(updated, to);
  };

  const handleSetMainPhoto = (e, index) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [photos[index], ...photos.filter((_, i) => i !== index)];
    savePhotoOrder(updated, 0);
  };

  const handleDeletePhoto = async (e, index) => {
    e.stopPropagation(); // Evita clicar na miniatura sem querer

    if (photos.length <= 1) {
      alert('Seu perfil precisa manter pelo menos uma foto.');
      return;
    }

    const confirmar = window.confirm("Tem a certeza que deseja apagar a sua foto de perfil?");
    if (!confirmar) return;

    try {
      setIsSaving(true);

      // T021: remove da lista e salva a ordem restante no backend
      // (em vez de zerar só o foto_url, como fazia a versão antiga).
      const updated = photos.filter((_, i) => i !== index);
      await userService.updateProfile({
        photos: updated,
        foto_url: updated[0] || null,
      });
      setPhotos(updated);

      // Ajusta o carrossel para não quebrar a tela
      if (activePhoto >= updated.length) {
        setActivePhoto(Math.max(0, updated.length - 1));
      } else if (index < activePhoto) {
        setActivePhoto(activePhoto - 1);
      }
      
    } catch (err) {
      console.error('Erro ao apagar foto:', err);
      alert('Ocorreu um erro ao apagar a foto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAgeChange = (e) => {
    const idade = e.target.value;
    setFormData(prev => ({
      ...prev,
      age:        idade,
      birth_date: idadeParaBirthDate(idade), 
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const dataToSave = {
      name:                  formData.fullName,
      birth_date:            formData.birth_date,      
      bio:                   formData.bio,
      status_relacionamento: formData.relationshipStatus,
      modo_discreto:         formData.discreteMode,
      // T021: a ordem da galeria é salva junto do perfil (posição 0 = principal)
      photos,
      foto_url:              photos[0] || null,
    };

    try {
      await userService.updateProfile(dataToSave);
      alert('Perfil atualizado com sucesso!');
      navigate('/discovery');
    } catch (err) {
      console.error('Erro ao salvar:', err?.response?.status, err?.response?.data);
      alert('Erro ao salvar alterações.');
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
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="profile-edit-glass-card">
        <header className="profile-edit-header">
          <h2>Editar Perfil</h2>
          <button type="button" className="exit-button" onClick={() => navigate('/discovery')}>✕</button>
        </header>

        <form className="profile-edit-body" onSubmit={handleSave}>

          <div className="column-left">
            {/* 🔥 BLOCO DA IMAGEM E INFO SEPARADOS! */}
            <div className="image-container-3x4">
              {photos.length > 0 ? (
                <img src={photos[activePhoto]} alt="Perfil" className="img-render-3x4" />
              ) : (
                <div className="img-placeholder">Sem fotos</div>
              )}
            </div>
            
            <div className="image-info-below">
              <h3>{formData.fullName || 'Usuário'}, {formData.age || '?'}</h3>
            </div>
            {/* -------------------------------------- */}

            <div className="carousel-mini-list">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className={`mini-item ${index === activePhoto ? 'active' : ''}`}
                  onClick={() => setActivePhoto(index)}
                >
                  <img src={photo} alt="Thumb" className="img-render-3x4" />

                  {index === 0 && (
                    <span className="main-photo-badge" title="Foto principal">★</span>
                  )}

                  <span className="remove-item-btn" onClick={(e) => handleDeletePhoto(e, index)}>×</span>

                  {/* T021 — reordenar e definir a foto principal (posição 0) */}
                  <span className="photo-controls">
                    <button
                      type="button"
                      title="Mover para a esquerda"
                      disabled={index === 0}
                      onClick={(e) => handleMovePhoto(e, index, index - 1)}
                    >←</button>
                    <button
                      type="button"
                      title="Definir como foto principal"
                      disabled={index === 0}
                      onClick={(e) => handleSetMainPhoto(e, index)}
                    >★</button>
                    <button
                      type="button"
                      title="Mover para a direita"
                      disabled={index === photos.length - 1}
                      onClick={(e) => handleMovePhoto(e, index, index + 1)}
                    >→</button>
                  </span>
                </div>
              ))}
              
              {photos.length < MAX_PROFILE_PHOTOS && (
                <div
                  className="add-item-btn"
                  onClick={() => document.getElementById('fileIn').click()}
                  title="Adicionar foto"
                >
                  {isSaving ? '...' : '+'}
                </div>
              )}
            </div>

            <input
              id="fileIn"
              type="file"
              hidden
              onChange={handleAddPhoto}
              accept="image/jpeg,image/png,image/webp"
            />
          </div>

          <div className="column-right">
            <div className="input-field-premium">
              <label>NOME COMPLETO</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="input-field-row">
              <div className="input-field-premium">
                <label>IDADE</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={handleAgeChange}
                  placeholder="Ex: 25"
                />
              </div>
            </div>

            <div className="input-field-premium">
              <label>STATUS DE RELACIONAMENTO</label>
              <select
                value={formData.relationshipStatus}
                onChange={e => setFormData({ ...formData, relationshipStatus: e.target.value })}
              >
                <option value="individual">Indivíduo</option>
                <option value="casal">Casal</option>
                <option value="grupo">Grupo</option>
              </select>
            </div>

            <div className="input-field-premium">
              <label>BIOGRAFIA</label>
              <textarea
                value={formData.bio}
                maxLength={300}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div className="lgpd-security-bar-glass">
              <span>Modo Discreto (LGPD)</span>
              <label className="ui-switch-mini">
                <input
                  type="checkbox"
                  checked={formData.discreteMode}
                  onChange={e => setFormData({ ...formData, discreteMode: e.target.checked })}
                />
                <span className="ui-slider-mini"></span>
              </label>
            </div>

            <div className="form-action-buttons">
              <button type="submit" className="save-button-action" disabled={isSaving}>
                {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default EditProfile;