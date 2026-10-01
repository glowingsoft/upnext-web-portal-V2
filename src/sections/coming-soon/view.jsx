import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import { varAlpha } from 'src/theme/styles';
import { grantComingSoonAccess } from 'src/utils/coming-soon-access';
import { ComingSoonIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export function ComingSoonView() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (event) => {
    event.preventDefault();
    if (grantComingSoonAccess(code.trim())) {
      window.location.assign('/');
      return;
    }
    setError('Incorrect access code');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          `linear-gradient(180deg, ${theme.vars.palette.background.default} 0%, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.32)} 100%)`,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 280,
          height: 280,
          borderRadius: '50%',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 76,
            height: 76,
            mx: 'auto',
            mb: 2.5,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.vars.palette.grey[900]} 0%, ${theme.vars.palette.primary.darker} 100%)`,
            boxShadow: (theme) => `0 16px 32px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}`,
          }}
        >
          <Logo disableLink width={42} height={42} sx={{ filter: 'brightness(0) invert(1)' }} />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0.75}
          sx={{
            mx: 'auto',
            mb: 2,
            px: 1.75,
            py: 0.5,
            width: 'fit-content',
            borderRadius: 99,
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.24)}`,
          }}
        >
          <Iconify icon="solar:rocket-2-bold-duotone" width={16} sx={{ color: 'primary.dark' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark', letterSpacing: 0.4 }}>
            LAUNCHING SOON
          </Typography>
        </Stack>

        <Typography variant="h3" sx={{ mb: 1.5, fontWeight: 800 }}>
          We&apos;re putting on the finishing touches
        </Typography>

        <Typography sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
          UpNext is almost ready to help you discover and book top-rated beauty professionals near
          you. We&apos;ll be live very soon — check back shortly.
        </Typography>

        <ComingSoonIllustration sx={{ my: 3, mx: 'auto', width: { xs: 210, sm: 250 } }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ flexWrap: 'wrap', rowGap: 1 }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Need to reach us in the meantime?
          </Typography>
          <Box
            component={RouterLink}
            href={paths.contact}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 2,
              py: 0.6,
              borderRadius: 99,
              typography: 'subtitle2',
              color: 'primary.dark',
              textDecoration: 'none',
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
              transition: (theme) => theme.transitions.create(['background-color']),
              '&:hover': {
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
              },
            }}
          >
            Contact us
            <Iconify icon="solar:arrow-right-linear" width={14} />
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 3.5,
            mx: 'auto',
            maxWidth: 360,
            p: 2.5,
            borderRadius: 3,
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mb: 1.5 }}>
            <Iconify icon="solar:lock-keyhole-minimalistic-bold" width={15} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              Have an access code?
            </Typography>
          </Stack>

          <Stack component="form" onSubmit={handleUnlock} direction="row" spacing={1} alignItems="flex-start">
            <TextField
              fullWidth
              size="small"
              placeholder="Enter code"
              value={code}
              error={Boolean(error)}
              helperText={error}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:lock-keyhole-minimalistic-bold" width={16} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              sx={{
                px: 2.5,
                py: 1,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Unlock
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
