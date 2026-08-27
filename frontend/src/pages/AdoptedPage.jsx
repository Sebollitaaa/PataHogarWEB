import { useEffect, useState } from 'react';
import { petsApi } from '../api/pets';
import PetCard from '../components/PetCard';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import './listing-pages.css';

export default function AdoptedPage() {
  const [pets, setPets] = useState(null);

  useEffect(() => {
    petsApi.mine('adoptada').then((d) => setPets(d.pets));
  }, []);

  return (
    <div className="container listing-page">
      <h1>Mascotas que diste en adopción</h1>

      {pets === null ? (
        <FullPageSpinner />
      ) : pets.length === 0 ? (
        <div className="listing-empty">
          <p>Todavía no marcaste ninguna de tus publicaciones como adoptada.</p>
        </div>
      ) : (
        <div className="pet-grid">
          {pets.map((pet) => <PetCard key={pet.id} pet={pet} showFavoriteButton={false} />)}
        </div>
      )}
    </div>
  );
}
