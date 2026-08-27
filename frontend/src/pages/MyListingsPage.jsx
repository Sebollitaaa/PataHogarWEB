import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { petsApi } from '../api/pets';
import PetCard from '../components/PetCard';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import { PlusIcon } from '../components/icons/Icons';
import './listing-pages.css';

const TABS = [
  { value: '', label: 'Todas' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'adoptada', label: 'Adoptada' },
  { value: 'desactualizada', label: 'Desactualizada' },
];

export default function MyListingsPage() {
  const [status, setStatus] = useState('');
  const [pets, setPets] = useState(null);

  useEffect(() => {
    petsApi.mine(status || undefined).then((d) => setPets(d.pets));
  }, [status]);

  return (
    <div className="container listing-page">
      <h1>Mis publicaciones</h1>

      <div className="listing-tabs">
        {TABS.map((t) => (
          <button key={t.value} className={status === t.value ? 'active' : ''} onClick={() => setStatus(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {pets === null ? (
        <FullPageSpinner />
      ) : pets.length === 0 ? (
        <div className="listing-empty">
          <p>Todavía no publicaste ninguna mascota en este estado.</p>
          <Link to="/publicar" className="btn btn-accent" style={{ marginTop: 12 }}><PlusIcon size={16} /> Publicar mascota</Link>
        </div>
      ) : (
        <div className="pet-grid">
          {pets.map((pet) => <PetCard key={pet.id} pet={pet} showFavoriteButton={false} />)}
        </div>
      )}
    </div>
  );
}
