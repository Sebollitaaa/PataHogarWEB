import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import Field from '../components/ui/Field';
import logo from '../assets/logo-header.png';
import './auth.css';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: params.get('email') || '', code: '', newPassword: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email: form.email, code: form.code, newPassword: form.newPassword });
      navigate('/ingresar', { state: { passwordReset: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-card__brand"><img src={logo} alt="" className="auth-card__logo" /> PataHogar</div>
        <h1>Definí tu nueva contraseña</h1>
        <p className="auth-card__subtitle">Ingresá el código que te llegó por email.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" className="input" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Código" htmlFor="code">
            <input id="code" className="input" required inputMode="numeric" maxLength={6} value={form.code} onChange={(e) => set('code', e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Nueva contraseña" htmlFor="newPassword">
            <input id="newPassword" type="password" className="input" required minLength={8} value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} />
          </Field>
          <Field label="Confirmar nueva contraseña" htmlFor="confirmPassword">
            <input id="confirmPassword" type="password" className="input" required minLength={8} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
          </Field>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </form>

        <p className="auth-card__footer"><Link to="/ingresar">Volver a ingresar</Link></p>
      </div>
    </div>
  );
}
