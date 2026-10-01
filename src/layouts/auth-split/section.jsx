import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

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
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
      <div>
        <Typography variant="h3" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>

        {subtitle && <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>{subtitle}</Typography>}
      </div>

      <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{
          width: 1,
          objectFit: 'cover',
          ml: { md: 1.5, lg: 3 },
          mb: { md: 1.5, lg: 2 },
        }}
      />
    </Box>
  );
}
