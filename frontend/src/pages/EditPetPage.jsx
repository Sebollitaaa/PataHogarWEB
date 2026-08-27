import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { catalogApi } from '../api/catalog';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import PhotoPicker from '../components/PhotoPicker';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import { XIcon } from '../components/icons/Icons';
import './publish.css';

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL;

export default function EditPetPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [pet, setPet] = useState(null);
  const [form, setForm] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    catalogApi.species().then((d) => setSpecies(d.species));
    petsApi.getOne(id).then(({ pet }) => {
      if (pet.owner.id !== user.id) {
        navigate('/mis-publicaciones');
        return;
      }
      setPet(pet);
      setForm({
        speciesId: pet.species.id, name: pet.name, breed: pet.breed || '', size: pet.size,
        ageYears: pet.ageYears, ageMonths: pet.ageMonths, sex: pet.sex,
        isVaccinated: pet.isVaccinated, isNeutered: pet.isNeutered, isDewormed: pet.isDewormed,
        description: pet.description, contactWhatsapp: pet.contactWhatsapp || '', contactEmail: pet.contactEmail || '',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { pet: updated } = await petsApi.update(id, form);
      setPet(updated);
      navigate(`/mascotas/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePhoto(photoId) {
    setPhotoError('');
    try {
      await petsApi.deletePhoto(id, photoId);
      setPet((p) => ({ ...p, photos: p.photos.filter((ph) => ph.id !== photoId) }));
    } catch (err) {
      setPhotoError(err.message);
    }
  }

  async function handleUploadPhotos() {
    if (newPhotos.length === 0) return;
    setPhotoError('');
    setUploading(true);
    try {
      const fd = new FormData();
      newPhotos.forEach((file) => fd.append('photos', file));
      const { photos } = await petsApi.addPhotos(id, fd);
      setPet((p) => ({ ...p, photos }));
      setNewPhotos([]);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!pet || !form) return <FullPageSpinner />;

  return (
    <div className="container publish-page">
      <div className="card publish-card">
        <h1>Editar publicación</h1>

        <Field label="Fotos actuales">
          <div className="photo-picker__grid">
            {pet.photos.map((p) => (
              <div key={p.id} className="photo-picker__item">
                <img src={`${API_ORIGIN}${p.thumbnail}`} alt="" />
                <button type="button" onClick={() => handleDeletePhoto(p.id)} aria-label="Quitar foto"><XIcon size={14} /></button>
              </div>
            ))}
          </div>
        </Field>

        {photoError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{photoError}</div>}

        <Field label="Agregar fotos nuevas">
          <PhotoPicker files={newPhotos} onChange={setNewPhotos} />
          {newPhotos.length > 0 && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleUploadPhotos} disabled={uploading}>
              {uploading ? 'Subiendo…' : 'Subir fotos seleccionadas'}
            </button>
          )}
        </Field>

        {error && <div className="alert alert-error" style={{ margin: '16px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row-3">
            <Field label="Nombre" htmlFor="name">
              <input id="name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Especie" htmlFor="speciesId">
              <select id="speciesId" className="input" value={form.speciesId} onChange={(e) => set('speciesId', e.target.value)}>
                {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Raza (opcional)" htmlFor="breed">
              <input id="breed" className="input" value={form.breed} onChange={(e) => set('breed', e.target.value)} />
            </Field>
          </div>

          <div className="field-row-3">
            <Field label="Tamaño" htmlFor="size">
              <select id="size" className="input" value={form.size} onChange={(e) => set('size', e.target.value)}>
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </Field>
            <Field label="Sexo" htmlFor="sex">
              <select id="sex" className="input" value={form.sex} onChange={(e) => set('sex', e.target.value)}>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </Field>
            <Field label="Edad aproximada">
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" max="40" className="input" placeholder="Años" value={form.ageYears} onChange={(e) => set('ageYears', e.target.value)} />
                <input type="number" min="0" max="11" className="input" placeholder="Meses" value={form.ageMonths} onChange={(e) => set('ageMonths', e.target.value)} />
              </div>
            </Field>
          </div>

          <Field label="Estado de salud">
            <label className="checkbox-row"><input type="checkbox" checked={form.isVaccinated} onChange={(e) => set('isVaccinated', e.target.checked)} /> Vacunado</label>
            <label className="checkbox-row"><input type="checkbox" checked={form.isNeutered} onChange={(e) => set('isNeutered', e.target.checked)} /> Castrado/esterilizado</label>
            <label className="checkbox-row"><input type="checkbox" checked={form.isDewormed} onChange={(e) => set('isDewormed', e.target.checked)} /> Desparasitado</label>
          </Field>

          <Field label="Descripción" htmlFor="description">
            <textarea id="description" className="input" rows={5} required minLength={10} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>

          <div className="field-row">
            <Field label="WhatsApp de contacto (opcional)" htmlFor="contactWhatsapp">
              <input id="contactWhatsapp" className="input" value={form.contactWhatsapp} onChange={(e) => set('contactWhatsapp', e.target.value)} />
            </Field>
            <Field label="Email de contacto (opcional)" htmlFor="contactEmail">
              <input id="contactEmail" type="email" className="input" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            </Field>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
