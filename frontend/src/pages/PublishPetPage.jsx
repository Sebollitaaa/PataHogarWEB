import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { catalogApi } from '../api/catalog';
import Field from '../components/ui/Field';
import PhotoPicker from '../components/PhotoPicker';
import './publish.css';

const initialForm = {
  speciesId: '', name: '', breed: '', size: 'mediano', ageYears: '0', ageMonths: '0', sex: 'macho',
  isVaccinated: false, isNeutered: false, isDewormed: false, description: '',
  contactWhatsapp: '', contactEmail: '',
};

export default function PublishPetPage() {
  const navigate = useNavigate();
  const [species, setSpecies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    catalogApi.species().then((d) => setSpecies(d.species)).catch(() => {});
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (photos.length === 0) {
      setError('Subí al menos una foto de la mascota.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      photos.forEach((file) => fd.append('photos', file));

      const { pet } = await petsApi.create(fd);
      navigate(`/mascotas/${pet.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container publish-page">
      <div className="card publish-card">
        <h1>Publicar una mascota</h1>
        <p className="publish-subtitle">Completá los datos para que otras personas puedan encontrarla y contactarte.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Field label="Fotos">
            <PhotoPicker files={photos} onChange={setPhotos} />
          </Field>

          <div className="field-row-3">
            <Field label="Nombre" htmlFor="name">
              <input id="name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Especie" htmlFor="speciesId">
              <select id="speciesId" className="input" required value={form.speciesId} onChange={(e) => set('speciesId', e.target.value)}>
                <option value="">Elegí una especie</option>
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

          <Field label="Descripción" htmlFor="description" hint="Contá cómo es su personalidad, con quién se lleva bien, cualquier dato que ayude a encontrarle familia.">
            <textarea id="description" className="input" rows={5} required minLength={10} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>

          <div className="field-row">
            <Field label="WhatsApp de contacto (opcional)" htmlFor="contactWhatsapp">
              <input id="contactWhatsapp" className="input" placeholder="+54 9 11 1234-5678" value={form.contactWhatsapp} onChange={(e) => set('contactWhatsapp', e.target.value)} />
            </Field>
            <Field label="Email de contacto (opcional)" htmlFor="contactEmail">
              <input id="contactEmail" type="email" className="input" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            </Field>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Publicando…' : 'Publicar mascota'}
          </button>
        </form>
      </div>
    </div>
  );
}
