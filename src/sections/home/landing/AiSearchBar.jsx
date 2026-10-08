import { memo } from 'react';

import { Box, InputBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

const AiSearchBar = memo(function AiSearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  isDirty,
  placeholder,
  image,
  imagePreview,
  onOpenImageSearch,
  isSearching,
}) {
  const hasImage = Boolean(image);
  const hasValue = hasImage || Boolean(value);
  const canSubmit = (hasImage || Boolean(value?.trim())) && isDirty && !isSearching;

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
        border: `1.5px solid ${hasValue ? brand.green[400] : 'rgba(145,158,171,0.2)'}`,
        boxShadow: hasValue ? `0 6px 20px ${alpha(brand.green[400], 0.2)}` : '0 4px 16px rgba(20,26,33,0.05)',
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

      {hasImage ? (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            component="img"
            src={imagePreview}
            alt=""
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.5,
              objectFit: 'cover',
              border: `1px solid ${alpha(brand.green[400], 0.35)}`,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>
              {typeof image === 'string' ? 'Photo link' : image.name}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
              {isSearching ? 'Looking for matches…' : 'Search by this photo'}
            </Typography>
          </Box>
        </Box>
      ) : (
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
      )}

      <Box
        component="button"
        type="button"
        onClick={onClear}
        sx={{
          display: 'inline-flex',
          border: 'none',
          background: 'transparent',
          cursor: hasValue ? 'pointer' : 'default',
          p: 0,
          color: 'text.disabled',
          opacity: hasValue ? 1 : 0,
          pointerEvents: hasValue ? 'auto' : 'none',
          transition: 'opacity 0.15s ease',
          flexShrink: 0,
          '&:hover': { color: 'text.secondary' },
        }}
      >
        <Iconify icon="mingcute:close-line" width={16} />
      </Box>

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
        aria-label="Search by photo"
        title="Search by photo"
        onClick={onOpenImageSearch}
        sx={{
          width: 40,
          height: 40,
          p: 0,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          color: brand.green[600],
          bgcolor: hasImage ? alpha(brand.green[400], 0.12) : 'transparent',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: alpha(brand.green[400], 0.12) },
        }}
      >
        <Box component="svg" aria-hidden focusable="false" viewBox="0 -960 960 960" sx={{ width: 24, height: 24 }}>
          <path
            fill="currentColor"
            d="M480-320q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm240 160q-33 0-56.5-23.5T640-240q0-33 23.5-56.5T720-320q33 0 56.5 23.5T800-240q0 33-23.5 56.5T720-160Zm-440 40q-66 0-113-47t-47-113v-80h80v80q0 33 23.5 56.5T280-200h200v80H280Zm480-320v-160q0-33-23.5-56.5T680-680H280q-33 0-56.5 23.5T200-600v120h-80v-120q0-66 47-113t113-47h80l40-80h160l40 80h80q66 0 113 47t47 113v160h-80Z"
          />
        </Box>
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
