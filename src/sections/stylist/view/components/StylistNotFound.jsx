import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

// ----------------------------------------------------------------------

export default function StylistNotFound({ onBackToSearch }) {
  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <SurfaceCard sx={{ py: 7, px: 4, textAlign: 'center', maxWidth: 420 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: alpha(brand.green[400], 0.1),
            border: `1.5px solid ${alpha(brand.green[400], 0.25)}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <Iconify icon="mingcute:user-search-line" width={28} sx={{ color: brand.green[600] }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Stylist not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          This profile may have been removed, or the link you followed is incorrect.
        </Typography>

        <Box
          component="button"
          type="button"
          onClick={onBackToSearch}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 3,
            py: 1.1,
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: brand.green[400],
            color: '#fff',
            boxShadow: `0 4px 12px ${alpha(brand.green[400], 0.3)}`,
            transition: 'background-color 0.18s ease',
            '&:hover': { bgcolor: brand.green[600] },
          }}
        >
          <Iconify icon="mingcute:arrow-left-line" width={16} />
          Back to search
        </Box>
      </SurfaceCard>
    </Box>
  );
}
