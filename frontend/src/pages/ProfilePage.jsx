import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';
import { getBrowserLocation } from '../utils/geolocation';
import Field from '../components/ui/Field';
import CityAutocomplete from '../components/CityAutocomplete';
import { CameraIcon, UserIcon } from '../components/icons/Icons';
import { API_ORIGIN } from '../api/origin';
import './profile.css';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(
    user.cityName ? { georefId: null, name: user.cityName, province: user.cityProvince } : null
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user.profilePhotoUrl ? `${API_ORIGIN}${user.profilePhotoUrl}` : null);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      if (phone !== user.phone) fd.append('phone', phone);

      // Solo mandamos la ciudad si el usuario efectivamente eligió una nueva de la lista
      // (tiene georefId); si no tocó el campo, se mantiene la que ya tenía.
      if (city?.georefId) {
        fd.append('cityGeorefId', city.georefId);
        fd.append('cityName', city.name);
        fd.append('cityProvince', city.province);
        fd.append('cityLat', city.latitude);
        fd.append('cityLng', city.longitude);
        const loc = await getBrowserLocation();
        if (loc) {
          fd.append('verifiedLat', loc.lat);
          fd.append('verifiedLng', loc.lng);
        }
      }

      if (photoFile) fd.append('profilePhoto', photoFile);

      if (newPassword) {
        fd.append('currentPassword', currentPassword);
        fd.append('newPassword', newPassword);
        fd.append('confirmNewPassword', confirmNewPassword);
      }

      const { user: updated, passwordChanged } = await usersApi.updateMe(fd);
      setUser(updated);
      setCity(updated.cityName ? { georefId: null, name: updated.cityName, province: updated.cityProvince } : null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPhotoFile(null);
      setSuccess(passwordChanged ? 'Perfil actualizado. Como cambiaste la contraseña, tu sesión en otros dispositivos se cerró.' : 'Perfil actualizado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container profile-page">
      <div className="card profile-card">
        <h1>Mi perfil</h1>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-photo-row">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="profile-photo" />
            ) : (
              <div className="profile-photo profile-photo--placeholder"><UserIcon size={28} /></div>
            )}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current.click()}>
              <CameraIcon size={16} /> Cambiar foto
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
          </div>

          <Field label="Nombre">
            <input className="input" value={`${user.firstName} ${user.lastName}`} disabled />
          </Field>
          <Field label="Email">
            <input className="input" value={user.email} disabled />
          </Field>
          <Field label="Teléfono" htmlFor="phone">
            <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Ciudad" htmlFor="city" hint="Si la cambiás, te vamos a pedir tu ubicación de nuevo para verificarla.">
            <CityAutocomplete id="city" value={city} onChange={setCity} />
          </Field>

          <h3 className="profile-section-title">Cambiar contraseña</h3>
          <Field label="Contraseña actual" htmlFor="currentPassword">
            <input id="currentPassword" type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>
          <div className="field-row">
            <Field label="Nueva contraseña" htmlFor="newPassword">
              <input id="newPassword" type="password" className="input" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <Field label="Confirmar nueva contraseña" htmlFor="confirmNewPassword">
              <input id="confirmNewPassword" type="password" className="input" minLength={8} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
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
