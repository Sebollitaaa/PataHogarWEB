/**
 * Calcula años/meses/días transcurridos entre una fecha de nacimiento y "ahora",
 * como una calculadora de edad de calendario normal (no solo dividir milisegundos).
 */
function computeAgeFromBirthDate(birthDate, now = new Date()) {
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(years, 0),
    months: Math.max(months, 0),
    days: Math.max(days, 0),
  };
}

module.exports = { computeAgeFromBirthDate };
