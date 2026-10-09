import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DashboardHero({ greeting, highlights = [], primaryAction, secondaryAction }) {
  return (
    <Box
      sx={{
        mb: 3,
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 2.5, md: 3 },
        borderRadius: 2.5,
        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
        background: (theme) =>
          `linear-gradient(120deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.14)} 0%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)} 55%, ${theme.vars.palette.background.paper} 100%)`,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: 'primary.dark', letterSpacing: 1.2 }}>
            {dayjs().format('dddd, MMMM D')}
          </Typography>

          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {greeting}
          </Typography>

          <Stack direction="row" flexWrap="wrap" sx={{ mt: 1.25, gap: 1 }}>
            {highlights.map((item) => (
              <Box
                key={item.label}
                onClick={item.onClick}
                sx={{
                  px: 1.25,
                  py: 0.6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: 99,
                  maxWidth: 1,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: item.onClick ? 'pointer' : 'default',
                  color: item.attention ? 'warning.dark' : 'text.primary',
                  bgcolor: (theme) =>
                    item.attention ? varAlpha(theme.vars.palette.warning.mainChannel, 0.16) : varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
                  border: (theme) =>
                    `1px solid ${item.attention ? varAlpha(theme.vars.palette.warning.mainChannel, 0.4) : varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
                }}
              >
                <Iconify icon={item.icon} width={16} sx={{ flexShrink: 0, color: item.attention ? 'warning.main' : 'primary.main' }} />
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
          {secondaryAction && (
            <Button variant="outlined" color="primary" onClick={secondaryAction.onClick} sx={{ bgcolor: 'background.paper' }}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="contained"
              color="primary"
              onClick={primaryAction.onClick}
              startIcon={primaryAction.icon ? <Iconify icon={primaryAction.icon} /> : null}
            >
              {primaryAction.label}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
