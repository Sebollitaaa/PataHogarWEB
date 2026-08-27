import { Link } from 'react-router-dom';
import { HeartIcon, MapPinIcon } from './icons/Icons';
import { formatAge, formatDistance, sizeLabel } from '../utils/format';
import './pet-card.css';

const API_ORIGIN = import.meta.env.VITE_SOCKET_URL;

export default function PetCard({ pet, isFavorite, onToggleFavorite, showFavoriteButton }) {
  const cover = pet.photos?.[0];

  return (
    <div className="pet-card">
      <Link to={`/mascotas/${pet.id}`} className="pet-card__media">
        {cover ? (
          <img src={`${API_ORIGIN}${cover.medium}`} alt={pet.name} loading="lazy" />
        ) : (
          <div className="pet-card__media pet-card__media--empty" />
        )}
        {pet.status !== 'disponible' && (
          <span className={`pet-card__status pet-card__status--${pet.status}`}>
            {pet.status === 'en_proceso' ? 'En proceso' : pet.status === 'adoptada' ? 'Adoptada' : 'Desactualizada'}
          </span>
        )}
      </Link>

      {showFavoriteButton && (
        <button
          className={`pet-card__fav ${isFavorite ? 'pet-card__fav--active' : ''}`}
          onClick={() => onToggleFavorite(pet)}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <HeartIcon filled={isFavorite} size={18} />
        </button>
      )}

      <Link to={`/mascotas/${pet.id}`} className="pet-card__body">
        <h3>{pet.name}</h3>
        <p className="pet-card__meta">{pet.species.name}{pet.breed ? ` · ${pet.breed}` : ''} · {sizeLabel(pet.size)}</p>
        <p className="pet-card__meta">{formatAge(pet.ageYears, pet.ageMonths)}</p>
        {pet.distanceKm !== undefined && (
          <p className="pet-card__distance"><MapPinIcon size={14} /> {formatDistance(pet.distanceKm)}</p>
        )}
      </Link>
    </div>
  );
}
