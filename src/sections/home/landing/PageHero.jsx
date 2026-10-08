import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { brand } from './theme';

export default function PageHero({ eyebrow, title, subtitle }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        px: { xs: 3, sm: 5, md: 6 },
        py: { xs: 6, md: 9 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(145deg, ${brand.green[100]} 0%, ${brand.green[50]} 55%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          top: -220,
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(brand.green[200], 0.45)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', maxWidth: 720, mx: 'auto' }}>
        {eyebrow && (
          <Typography
            sx={{
              mb: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: brand.green[400],
            }}
          >
            {eyebrow}
          </Typography>
        )}

        <Typography
          component="h1"
          variant="h1"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'text.primary',
            fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem', lg: '3.5rem' },
          }}
        >
          {title}
        </Typography>

        <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, mt: { xs: 2, md: 2.5 } }}>
          <Box sx={{ width: 48, height: '1px', bgcolor: alpha(brand.green[400], 0.6) }} />
          <Box sx={{ width: 6, height: 6, transform: 'rotate(45deg)', bgcolor: brand.green[400] }} />
          <Box sx={{ width: 48, height: '1px', bgcolor: alpha(brand.green[400], 0.6) }} />
        </Box>

        {subtitle && (
          <Typography
            sx={{ mt: { xs: 2, md: 2.5 }, color: 'text.secondary', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.125rem' } }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
