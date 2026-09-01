import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { favoritesApi } from '../api/favorites';
import { conversationsApi } from '../api/conversations';
import { useAuth } from '../context/AuthContext';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import {
  HeartIcon, WhatsAppIcon, MailIcon, EditIcon, TrashIcon, AlertIcon,
} from '../components/icons/Icons';
import { formatAge, sizeLabel, sexLabel, statusLabel } from '../utils/format';
import { API_ORIGIN } from '../api/origin';
import './pet-detail.css';

export default function PetDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const { pet } = await petsApi.getOne(id);
      setPet(pet);
      setActivePhoto(0);
      if (isAuthenticated) {
        const favs = await favoritesApi.list();
        setIsFavorite(favs.pets.some((p) => p.id === Number(id)));
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    setIsFavorite((v) => !v);
    try {
      isFavorite ? await favoritesApi.remove(pet.id) : await favoritesApi.add(pet.id);
    } catch {
      setIsFavorite((v) => !v);
    }
  }

  async function handleStatusChange(status) {
    const { pet: updated } = await petsApi.updateStatus(pet.id, status);
    setPet(updated);
  }

  async function handleDelete() {
    if (!confirm('¿Seguro que querés eliminar esta publicación?')) return;
    await petsApi.remove(pet.id);
    navigate('/mis-publicaciones');
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const { conversationId } = await conversationsApi.start(pet.id, message);
      navigate(`/mensajes/${conversationId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <FullPageSpinner />;
  if (!pet) return null;

  const isOwner = isAuthenticated && user.id === pet.owner.id;
  const isAdmin = isAuthenticated && user.role === 'admin';
  const photos = pet.photos.length ? pet.photos : [{ id: 0, medium: null }];

  return (
    <div className="container pet-detail">
      <div className="pet-detail__gallery">
        <div className="pet-detail__main-photo">
          {photos[activePhoto]?.medium ? (
            <img src={`${API_ORIGIN}${photos[activePhoto].original}`} alt={pet.name} />
          ) : (
            <div className="pet-detail__main-photo--empty" />
          )}
          {pet.status !== 'disponible' && (
            <span className={`badge badge-${pet.status === 'adoptada' ? 'success' : pet.status === 'en_proceso' ? 'warning' : 'danger'} pet-detail__status-badge`}>
              {statusLabel(pet.status)}
            </span>
          )}
        </div>
        {photos.length > 1 && (
          <div className="pet-detail__thumbs">
            {photos.map((p, i) => (
              <button key={p.id} className={i === activePhoto ? 'active' : ''} onClick={() => setActivePhoto(i)}>
                <img src={`${API_ORIGIN}${p.thumbnail}`} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pet-detail__info">
        <div className="pet-detail__title-row">
          <h1>{pet.name}</h1>
          {isAuthenticated && !isOwner && (
            <button className="btn-icon btn-outline" onClick={toggleFavorite} aria-label="Favorito">
              <HeartIcon filled={isFavorite} />
            </button>
          )}
        </div>
        <p className="pet-detail__subtitle">
          {pet.species.name}{pet.breed ? ` · ${pet.breed}` : ''} · {sizeLabel(pet.size)} · {sexLabel(pet.sex)}
        </p>
        <p className="pet-detail__subtitle">{formatAge(pet.ageYears, pet.ageMonths, pet.ageDays)}</p>

        <div className="pet-detail__badges">
          {pet.isVaccinated && <span className="badge badge-primary">Vacunado</span>}
          {pet.isNeutered && <span className="badge badge-primary">Castrado/esterilizado</span>}
          {pet.isDewormed && <span className="badge badge-primary">Desparasitado</span>}
        </div>

        <p className="pet-detail__description">{pet.description}</p>

        <p className="pet-detail__owner">
          Publicado por <Link to={`/usuarios/${pet.owner.id}`} className="pet-detail__owner-link"><strong>{pet.owner.firstName} {pet.owner.lastName}</strong></Link>
        </p>

        {(pet.contactWhatsapp || pet.contactEmail) && (
          <div className="pet-detail__contact-buttons">
            {pet.contactWhatsapp && (
              <a
                className="btn btn-outline"
                target="_blank" rel="noreferrer"
                href={`https://wa.me/${pet.contactWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Te escribo por la publicación de ${pet.name}`)}`}
              >
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
            )}
            {pet.contactEmail && (
              <a
                className="btn btn-outline"
                target="_blank" rel="noreferrer"
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(pet.contactEmail)}&su=${encodeURIComponent(`Publicación de ${pet.name}`)}&body=${encodeURIComponent(`Hola! Te escribo por la publicación de ${pet.name}`)}`}
              >
                <MailIcon size={18} /> Email
              </a>
            )}
          </div>
        )}

        {isOwner && (
          <div className="pet-detail__owner-controls">
            <h3>Gestionar publicación</h3>
            <div className="pet-detail__status-buttons">
              {['disponible', 'en_proceso', 'adoptada'].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${pet.status === s ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleStatusChange(s)}
                >
                  {statusLabel(s)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Link to={`/mascotas/${pet.id}/editar`} className="btn btn-outline btn-sm"><EditIcon size={16} /> Editar</Link>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}><TrashIcon size={16} /> Eliminar</button>
            </div>
          </div>
        )}

        {isAdmin && !isOwner && (
          <div className="pet-detail__owner-controls">
            <h3>Moderación</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleStatusChange('desactualizada')}>
                <AlertIcon size={16} /> Marcar desactualizada
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}><TrashIcon size={16} /> Eliminar</button>
            </div>
          </div>
        )}

        {!isOwner && pet.status === 'disponible' && (
          <div className="pet-detail__message-box">
            <h3>Escribirle al publicador</h3>
            {!isAuthenticated ? (
              <p className="field-hint">
                <Link to="/ingresar" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Iniciá sesión</Link> para mandarle un mensaje.
              </p>
            ) : (
              <form onSubmit={handleSendMessage}>
                {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
                <textarea
                  className="input" rows={3} required placeholder={`Hola! Te escribo por ${pet.name}...`}
                  value={message} onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn btn-accent" disabled={sending} style={{ marginTop: 8 }}>
                  {sending ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
