import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { Logo } from 'src/components/logo';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { brand } from 'src/sections/home/landing/theme';

// ----------------------------------------------------------------------

export function Section({
  sx,
  method,
  layoutQuery,
  methods,
  title = 'UpNext',
  imgUrl = `${CONFIG.site.basePath}/assets/background/background-1.png`,
  subtitle = 'Discover trusted professionals near you in seconds.',
  ...other
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.92)}, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.92)}`,
          imgUrl: `${CONFIG.site.basePath}/assets/background/background-1-blur.webp`,
        }),
        px: 3,
        pb: 3,
        pl: 10,
        width: 1,
        maxWidth: 680,
        display: 'none',
        position: 'relative',
        pt: 'var(--layout-header-desktop-height)',
        [theme.breakpoints.up(layoutQuery)]: {
          gap: 2,
          top: 0,
          height: '100vh',
          display: 'flex',
          flexShrink: 0,
          position: 'sticky',
          overflow: 'hidden',
          alignSelf: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
      <div>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Logo width="auto" height={72} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            fontSize: { md: '2.4rem', lg: '2.75rem' },
          }}
        >
          {title}
        </Typography>

        <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, mt: 2 }}>
          <Box sx={{ width: 48, height: '1px', bgcolor: varAlpha('171 145 111', 0.6) }} />
          <Box sx={{ width: 6, height: 6, transform: 'rotate(45deg)', bgcolor: brand.green[400] }} />
          <Box sx={{ width: 48, height: '1px', bgcolor: varAlpha('171 145 111', 0.6) }} />
        </Box>

        {subtitle && <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 2, lineHeight: 1.8 }}>{subtitle}</Typography>}
      </div>

      <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{
          width: 1,
          maxHeight: '48vh',
          objectFit: 'contain',
          ml: { md: 1.5, lg: 3 },
          mb: { md: 1.5, lg: 2 },
        }}
      />
    </Box>
  );
}
