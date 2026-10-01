import { useEffect, useRef } from 'react';

import { loadGoogleMapsPlaces } from 'src/lib/google-maps-loader';

export function usePlacesAutocomplete({ inputRef, onPlaceSelected, disabled = false, types = ['address'], formatAddress }) {
  const autocompleteRef = useRef(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  onPlaceSelectedRef.current = onPlaceSelected;
  const formatAddressRef = useRef(formatAddress);
  formatAddressRef.current = formatAddress;

  useEffect(() => {
    if (disabled) return undefined;

    let placeChangedListener;
    let removeWidthSync = () => {};

    loadGoogleMapsPlaces()
      .then((maps) => {
        if (!inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new maps.places.Autocomplete(inputRef.current, {
          fields: formatAddressRef.current ? ['formatted_address', 'geometry', 'address_components'] : ['formatted_address', 'geometry'],
          types,
        });

        placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          const location = place?.geometry?.location;
          if (!location) return;

          const address = formatAddressRef.current?.(place.address_components) || place.formatted_address || inputRef.current.value;

          onPlaceSelectedRef.current?.({
            address,
            lat: location.lat(),
            lng: location.lng(),
          });
        });

        const input = inputRef.current;
        let widthObserver = null;

        const getFieldRect = () => {
          const field = input.closest('.MuiOutlinedInput-root') || input.closest('.MuiInputBase-root') || input.parentElement || input;
          return field.getBoundingClientRect();
        };

        const applyWidth = () => {
          const container = document.querySelector('.pac-container');
          if (!container) return;
          const rect = getFieldRect();
          const isFixed = window.getComputedStyle(container).position === 'fixed';
          const targetWidth = `${rect.width}px`;
          const targetLeft = `${rect.left + (isFixed ? 0 : window.scrollX)}px`;
          if (container.style.width !== targetWidth) {
            container.style.width = targetWidth;
            container.style.minWidth = targetWidth;
          }
          if (container.style.left !== targetLeft) {
            container.style.left = targetLeft;
          }
        };

        const startObserving = () => {
          applyWidth();
          const container = document.querySelector('.pac-container');
          if (!container || widthObserver) return;
          widthObserver = new MutationObserver(applyWidth);
          widthObserver.observe(container, { attributes: true, attributeFilter: ['style'] });
        };

        const handleInput = () => {
          applyWidth();
          startObserving();
        };
        const handleBlur = () => {
          widthObserver?.disconnect();
          widthObserver = null;
        };

        input.addEventListener('focus', startObserving);
        input.addEventListener('input', handleInput);
        input.addEventListener('blur', handleBlur);

        removeWidthSync = () => {
          widthObserver?.disconnect();
          input.removeEventListener('focus', startObserving);
          input.removeEventListener('input', handleInput);
          input.removeEventListener('blur', handleBlur);
        };
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      placeChangedListener?.remove();
      removeWidthSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
}
