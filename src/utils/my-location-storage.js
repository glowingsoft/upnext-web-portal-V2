const SESSION_KEY = 'myLocation';

// GeoJSON coordinate order is [lng, lat]; [0, 0] is a placeholder default, not a real point.
const isRealCoords = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' && (lat !== 0 || lng !== 0);

export function getMyLocation() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setMyLocation(location) {
  try {
    if (location) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(location));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — nothing to persist to, safe to skip.
  }
}

// Pulls { address, lat, lng } out of a login/user payload's location field, wherever it's
// nested. The address is kept even when coordinates are still the [0, 0] placeholder (there's
// still a real address string worth displaying), but callers should check hasRealCoords before
// sending lat/lng to an API.
export function extractLocationFromUser(user) {
  const location = user?.location || user?.profile?.location || user?.basicInfo?.location;
  const coords = location?.coordinates;
  if (!location || !Array.isArray(coords) || coords.length !== 2) return null;

  const [lng, lat] = coords;
  return { address: location.address || '', lat, lng };
}

export { isRealCoords };
