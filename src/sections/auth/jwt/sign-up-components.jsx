import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

/**
 * Grid wrapper for two-column layouts.
 */
export function TwoColGrid({ children, sx }) {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={3} sx={sx}>
      {children}
    </Box>
  );
}
