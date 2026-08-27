import { FilterIcon } from './icons/Icons';
import './filter-sidebar.css';

const SIZES = [
  { value: '', label: 'Cualquiera' },
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
];

const DISTANCES = [25, 50, 100, 250, 500];

export default function FilterSidebar({ filters, onChange, cities, onReset }) {
  function set(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <aside className="filters">
      <div className="filters__header">
        <FilterIcon size={18} />
        <span>Filtros</span>
        <button className="link-btn" onClick={onReset}>Limpiar</button>
      </div>

      <div className="field">
        <label>Ubicación</label>
        <select className="input" value={filters.cityId} onChange={(e) => set({ cityId: e.target.value })}>
          <option value="">Todo el país</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filters.cityId && (
        <div className="field">
          <label>Distancia máxima</label>
          <select className="input" value={filters.maxDistanceKm} onChange={(e) => set({ maxDistanceKm: e.target.value })}>
            {DISTANCES.map((d) => <option key={d} value={d}>{d} km</option>)}
          </select>
        </div>
      )}

      <div className="field">
        <label>Sexo</label>
        <div className="segmented">
          {[{ value: '', label: 'Cualquiera' }, { value: 'macho', label: 'Macho' }, { value: 'hembra', label: 'Hembra' }].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={filters.sex === opt.value ? 'segmented__item segmented__item--active' : 'segmented__item'}
              onClick={() => set({ sex: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Tamaño</label>
        <select className="input" value={filters.size} onChange={(e) => set({ size: e.target.value })}>
          {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Edad (años)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min="0" className="input" placeholder="Desde" value={filters.minAgeYears} onChange={(e) => set({ minAgeYears: e.target.value })} />
          <input type="number" min="0" className="input" placeholder="Hasta" value={filters.maxAgeYears} onChange={(e) => set({ maxAgeYears: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label>Salud</label>
        <label className="checkbox-row"><input type="checkbox" checked={filters.isVaccinated} onChange={(e) => set({ isVaccinated: e.target.checked })} /> Vacunado</label>
        <label className="checkbox-row"><input type="checkbox" checked={filters.isNeutered} onChange={(e) => set({ isNeutered: e.target.checked })} /> Castrado/esterilizado</label>
        <label className="checkbox-row"><input type="checkbox" checked={filters.isDewormed} onChange={(e) => set({ isDewormed: e.target.checked })} /> Desparasitado</label>
      </div>
    </aside>
  );
}
