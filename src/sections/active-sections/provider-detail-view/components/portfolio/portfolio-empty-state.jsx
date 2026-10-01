import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { ACCENT, ACCENT_SOFT } from './portfolio-utils';

export function PortfolioEmptyState() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center', px: 3 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: ACCENT_SOFT,
        }}
      >
        <Iconify icon="solar:gallery-wide-bold-duotone" width={30} sx={{ color: ACCENT }} />
      </Box>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        No portfolio items yet
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 340, mx: 'auto' }}>
        Portfolio items will appear here once added.
      </Typography>
    </Box>
  );
}
