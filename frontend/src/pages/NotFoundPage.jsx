import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Página no encontrada</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>El enlace al que intentaste entrar no existe.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
