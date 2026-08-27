export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'recién';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function formatAge(years, months) {
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  return parts.length ? parts.join(' y ') : 'Cachorro/a';
}

export function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return 'a menos de 1 km';
  return `a ${Math.round(km)} km`;
}

const SIZE_LABELS = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };
const SEX_LABELS = { macho: 'Macho', hembra: 'Hembra' };
const STATUS_LABELS = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptada: 'Adoptada',
  desactualizada: 'Información desactualizada',
};

export function sizeLabel(v) { return SIZE_LABELS[v] || v; }
export function sexLabel(v) { return SEX_LABELS[v] || v; }
export function statusLabel(v) { return STATUS_LABELS[v] || v; }
