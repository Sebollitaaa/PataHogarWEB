import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getBrowserLocation } from '../utils/geolocation';
import Field from '../components/ui/Field';
import CityAutocomplete from '../components/CityAutocomplete';
import { MapPinIcon } from '../components/icons/Icons';
import logo from '../assets/logo-header.png';
import './auth.css';

const initialForm = {
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [city, setCity] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pidiendo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBrowserLocation().then((loc) => {
      setLocation(loc);
      setLocationStatus(loc ? 'ok' : 'denegada');
    });
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!city) {
      setError('Elegí tu ciudad de la lista de sugerencias.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        cityGeorefId: city.georefId,
        cityName: city.name,
        cityProvince: city.province,
        cityLat: city.latitude,
        cityLng: city.longitude,
        verifiedLat: location?.lat,
        verifiedLng: location?.lng,
      });

      navigate('/ingresar', { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card__brand"><img src={logo} alt="" className="auth-card__logo" /> PataHogar</div>
        <h1>Creá tu cuenta</h1>
        <p className="auth-card__subtitle">Es gratis y te toma menos de un minuto.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <Field label="Nombre" htmlFor="firstName">
              <input id="firstName" className="input" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </Field>
            <Field label="Apellido" htmlFor="lastName">
              <input id="lastName" className="input" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </Field>
          </div>

          <Field label="Email" htmlFor="email">
            <input id="email" type="email" className="input" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>

          <Field label="Teléfono" htmlFor="phone" hint="Lo van a usar otros usuarios para contactarte por WhatsApp si vos lo permitís.">
            <input id="phone" className="input" required placeholder="+54 9 11 1234-5678" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>

          <Field label="Ciudad o pueblo" htmlFor="city">
            <CityAutocomplete id="city" value={city} onChange={setCity} />
          </Field>

          <div className="location-hint">
            <MapPinIcon size={16} />
            {locationStatus === 'pidiendo' && 'Pidiendo tu ubicación para verificar la zona…'}
            {locationStatus === 'ok' && 'Ubicación detectada, se va a comparar con la ciudad que elegiste.'}
            {locationStatus === 'denegada' && 'No compartiste tu ubicación: vamos a usar solo la ciudad que elijas, con menor precisión para "cerca tuyo".'}
          </div>

          <div className="field-row" style={{ marginTop: 16 }}>
            <Field label="Contraseña" htmlFor="password">
              <input id="password" type="password" className="input" required minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} />
            </Field>
            <Field label="Confirmar contraseña" htmlFor="confirmPassword">
              <input id="confirmPassword" type="password" className="input" required minLength={8} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
            </Field>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tenés cuenta? <Link to="/ingresar">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
