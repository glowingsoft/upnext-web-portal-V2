import { Box, Grid, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import SurfaceCard from './SurfaceCard';
import { HOW_IT_WORKS, WHY_UPNEXT } from './data';
import { brand } from './theme';

export default function HowItWorksSection() {
  const theme = useTheme();

  return (
    <Box id="how-it-works" sx={{ mt: 4, mb: 3, scrollMarginTop: '92px', px: { xs: 2, md: 3 } }}>
      <Grid container spacing={2} alignItems="stretch">

        {/* Left — How It Works */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: brand.green[600], flexShrink: 0 }}>
            How It Works
          </Typography>
          <Grid container spacing={2} alignItems="stretch" sx={{ flex: 1, alignContent: 'space-between' }}>
            {HOW_IT_WORKS.map((item) => (
              <Grid key={item.title} item xs={12} sm={4} sx={{ display: 'flex' }}>
                <SurfaceCard
                  sx={{
                    p: 2.5,
                    flex: 1,
                    minHeight: 180,
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: (t) => `0 10px 26px ${alpha(brand.green[400], 0.14)}`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(brand.green[400], 0.12),
                      }}
                    >
                      <Iconify icon={item.icon} width={20} sx={{ color: brand.green[600] }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </SurfaceCard>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right — Why Choose UpNext */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: brand.green[600], flexShrink: 0 }}>
            Why Choose UpNext?
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
            {WHY_UPNEXT.map((item) => (
              <SurfaceCard
                key={item.title}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  borderLeft: `3px solid ${brand.green[400]}`,
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  '&:hover': {
                    transform: 'translateX(3px)',
                    boxShadow: `0 4px 16px ${alpha(brand.green[400], 0.12)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(brand.green[400], 0.1),
                    mt: 0.25,
                  }}
                >
                  <Iconify icon={item.icon} width={18} sx={{ color: brand.green[600] }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.text}
                  </Typography>
                </Box>
              </SurfaceCard>
            ))}
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}
