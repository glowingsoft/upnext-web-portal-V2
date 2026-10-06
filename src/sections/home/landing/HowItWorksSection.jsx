import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import SectionHeader from './SectionHeader';
import { HOW_IT_WORKS, WHY_UPNEXT } from './data';
import { brand } from './theme';

const SECTION_PADDING = {
  px: { xs: 2, sm: 4, md: 6, lg: 8 },
  py: { xs: 7, md: 11 },
};

export default function HowItWorksSection() {
  return (
    <>
      <Box
        id="how-it-works"
        sx={{
          ...SECTION_PADDING,
          scrollMarginTop: '92px',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <SectionHeader
          eyebrow="Simple & Seamless"
          title="How It Works"
          subtitle="From discovering your stylist to your next appointment, in six easy steps."
        />

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3.5 },
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {HOW_IT_WORKS.map((item, index) => (
            <Box
              key={item.title}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(brand.green[400], 0.2)}`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: alpha(brand.green[400], 0.5),
                  boxShadow: `0 24px 48px -24px ${alpha(brand.green[800], 0.35)}`,
                },
              }}
            >
              <Typography
                aria-hidden
                variant="h2"
                sx={{
                  position: 'absolute',
                  top: { xs: 12, md: 16 },
                  right: { xs: 18, md: 24 },
                  fontWeight: 700,
                  lineHeight: 1,
                  fontSize: { xs: '2.75rem', md: '3.5rem' },
                  color: alpha(brand.green[400], 0.18),
                  userSelect: 'none',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Typography>

              <Box
                sx={{
                  width: 52,
                  height: 52,
                  mb: { xs: 2.5, md: 3 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(brand.green[400], 0.12),
                  border: `1px solid ${alpha(brand.green[400], 0.25)}`,
                  color: brand.green[600],
                }}
              >
                <Iconify icon={item.icon} width={24} />
              </Box>

              <Typography variant="h4" sx={{ mb: 1.25, fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.4rem' } }}>
                {item.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          ...SECTION_PADDING,
          background: `linear-gradient(180deg, ${brand.green[50]} 0%, ${brand.green[100]} 100%)`,
          borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
        }}
      >
        <SectionHeader
          eyebrow="The UpNext Difference"
          title="Why Choose UpNext?"
          subtitle="Everything you need to book with confidence, all in one place."
        />

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 5 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: `repeat(${Math.min(WHY_UPNEXT.length, 4)}, minmax(0, 1fr))`,
            },
          }}
        >
          {WHY_UPNEXT.map((item) => (
            <Box key={item.title} sx={{ textAlign: 'center', px: { md: 1 } }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  mx: 'auto',
                  mb: 2.5,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: `linear-gradient(135deg, ${brand.green[400]}, ${brand.green[600]})`,
                  boxShadow: `0 14px 28px -12px ${alpha(brand.green[600], 0.6)}`,
                }}
              >
                <Iconify icon={item.icon} width={28} />
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.3rem' } }}>
                {item.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem', maxWidth: 300, mx: 'auto' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
