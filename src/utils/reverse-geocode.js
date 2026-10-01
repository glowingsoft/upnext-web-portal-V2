export function reverseGeocode(maps, { lat, lng }) {
  return new Promise((resolve) => {
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]?.formatted_address) {
        resolve(results[0].formatted_address);
      } else {
        resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  });
}

export function formatCityStateCountry(addressComponents = []) {
  const findComponent = (type) => addressComponents.find((component) => component.types.includes(type))?.long_name;

  const city = findComponent('locality') || findComponent('postal_town') || findComponent('sublocality') || findComponent('administrative_area_level_2');
  const state = findComponent('administrative_area_level_1');
  const country = findComponent('country');
  const parts = [city, state, country].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

export function reverseGeocodeCityStateCountry(maps, { lat, lng }) {
  return new Promise((resolve) => {
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const components = status === 'OK' ? results?.[0]?.address_components || [] : [];
      const formatted = formatCityStateCountry(components);

      resolve(formatted || results?.[0]?.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  });
}
