import { Box, Chip, Grid, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import heroImage from 'src/assets/images/home.png';

import { brand } from './theme';
import { scrollToId } from './Nav';

export default function HeroBanner() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container sx={{ minHeight: { xs: 'auto', md: 420 } }}>
        {/* Left — text content */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              p: { xs: 4, sm: 5, md: 6 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              background: `linear-gradient(145deg, #F3EADC 0%, #FDFBF7 60%, ${theme.palette.background.paper} 100%)`,
            }}
          >
            <Chip
              icon={<Iconify icon="solar:magic-stick-3-bold" width={13} sx={{ color: brand.green[600] }} />}
              label="Top-Rated Stylists Near You"
              size="small"
              sx={{
                mb: 1.5,
                width: 'fit-content',
                height: 26,
                px: 0.25,
                backgroundColor: alpha(brand.green[400], 0.12),
                color: brand.green[600],
                border: `1px solid ${alpha(brand.green[400], 0.3)}`,
                cursor: 'default',
                pointerEvents: 'none',
                '&:hover': { backgroundColor: alpha(brand.green[400], 0.12) },
                '& .MuiChip-label': { px: 0.75, fontWeight: 800, fontSize: '0.72rem' },
                '& .MuiChip-icon': { ml: 0.75, mr: -0.25 },
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                color: theme.palette.text.primary,
                lineHeight: 1.08,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '2.6rem', lg: '3.2rem' },
                maxWidth: { xs: 340, sm: 480, md: 460, lg: 'none' },
              }}
            >
              Book Top Stylists{' '}
              <Box component="span" sx={{ color: brand.green[600] }}>
                Near You
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: 420,
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              Find and book the best beauty and hair professionals easily, anytime.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box
                component="button"
                type="button"
                onClick={() => scrollToId('available-now')}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 3.25,
                  py: 1.25,
                  border: 'none',
                  borderRadius: 50,
                  backgroundColor: brand.green[400],
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: `0 4px 14px ${alpha(brand.green[400], 0.35)}`,
                  '&:hover': { backgroundColor: brand.green[600] },
                }}
              >
                Find Stylists
                <Iconify icon="mingcute:arrow-right-line" width={16} />
              </Box>

              <Box
                component="button"
                type="button"
                onClick={() => scrollToId('how-it-works')}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 50,
                  border: `1.5px solid ${alpha(brand.green[400], 0.4)}`,
                  backgroundColor: 'transparent',
                  color: brand.green[600],
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  '&:hover': {
                    borderColor: brand.green[400],
                    backgroundColor: alpha(brand.green[400], 0.06),
                  },
                }}
              >
                How it Works
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right — image */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              minHeight: { xs: 180, md: '100%' },
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={heroImage}
              alt="Salon professional at work"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                minHeight: { xs: 220, md: 420 },
              }}
            />
            {/* Subtle left-edge fade to blend with content */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to right, ${alpha('#FDFBF7', 0.35)} 0%, transparent 30%)`,
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
