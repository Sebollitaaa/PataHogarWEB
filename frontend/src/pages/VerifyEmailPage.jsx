import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import Field from '../components/ui/Field';
import { PawIcon } from '../components/icons/Icons';
import './auth.css';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code });
      navigate('/ingresar', { state: { verified: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await authApi.resendCode(email);
      setInfo('Te enviamos un código nuevo.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-card__brand"><PawIcon /> PataHogar</div>
        <h1>Verificá tu email</h1>
        <p className="auth-card__subtitle">Te mandamos un código de 6 dígitos. Puede tardar unos minutos en llegar.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {info && <div className="alert alert-success" style={{ marginBottom: 16 }}>{info}</div>}

        <form onSubmit={handleSubmit}>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Código de verificación" htmlFor="code">
            <input
              id="code" className="input" required inputMode="numeric" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.1rem' }}
            />
          </Field>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verificando…' : 'Verificar cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No te llegó? <button className="link-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Enviando…' : 'Reenviar código'}
          </button>
        </p>
        <p className="auth-card__footer"><Link to="/ingresar">Volver a ingresar</Link></p>
      </div>
    </div>
  );
}
