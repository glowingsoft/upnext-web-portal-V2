import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { ACCENT, ACCENT_DARK } from './portfolio-utils';

export function PortfolioMediaTile({ display, name }) {
  const kind = display?.kind;

  if (display?.imageUrl) {
    return (
      <>
        <Box
          component="img"
          src={display.imageUrl}
          alt={name}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {kind === 'video' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.28)',
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.9)',
              }}
            >
              <Iconify icon="solar:play-bold" width={22} sx={{ color: ACCENT_DARK }} />
            </Box>
          </Box>
        )}
      </>
    );
  }

  if (kind === 'video' || kind === 'pdf' || kind === 'other') {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          background: `linear-gradient(135deg, ${varAlpha('183 154 115', 0.22)}, ${varAlpha('183 154 115', 0.06)})`,
        }}
      >
        <Iconify
          icon={kind === 'video' ? 'solar:videocamera-bold' : 'solar:file-text-bold'}
          width={40}
          sx={{ color: ACCENT_DARK }}
        />
        <Typography variant="caption" sx={{ color: ACCENT_DARK, fontWeight: 700, px: 2, textAlign: 'center' }} noWrap>
          {display?.name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${varAlpha('183 154 115', 0.22)}, ${varAlpha('183 154 115', 0.06)})`,
      }}
    >
      <Avatar sx={{ width: 64, height: 64, fontSize: 26, fontWeight: 700, bgcolor: ACCENT, color: '#fff' }}>
        {name?.charAt(0)?.toUpperCase() || '?'}
      </Avatar>
    </Box>
  );
}
