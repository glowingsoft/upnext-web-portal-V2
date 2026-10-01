import { memo } from 'react';

import { Box, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

// ----------------------------------------------------------------------

const SearchBox = memo(function SearchBox({ icon, placeholder, value, onChange, onClear, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        height: 40,
        px: 1.5,
        borderRadius: 50,
        border: `1.5px solid ${value ? brand.green[400] : 'rgba(145,158,171,0.24)'}`,
        bgcolor: value ? alpha(brand.green[400], 0.08) : '#fff',
        transition: 'background-color 0.18s ease, border-color 0.18s ease',
        minWidth: 160,
        flexShrink: 0,
        '&:focus-within': { borderColor: brand.green[400] },
        ...sx,
      }}
    >
      <Iconify icon={icon} width={15} sx={{ color: value ? brand.green[600] : 'text.secondary', flexShrink: 0 }} />
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          flex: 1,
          fontSize: '0.825rem',
          color: value ? brand.green[700] : 'text.primary',
          '& input': { p: 0 },
          '& input::placeholder': { color: 'text.disabled', fontWeight: 400, opacity: 1 },
        }}
      />
      <Box
        component="button"
        type="button"
        onClick={onClear}
        sx={{
          display: 'inline-flex',
          border: 'none',
          background: 'transparent',
          cursor: value ? 'pointer' : 'default',
          p: 0,
          color: 'text.disabled',
          opacity: value ? 1 : 0,
          pointerEvents: value ? 'auto' : 'none',
          transition: 'opacity 0.15s ease',
          flexShrink: 0,
          '&:hover': { color: 'text.secondary' },
        }}
      >
        <Iconify icon="mingcute:close-line" width={13} />
      </Box>
    </Box>
  );
});

export default SearchBox;
