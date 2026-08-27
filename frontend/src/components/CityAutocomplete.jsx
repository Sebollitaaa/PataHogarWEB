import { useEffect, useRef, useState } from 'react';
import { catalogApi } from '../api/catalog';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { MapPinIcon } from './icons/Icons';
import './city-autocomplete.css';

/**
 * Buscador de ciudades/pueblos de Argentina con sugerencias en vivo (API Georef).
 * `value` es la localidad elegida ({ georefId, name, province, latitude, longitude }) o null.
 */
export default function CityAutocomplete({ value, onChange, id, placeholder = 'Escribí tu ciudad o pueblo…' }) {
  const [query, setQuery] = useState(value ? `${value.name}, ${value.province}` : '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const requestId = useRef(0);

  useOnClickOutside(wrapRef, () => setOpen(false));

  useEffect(() => {
    if (value) setQuery(`${value.name}, ${value.province}`);
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 2 || (value && query === `${value.name}, ${value.province}`)) {
      setSuggestions([]);
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    const timeout = setTimeout(() => {
      catalogApi.searchCities(query.trim())
        .then((d) => {
          if (currentRequest === requestId.current) setSuggestions(d.cities);
        })
        .finally(() => {
          if (currentRequest === requestId.current) setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleSelect(city) {
    onChange(city);
    setQuery(`${city.name}, ${city.province}`);
    setSuggestions([]);
    setOpen(false);
  }

  function handleInputChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    if (value) onChange(null);
  }

  return (
    <div className="city-autocomplete" ref={wrapRef}>
      <input
        id={id}
        className="input"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
      />
      {open && (query.trim().length >= 2) && (
        <ul className="city-autocomplete__list">
          {loading && <li className="city-autocomplete__hint">Buscando…</li>}
          {!loading && suggestions.length === 0 && (
            <li className="city-autocomplete__hint">Sin resultados, probá con otro nombre.</li>
          )}
          {!loading && suggestions.map((c) => (
            <li key={c.georefId}>
              <button type="button" onClick={() => handleSelect(c)}>
                <MapPinIcon size={14} />
                <span>{c.name}</span>
                <span className="city-autocomplete__province">{c.province}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
