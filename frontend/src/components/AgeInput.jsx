/**
 * Selector de edad de la mascota: o se marca la fecha de nacimiento (y el sistema
 * calcula la edad solo), o se carga la edad a mano en años/meses/días.
 */
export default function AgeInput({ ageMode, birthDate, ageYears, ageMonths, ageDays, onChange }) {
  return (
    <div>
      <div className="segmented" style={{ marginBottom: 10 }}>
        <button
          type="button"
          className={ageMode === 'birth_date' ? 'segmented__item segmented__item--active' : 'segmented__item'}
          onClick={() => onChange({ ageMode: 'birth_date' })}
        >
          Fecha de nacimiento
        </button>
        <button
          type="button"
          className={ageMode === 'manual' ? 'segmented__item segmented__item--active' : 'segmented__item'}
          onClick={() => onChange({ ageMode: 'manual' })}
        >
          Cargar edad a mano
        </button>
      </div>

      {ageMode === 'birth_date' ? (
        <input
          type="date"
          className="input"
          max={new Date().toISOString().slice(0, 10)}
          value={birthDate || ''}
          onChange={(e) => onChange({ birthDate: e.target.value })}
        />
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" min="0" max="40" className="input" placeholder="Años"
            value={ageYears} onChange={(e) => onChange({ ageYears: e.target.value })}
          />
          <input
            type="number" min="0" max="11" className="input" placeholder="Meses"
            value={ageMonths} onChange={(e) => onChange({ ageMonths: e.target.value })}
          />
          <input
            type="number" min="0" max="364" className="input" placeholder="Días"
            value={ageDays} onChange={(e) => onChange({ ageDays: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
