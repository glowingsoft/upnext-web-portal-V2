import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { brand } from './theme';

export default function SectionHeader({ eyebrow, title, subtitle, sx }) {
  return (
    <Box sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: { xs: 4, md: 6 }, ...sx }}>
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
        component="h2"
        variant="h2"
        sx={{
          fontWeight: 700,
          lineHeight: 1.15,
          color: 'text.primary',
          fontSize: { xs: '2rem', sm: '2.4rem', md: '2.9rem' },
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
        <Typography sx={{ mt: { xs: 2, md: 2.5 }, color: 'text.secondary', lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
