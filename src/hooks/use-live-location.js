import { useCallback, useState } from 'react';

export function useLiveLocation() {
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(
    (options = {}) =>
      new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser.'));
          return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsLocating(false);
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            setIsLocating(false);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
        );
      }),
    []
  );

  return { isLocating, requestLocation };
}
