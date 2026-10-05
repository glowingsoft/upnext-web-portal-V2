import { memo } from 'react';

import { Box, InputBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

const AiSearchBar = memo(function AiSearchBar({ value, onChange, onClear, onSubmit, isDirty, placeholder }) {
  const canSubmit = Boolean(value?.trim()) && isDirty;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit?.();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        height: 60,
        px: 2,
        borderRadius: 99,
        bgcolor: '#fff',
        border: `1.5px solid ${value ? brand.green[400] : 'rgba(145,158,171,0.2)'}`,
        boxShadow: value ? `0 6px 20px ${alpha(brand.green[400], 0.2)}` : '0 4px 16px rgba(20,26,33,0.05)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:focus-within': {
          borderColor: brand.green[400],
          boxShadow: `0 6px 22px ${alpha(brand.green[400], 0.24)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${brand.green[400]}, ${brand.green[600]})`,
        }}
      >
        <Iconify icon="mingcute:ai-fill" width={20} sx={{ color: '#fff' }} />
      </Box>

      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          flex: 1,
          fontSize: '0.95rem',
          fontWeight: 500,
          '& input': { p: 0 },
          '& input::placeholder': { color: 'text.disabled', fontWeight: 400, opacity: 1 },
        }}
      />

      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          px: 1.25,
          py: 0.4,
          borderRadius: 99,
          flexShrink: 0,
          bgcolor: alpha(brand.green[400], 0.1),
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: brand.green[600], fontSize: '0.7rem', letterSpacing: 0.3 }}>
          AI SEARCH
        </Typography>
      </Box>

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
        <Iconify icon="mingcute:close-line" width={16} />
      </Box>

      <Box
        component="button"
        type="submit"
        disabled={!canSubmit}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          height: 40,
          px: 2,
          flexShrink: 0,
          border: 'none',
          borderRadius: 99,
          cursor: canSubmit ? 'pointer' : 'default',
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: 'inherit',
          background: `linear-gradient(135deg, ${brand.green[400]}, ${brand.green[600]})`,
          opacity: canSubmit ? 1 : 0.45,
          transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
          '&:hover': canSubmit ? { boxShadow: `0 4px 12px ${alpha(brand.green[600], 0.3)}` } : {},
        }}
      >
        <Iconify icon="mingcute:search-line" width={16} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Search
        </Box>
      </Box>
    </Box>
  );
});

export default AiSearchBar;
