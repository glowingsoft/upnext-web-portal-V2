import { useEffect, useRef, useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useLiveLocation } from 'src/hooks/use-live-location';
import { usePlacesAutocomplete } from 'src/hooks/use-places-autocomplete';
import { loadGoogleMapsPlaces } from 'src/lib/google-maps-loader';
import { useTranslate } from 'src/locales/use-locales';
import { reverseGeocode } from 'src/utils/reverse-geocode';

import 'src/components/hook-form/rhf-address-autocomplete.css';

// Address filter for the services/packages marketplace. Two ways to set it: search + pick a
// real address (Places Autocomplete), or "use my current location" (live browser geolocation,
// reverse-geocoded to a readable address). Either way reports { address, lat, lng } up via
// onPlaceSelected — this component never touches sessionStorage's `myLocation` itself; that's
// only ever set from the login response.
export function AddressFilterField({
  value,
  onPlaceSelected,
  sx,
  hideLabel = false,
  loading = false,
  reverseGeocodeFormatter = reverseGeocode,
  placeTypes = ['address'],
  formatAddress,
}) {
  const { t } = useTranslate();
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');
  const { isLocating, requestLocation } = useLiveLocation();
  const showSpinner = isLocating || loading;

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  usePlacesAutocomplete({
    inputRef,
    types: placeTypes,
    formatAddress,
    onPlaceSelected: ({ address, lat, lng }) => {
      setInputValue(address);
      onPlaceSelected({ address, lat, lng });
    },
  });

  const handleUseCurrentLocation = async () => {
    try {
      const { lat, lng } = await requestLocation();
      const maps = await loadGoogleMapsPlaces();
      const address = await reverseGeocodeFormatter(maps, { lat, lng });
      setInputValue(address);
      onPlaceSelected({ address, lat, lng });
    } catch (error) {
      toast.error(t('locationPermissionDenied'));
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      value={inputValue}
      onChange={(event) => setInputValue(event.target.value)}
      label={hideLabel ? undefined : t('address')}
      placeholder={t('searchAddressPlaceholder')}
      fullWidth
      size="small"
      inputProps={{ autoComplete: 'off' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="solar:map-point-bold" width={18} sx={{ color: 'primary.main' }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={t('useMyCurrentLocation')}>
              <span>
                <IconButton size="small" onClick={handleUseCurrentLocation} disabled={showSpinner}>
                  {showSpinner ? <CircularProgress size={16} /> : <Iconify icon="solar:gps-bold" width={18} />}
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  );
}
