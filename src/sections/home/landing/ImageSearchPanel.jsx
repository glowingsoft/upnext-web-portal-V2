import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Box, Collapse, IconButton, InputBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

const isLink = (text) => /^https?:\/\/\S+$/i.test(text.trim());

export default function ImageSearchPanel({ open, onClose, onFile, onLink }) {
  const [link, setLink] = useState('');
  const canSearchLink = isLink(link);

  useEffect(() => {
    if (open) setLink('');
  }, [open]);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) onFile?.(acceptedFiles[0]);
    },
  });

  const handleLinkSubmit = (event) => {
    event.preventDefault();
    if (canSearchLink) onLink?.(link.trim());
  };

  return (
    <Collapse in={open} unmountOnExit>
      <Box
        sx={{
          mt: 1.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 4,
          bgcolor: '#fff',
          border: `1px solid ${alpha(brand.green[400], 0.2)}`,
          boxShadow: '0 4px 16px rgba(20,26,33,0.05)',
        }}
      >
        <Box sx={{ position: 'relative', mb: 2, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Search with a photo</Typography>
          <IconButton onClick={onClose} aria-label="Close" size="small" sx={{ position: 'absolute', right: -4, top: -6 }}>
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <Box
          {...getRootProps()}
          sx={{
            borderRadius: 3,
            p: { xs: 2, sm: 2.5 },
            border: `1.5px dashed ${isDragActive ? brand.green[600] : alpha(brand.green[400], 0.55)}`,
            bgcolor: isDragActive ? alpha(brand.green[400], 0.12) : brand.green[50],
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
          }}
        >
          <input {...getInputProps()} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              py: { xs: 3, sm: 4 },
              textAlign: 'center',
            }}
          >
            <Iconify icon="solar:gallery-add-bold-duotone" width={40} sx={{ color: brand.green[400] }} />
            <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
              Drag a photo here or{' '}
              <Box
                component="button"
                type="button"
                onClick={openFilePicker}
                sx={{
                  p: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontWeight: 700,
                  color: brand.green[600],
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  '&:hover': { color: brand.green[800] },
                }}
              >
                upload a file
              </Box>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(brand.green[400], 0.3) }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'text.disabled' }}>OR</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: alpha(brand.green[400], 0.3) }} />
          </Box>

          <Box component="form" onSubmit={handleLinkSubmit} sx={{ display: 'flex', gap: 1 }}>
            <InputBase
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="Paste image link"
              sx={{
                flex: 1,
                minWidth: 0,
                height: 44,
                px: 2.5,
                borderRadius: 99,
                fontSize: '0.9rem',
                bgcolor: '#fff',
                border: '1.5px solid rgba(145,158,171,0.24)',
                transition: 'border-color 0.15s ease',
                '&:hover, &.Mui-focused': { borderColor: brand.green[400] },
                '& input': { p: 0 },
              }}
            />
            <Box
              component="button"
              type="submit"
              disabled={!canSearchLink}
              sx={{
                height: 44,
                px: 2.5,
                flexShrink: 0,
                border: 'none',
                borderRadius: 99,
                cursor: canSearchLink ? 'pointer' : 'default',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'inherit',
                background: `linear-gradient(135deg, ${brand.green[400]}, ${brand.green[600]})`,
                opacity: canSearchLink ? 1 : 0.45,
                transition: 'opacity 0.15s ease',
              }}
            >
              Search
            </Box>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}
