/** Pide la ubicación del navegador. Se resuelve con null si el usuario la niega o no está disponible (no rechaza). */
export function getBrowserLocation({ timeout = 8000 } = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout, maximumAge: 5 * 60 * 1000 }
    );
  });
}
