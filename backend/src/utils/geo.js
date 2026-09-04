const EARTH_RADIUS_METERS = 6371000; // radio medio de la Tierra, usado por la fórmula de Haversine

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Distancia entre dos puntos (lat/lng en grados decimales) sobre la superficie terrestre, en metros.
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

// El servidor es la única fuente de verdad sobre si una marca cae dentro del área de la sede.
function isWithinSite(lat, lng, site) {
  const distanceMeters = haversineDistanceMeters(lat, lng, site.latitud, site.longitud);
  return {
    distanceMeters,
    withinArea: distanceMeters <= site.radio_metros,
  };
}

// Un empleado puede tener varias sedes asignadas (rota entre locales, o cambia de sede a
// mitad de jornada); la marca es válida si cae dentro del radio de CUALQUIERA de ellas. Si no
// cae dentro de ninguna, se reporta la más cercana (para mostrar la distancia real al admin).
function isWithinAnySite(lat, lng, sites) {
  let best = null;
  for (const site of sites) {
    const result = isWithinSite(lat, lng, site);
    if (result.withinArea) return { site, ...result };
    if (!best || result.distanceMeters < best.distanceMeters) best = { site, ...result };
  }
  return best || { site: null, distanceMeters: null, withinArea: false };
}

module.exports = { haversineDistanceMeters, isWithinSite, isWithinAnySite };
