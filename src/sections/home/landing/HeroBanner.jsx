import { Box, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import heroImage from 'src/assets/images/home.webp';

import { brand } from './theme';
import { scrollToId } from './Nav';

const TRUST_POINTS = [
  { icon: 'solar:shield-check-bold', title: 'Verified providers', caption: 'Licensed and reviewed' },
  { icon: 'solar:calendar-mark-bold', title: 'Instant booking', caption: 'Real-time availability' },
  { icon: 'solar:card-bold', title: 'Secure payments', caption: 'Pay safely online' },
];

export default function HeroBanner({ onJoinAsProvider }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
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
          top: -160,
          left: -120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(brand.green[200], 0.45)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          alignItems: 'center',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
          gap: { xs: 4, md: 6, lg: 8 },
          px: { xs: 3, sm: 5, md: 6, lg: 8 },
          py: { xs: 5, sm: 6, md: 8, lg: 10 },
        }}
      >
        <Box>
          <Chip
            icon={<Iconify icon="solar:star-bold" width={14} sx={{ color: brand.green[600] }} />}
            label="Top-Rated Providers Near You"
            size="small"
            sx={{
              mb: { xs: 2.5, md: 3 },
              height: 30,
              px: 0.5,
              backgroundColor: alpha(brand.green[400], 0.12),
              color: brand.green[600],
              border: `1px solid ${alpha(brand.green[400], 0.3)}`,
              pointerEvents: 'none',
              '& .MuiChip-label': { px: 1, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
              '& .MuiChip-icon': { ml: 0.75, mr: -0.25 },
            }}
          />

          <Typography
            component="h1"
            variant="h1"
            sx={{
              mb: { xs: 2, md: 2.5 },
              fontWeight: 800,
              lineHeight: 1.08,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.375rem', sm: '3.25rem', md: '3.25rem', lg: '4.25rem' },
            }}
          >
            Book Top Providers{' '}
            <Box component="span" sx={{ display: 'block', fontStyle: 'italic', color: brand.green[600] }}>
              Near You
            </Box>
          </Typography>

          <Typography
            sx={{
              mb: { xs: 3.5, md: 4.5 },
              maxWidth: 500,
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            Find and book the best beauty and hair professionals easily, anytime.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              component="button"
              type="button"
              onClick={() => scrollToId('available-now')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                gap: 1,
                px: 3.5,
                py: 1.6,
                border: 'none',
                borderRadius: 99,
                backgroundColor: brand.green[400],
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 8px 20px ${alpha(brand.green[400], 0.35)}`,
                transition: 'background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                '&:hover': {
                  backgroundColor: brand.green[600],
                  transform: 'translateY(-1px)',
                  boxShadow: `0 10px 24px ${alpha(brand.green[600], 0.35)}`,
                },
              }}
            >
              Find Providers
              <Iconify icon="mingcute:arrow-right-line" width={18} />
            </Box>

            <Box
              component="button"
              type="button"
              onClick={onJoinAsProvider}
              sx={{
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                px: 3.25,
                py: 1.6,
                borderRadius: 99,
                border: `1.5px solid ${alpha(brand.green[400], 0.45)}`,
                backgroundColor: alpha('#fff', 0.6),
                color: brand.green[800],
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 0.18s ease, border-color 0.18s ease',
                '&:hover': { borderColor: brand.green[400], backgroundColor: '#fff' },
              }}
            >
              Join as a Professional
            </Box>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => scrollToId('how-it-works')}
            sx={{
              mt: 2.5,
              p: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              border: 'none',
              background: 'transparent',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              '&:hover': { color: brand.green[600] },
            }}
          >
            <Iconify icon="solar:play-circle-bold" width={20} sx={{ color: brand.green[400] }} />
            See how it works
          </Box>

          <Box
            sx={{
              mt: { xs: 4, md: 6 },
              pt: { xs: 3, md: 3.5 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: { xs: 2, sm: 2.5 },
              borderTop: `1px solid ${alpha(brand.green[400], 0.22)}`,
            }}
          >
            {TRUST_POINTS.map((point) => (
              <Box key={point.title} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(brand.green[400], 0.14),
                    color: brand.green[600],
                  }}
                >
                  <Iconify icon={point.icon} width={20} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.3 }}>{point.title}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.4 }}>{point.caption}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', pb: { xs: 3, md: 0 } }}>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: { xs: '14px -10px -2px 14px', md: '22px -18px -22px 22px' },
              borderRadius: { xs: 4, md: 6 },
              border: `1.5px solid ${alpha(brand.green[400], 0.35)}`,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: { xs: 4, md: 6 },
              aspectRatio: { xs: '16 / 10', md: '4 / 3.6' },
              boxShadow: `0 30px 60px -20px ${alpha(brand.green[800], 0.4)}`,
            }}
          >
            <Box
              component="img"
              src={heroImage}
              width={1280}
              height={896}
              fetchpriority="high"
              decoding="async"
              alt="Elegant salon interior with styling stations"
              sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: { xs: 12, md: -28 },
              bottom: { xs: 0, md: 36 },
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pl: 1.25,
              pr: 2.5,
              py: 1.25,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(brand.green[400], 0.18)}`,
              boxShadow: `0 16px 32px -12px ${alpha(brand.green[800], 0.35)}`,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: `linear-gradient(135deg, ${brand.green[400]}, ${brand.green[600]})`,
              }}
            >
              <Iconify icon="solar:verified-check-bold" width={24} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>Licensed professionals</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.4 }}>Book with confidence</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
