import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesApi } from '../api/favorites';
import PetCard from '../components/PetCard';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import './listing-pages.css';

export default function FavoritesPage() {
  const [pets, setPets] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    favoritesApi.list().then((d) => setPets(d.pets));
  }

  async function handleToggle(pet) {
    setPets((list) => list.filter((p) => p.id !== pet.id));
    try {
      await favoritesApi.remove(pet.id);
    } catch {
      load();
    }
  }

  return (
    <div className="container listing-page">
      <h1>Mis favoritos</h1>

      {pets === null ? (
        <FullPageSpinner />
      ) : pets.length === 0 ? (
        <div className="listing-empty">
          <p>Todavía no marcaste ninguna mascota como favorita.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Explorar mascotas</Link>
        </div>
      ) : (
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} isFavorite showFavoriteButton onToggleFavorite={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
