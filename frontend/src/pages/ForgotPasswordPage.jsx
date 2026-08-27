import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import Field from '../components/ui/Field';
import logo from '../assets/logo-header.png';
import './auth.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-card__brand"><img src={logo} alt="" className="auth-card__logo" /> PataHogar</div>
        <h1>Recuperar contraseña</h1>
        <p className="auth-card__subtitle">Te mandamos un código para definir una nueva.</p>

        {sent ? (
          <div className="alert alert-success">
            Si el email existe, te enviamos un código. Revisá tu casilla y continuá acá abajo.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar código'}
            </button>
          </form>
        )}

        {sent && (
          <button className="btn btn-outline btn-block" style={{ marginTop: 16 }} onClick={() => navigate(`/restablecer-password?email=${encodeURIComponent(email)}`)}>
            Ya tengo el código
          </button>
        )}

        <p className="auth-card__footer"><Link to="/ingresar">Volver a ingresar</Link></p>
      </div>
    </div>
  );
}
