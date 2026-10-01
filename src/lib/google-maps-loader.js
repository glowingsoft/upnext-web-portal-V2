import { CONFIG } from 'src/config-global';

let loadPromise = null;

// Loads the Google Maps JS API (with the Places library) exactly once, no matter how many
// components request it concurrently — subsequent calls resolve from the same cached promise.
export function loadGoogleMapsPlaces() {
  if (window.google?.maps?.places) return Promise.resolve(window.google.maps);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const apiKey = CONFIG.googleMaps.apiKey;
    if (!apiKey) {
      reject(new Error('Google Maps API key is not configured (VITE_GOOGLE_MAP_API_KEY).'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__upnextGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;

    window.__upnextGoogleMapsLoaded = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load the Google Maps script.'));

    document.head.appendChild(script);
  });

  return loadPromise;
}
