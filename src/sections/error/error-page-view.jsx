import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { LandingLayout } from 'src/layouts/landing';

import { brand } from 'src/sections/home/landing/theme';

// ----------------------------------------------------------------------

const buttonSx = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 48,
  px: 3.5,
  borderRadius: 99,
  fontWeight: 700,
  fontSize: '0.9rem',
  textDecoration: 'none',
  transition: 'background-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease',
};

function MirrorZero() {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 150"
      sx={{
        width: '0.66em',
        height: '0.82em',
        mx: '0.05em',
        mb: '0.1em',
        overflow: 'visible',
        '@keyframes mirrorFloat': {
          '0%, 100%': { transform: 'translateY(0) rotate(-8deg)' },
          '50%': { transform: 'translateY(-6px) rotate(-4deg)' },
        },
        '@keyframes mirrorSparkle': {
          '0%, 100%': { opacity: 0.25, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
        '& .mirror': { transformOrigin: '60px 60px', animation: 'mirrorFloat 5s ease-in-out infinite' },
        '& .sparkle': { transformBox: 'fill-box', transformOrigin: 'center', animation: 'mirrorSparkle 2.4s ease-in-out infinite' },
        '& .sparkle:nth-of-type(2)': { animationDelay: '0.8s' },
        '& .sparkle:nth-of-type(3)': { animationDelay: '1.6s' },
      }}
    >
      <defs>
        <linearGradient id="mirrorFrame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={brand.green[200]} />
          <stop offset="1" stopColor={brand.green[600]} />
        </linearGradient>
        <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={brand.green[100]} />
        </linearGradient>
      </defs>

      <g className="mirror">
        <rect x="52" y="98" width="16" height="50" rx="8" fill="url(#mirrorFrame)" />
        <rect x="48" y="92" width="24" height="12" rx="6" fill={brand.green[600]} />
        <circle cx="60" cy="54" r="48" fill="url(#mirrorFrame)" />
        <circle cx="60" cy="54" r="38" fill="url(#mirrorGlass)" />
        <path d="M36 44a28 28 0 0 1 22-18" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <path d="M70 80a28 28 0 0 0 14-14" fill="none" stroke={brand.green[200]} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </g>

      <g fill={brand.green[400]}>
        <path className="sparkle" d="M112 6l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path className="sparkle" d="M4 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        <path className="sparkle" d="M108 112l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
      </g>
    </Box>
  );
}

export function ErrorPageView({ code, title, description, secondaryAction, illustrated }) {
  return (
    <LandingLayout>
      <Box
        sx={{
          pt: { xs: '64px', md: '66px' },
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: `linear-gradient(145deg, ${brand.green[100]} 0%, ${brand.green[50]} 55%, #fff 100%)`,
        }}
      >
        <Box sx={{ maxWidth: 560, px: 3, py: { xs: 8, md: 10 } }}>
          <Typography
            component="div"
            variant="h1"
            aria-hidden
            sx={{
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: 'lining-nums',
              color: alpha(brand.green[400], illustrated ? 0.75 : 0.5),
              fontSize: { xs: '5.5rem', sm: '7rem', md: '8.5rem', lg: '8.5rem' },
              ...(illustrated && { display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center' }),
            }}
          >
            {illustrated
              ? String(code)
                  .split('')
                  .map((char, index) => (char === '0' ? <MirrorZero key={index} /> : <span key={index}>{char}</span>))
              : code}
          </Typography>

          <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, my: 3 }}>
            <Box sx={{ width: 48, height: '1px', bgcolor: alpha(brand.green[400], 0.6) }} />
            <Box sx={{ width: 6, height: 6, transform: 'rotate(45deg)', bgcolor: brand.green[400] }} />
            <Box sx={{ width: 48, height: '1px', bgcolor: alpha(brand.green[400], 0.6) }} />
          </Box>

          <Typography
            component="h1"
            variant="h2"
            sx={{ mb: 2, fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.4rem', lg: '2.4rem' } }}
          >
            {title}
          </Typography>

          <Typography sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            {description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
            <Box
              component={RouterLink}
              href="/"
              sx={{
                ...buttonSx,
                color: '#fff',
                bgcolor: brand.green[400],
                '&:hover': { bgcolor: brand.green[600], boxShadow: `0 10px 24px ${alpha(brand.green[600], 0.35)}` },
              }}
            >
              Back to home
            </Box>

            {secondaryAction && (
              <Box
                component={RouterLink}
                href={secondaryAction.href}
                sx={{
                  ...buttonSx,
                  color: brand.green[600],
                  border: `1.5px solid ${alpha(brand.green[400], 0.5)}`,
                  '&:hover': { color: brand.green[800], bgcolor: alpha(brand.green[400], 0.08) },
                }}
              >
                {secondaryAction.label}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </LandingLayout>
  );
}
