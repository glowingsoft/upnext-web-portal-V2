import { Box, Typography } from '@mui/material';

import { brand } from './theme';

export default function BrandLogo({ sx, textSx, onClick, component, to, href, ...props }) {
  return (
    <Typography
      component={component || 'span'}
      to={to}
      href={href}
      onClick={onClick}
      sx={{
        fontWeight: 800,
        fontSize: '1.2rem',
        letterSpacing: '-0.02em',
        textDecoration: 'none',
        color: 'inherit',
        cursor: onClick || to || href ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      Up
      <Box component="span" sx={{ color: brand.green[400], ...textSx }}>
        Next
      </Box>
    </Typography>
  );
}
