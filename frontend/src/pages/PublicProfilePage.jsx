import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi } from '../api/users';
import PetCard from '../components/PetCard';
import Avatar from '../components/Avatar';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import { MapPinIcon, PawIcon } from '../components/icons/Icons';
import { memberSince } from '../utils/format';
import './listing-pages.css';
import './public-profile.css';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    usersApi.getPublicProfile(id).then(setData).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><p>No encontramos a este usuario.</p></div>;
  }
  if (!data) return <FullPageSpinner />;

  const { user, pets } = data;
  const adoptedCount = pets.filter((p) => p.status === 'adoptada').length;

  return (
    <div className="container public-profile">
      <div className="card public-profile__header">
        <Avatar url={user.profilePhotoUrl} size={80} />
        <div>
          <h1>{user.firstName} {user.lastName}</h1>
          <div className="public-profile__meta">
            {user.cityName && (
              <span><MapPinIcon size={14} /> {user.cityName}, {user.cityProvince}</span>
            )}
            <span>Miembro desde {memberSince(user.memberSince)}</span>
          </div>
        </div>
        <div className="public-profile__stats">
          <div>
            <strong>{pets.length}</strong>
            <span>publicaciones</span>
          </div>
          <div>
            <strong>{adoptedCount}</strong>
            <span>dadas en adopción</span>
          </div>
        </div>
      </div>

      <h2 className="public-profile__section-title">Publicaciones de {user.firstName}</h2>

      {pets.length === 0 ? (
        <div className="listing-empty"><PawIcon size={22} /><p>Todavía no publicó ninguna mascota.</p></div>
      ) : (
        <div className="pet-grid">
          {pets.map((pet) => <PetCard key={pet.id} pet={pet} showFavoriteButton={false} />)}
        </div>
      )}
    </div>
  );
}
