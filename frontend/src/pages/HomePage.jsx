import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { favoritesApi } from '../api/favorites';
import { catalogApi } from '../api/catalog';
import { useAuth } from '../context/AuthContext';
import PetCard from '../components/PetCard';
import FilterSidebar from '../components/FilterSidebar';
import CityAutocomplete from '../components/CityAutocomplete';
import { PawIcon, PlusIcon, SearchIcon } from '../components/icons/Icons';
import { speciesIcon } from '../utils/speciesIcons';
import './home.css';

const EMPTY_FILTERS = {
  q: '', speciesId: '', sex: '', size: '', minAgeYears: '', maxAgeYears: '',
  isVaccinated: false, isNeutered: false, isDewormed: false,
  city: null, maxDistanceKm: '100', page: 1,
};

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [species, setSpecies] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchDraft, setSearchDraft] = useState('');
  const [result, setResult] = useState({ pets: [], pagination: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const cityDefaultApplied = useRef(false);

  useEffect(() => {
    catalogApi.species().then((d) => setSpecies(d.species)).catch(() => {});
    petsApi.stats().then(setStats).catch(() => {});
  }, []);

  // Por defecto, mostramos mascotas cerca de la ciudad del usuario logueado.
  useEffect(() => {
    if (isAuthenticated && user?.cityName && !cityDefaultApplied.current) {
      cityDefaultApplied.current = true;
      catalogApi.cities().then((d) => {
        const match = d.cities.find((c) => c.id === user.cityId);
        if (match) {
          setFilters((f) => ({
            ...f,
            city: { georefId: null, name: match.name, province: match.province, latitude: match.latitude, longitude: match.longitude },
          }));
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      favoritesApi.list().then((d) => setFavoriteIds(new Set(d.pets.map((p) => p.id)))).catch(() => {});
    } else {
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function runSearch() {
    setLoading(true);
    try {
      const params = {
        q: filters.q || undefined,
        speciesId: filters.speciesId || undefined,
        sex: filters.sex || undefined,
        size: filters.size || undefined,
        minAgeYears: filters.minAgeYears || undefined,
        maxAgeYears: filters.maxAgeYears || undefined,
        isVaccinated: filters.isVaccinated || undefined,
        isNeutered: filters.isNeutered || undefined,
        isDewormed: filters.isDewormed || undefined,
        lat: filters.city?.latitude,
        lng: filters.city?.longitude,
        maxDistanceKm: filters.city ? filters.maxDistanceKm : undefined,
        page: filters.page,
        pageSize: 24,
      };
      const data = await petsApi.search(params);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(pet) {
    const isFav = favoriteIds.has(pet.id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(pet.id) : next.add(pet.id);
      return next;
    });
    try {
      if (isFav) await favoritesApi.remove(pet.id);
      else await favoritesApi.add(pet.id);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(pet.id) : next.delete(pet.id);
        return next;
      });
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: searchDraft, page: 1 }));
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <h1>Encontrá tu próximo compañero de vida <em>hoy</em>.</h1>
            <p>Miles de mascotas esperando una familia. Buscá, filtrá y contactá directo con quien las tiene en adopción.</p>

            <form className="hero__searchbar" onSubmit={handleSearchSubmit}>
              <SearchIcon size={18} />
              <input
                placeholder="Buscar por raza, nombre…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <div className="hero__searchbar-city">
                <CityAutocomplete
                  value={filters.city}
                  onChange={(city) => setFilters((f) => ({ ...f, city, page: 1 }))}
                  placeholder="Todas las ciudades"
                />
              </div>
              <button type="submit" className="btn btn-accent">Buscar</button>
            </form>
          </div>

          {stats && (
            <div className="hero__stats">
              <div>
                <strong>{stats.available.toLocaleString('es-AR')}</strong>
                <span>mascotas en adopción</span>
              </div>
              <div>
                <strong>{stats.adopted.toLocaleString('es-AR')}</strong>
                <span>hogares felices</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <div className="category-pills">
          <button
            className={!filters.speciesId ? 'category-pill category-pill--active' : 'category-pill'}
            onClick={() => setFilters((f) => ({ ...f, speciesId: '', page: 1 }))}
          >
            <PawIcon size={18} /> Todos
          </button>
          {species.map((s) => {
            const Icon = speciesIcon(s.slug);
            const active = String(filters.speciesId) === String(s.id);
            return (
              <button
                key={s.id}
                className={active ? 'category-pill category-pill--active' : 'category-pill'}
                onClick={() => setFilters((f) => ({ ...f, speciesId: active ? '' : s.id, page: 1 }))}
              >
                <Icon size={18} /> {s.name}
              </button>
            );
          })}
        </div>

        {!isAuthenticated && (
          <div className="promo-banner">
            <div>
              <h2>¿Tenés una mascota que necesita hogar?</h2>
              <p>Publicá su ficha gratis en minutos y conectá con personas que realmente quieren adoptarla.</p>
            </div>
            <div className="promo-banner__actions">
              <Link to="/registro" className="btn btn-primary">Publicar ahora</Link>
              <Link to="/registro" className="btn btn-outline btn-outline--inverted">Crear cuenta</Link>
            </div>
          </div>
        )}

        <div className="home-layout">
          <FilterSidebar
            filters={filters}
            onChange={(f) => setFilters({ ...f, page: 1 })}
            onReset={() => setFilters({ ...EMPTY_FILTERS, city: filters.city, speciesId: filters.speciesId })}
          />

          <div>
            <div className="home-results-header">
              <h2>Mascotas en adopción</h2>
              {!loading && (
                <span className="home-results-count">
                  {result.pagination.total} resultados{filters.city ? ` · ${filters.city.name} y alrededores` : ''}
                </span>
              )}
            </div>

            {loading ? (
              <div className="pet-grid">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />)}
              </div>
            ) : result.pets.length === 0 ? (
              <div className="home-empty">
                <p>No encontramos mascotas con esos filtros.</p>
              </div>
            ) : (
              <div className="pet-grid">
                {result.pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    isFavorite={favoriteIds.has(pet.id)}
                    onToggleFavorite={toggleFavorite}
                    showFavoriteButton={isAuthenticated}
                  />
                ))}
              </div>
            )}

            {result.pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline btn-sm" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                  Anterior
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Página {filters.page} de {result.pagination.totalPages}
                </span>
                <button className="btn btn-outline btn-sm" disabled={filters.page >= result.pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
