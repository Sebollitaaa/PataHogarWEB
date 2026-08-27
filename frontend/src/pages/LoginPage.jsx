import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import { PawIcon } from '../components/icons/Icons';
import './auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-card__brand"><PawIcon /> PataHogar</div>
        <h1>Ingresá a tu cuenta</h1>
        <p className="auth-card__subtitle">Encontrá o publicá mascotas en adopción.</p>

        {location.state?.verified && <div className="alert alert-success" style={{ marginBottom: 16 }}>Cuenta verificada, ya podés ingresar.</div>}
        {location.state?.passwordReset && <div className="alert alert-success" style={{ marginBottom: 16 }}>Contraseña actualizada, ingresá con la nueva.</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Field label="Email" htmlFor="email">
            <input
              id="email" type="email" className="input" required autoFocus
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Contraseña" htmlFor="password">
            <input
              id="password" type="password" className="input" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <label className="checkbox-row">
              <input
                type="checkbox" checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              />
              Recordarme
            </label>
            <Link to="/olvide-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tenés cuenta? <Link to="/registro">Creá una gratis</Link>
        </p>
      </div>
    </div>
  );
}
