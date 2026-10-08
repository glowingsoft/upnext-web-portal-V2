import { useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

import { useTranslate } from 'src/locales/use-locales';
import { loadGoogleMapsPlaces } from 'src/lib/google-maps-loader';

import './rhf-address-autocomplete.css';

const TOO_BROAD_PLACE_TYPES = ['country', 'administrative_area_level_1', 'administrative_area_level_2', 'locality', 'postal_code'];

// ----------------------------------------------------------------------
// Google Places Autocomplete bound to an RHF text field. Typing shows real address
// suggestions; picking one updates the field's text and reports the real
// { address, lat, lng } to the parent via onPlaceSelected, so the parent can save real
// coordinates instead of a [0, 0] placeholder.
//
// Validation: free-typed text that was never matched to a real place is rejected on
// blur — but only when the text differs from whatever value the field started with, so
// re-saving a form with an already-stored address (set before this field existed, or
// simply untouched) doesn't suddenly get blocked.

export function RHFAddressAutocomplete({ name, helperText, onPlaceSelected, ...other }) {
  const { t } = useTranslate();
  const { control, setValue, setError, clearErrors } = useFormContext();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const trustedValueRef = useRef(undefined);

  useEffect(() => {
    let placeChangedListener;

    loadGoogleMapsPlaces()
      .then((maps) => {
        if (!inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name', 'types'],
        });

        placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          const location = place?.geometry?.location;
          if (!location) return;

          if ((place.types || []).some((type) => TOO_BROAD_PLACE_TYPES.includes(type))) {
            setError(name, { type: 'manual', message: t('pleaseSelectValidAddress') });
            return;
          }

          const isNamedPlace =
            place.name && (place.types || []).includes('establishment') && !(place.formatted_address || '').includes(place.name);
          const address = [isNamedPlace ? place.name : '', place.formatted_address || inputRef.current.value].filter(Boolean).join(', ');
          trustedValueRef.current = address;
          setValue(name, address, { shouldValidate: true, shouldDirty: true });
          clearErrors(name);
          onPlaceSelected?.({ address, lat: location.lat(), lng: location.lng() });
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      placeChangedListener?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Seed the trusted value once, from whatever the field started with (an
        // already-saved address counts as trusted — only new edits need a fresh pick).
        if (trustedValueRef.current === undefined) {
          trustedValueRef.current = field.value || '';
        }

        return (
          <TextField
            {...field}
            inputRef={(node) => {
              inputRef.current = node;
            }}
            fullWidth
            error={!!error}
            helperText={error?.message ?? helperText}
            inputProps={{ autoComplete: 'off' }}
            {...other}
            onBlur={(event) => {
              field.onBlur();
              if (field.value && field.value !== trustedValueRef.current) {
                setError(name, { type: 'manual', message: t('pleaseSelectValidAddress') });
              }
              other.onBlur?.(event);
            }}
          />
        );
      }}
    />
  );
}
