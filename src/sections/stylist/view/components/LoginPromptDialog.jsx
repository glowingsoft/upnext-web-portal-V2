import { Box, Dialog, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { textGradient } from 'src/theme/styles';
import { brand } from 'src/sections/home/landing/theme';

// ----------------------------------------------------------------------

export default function LoginPromptDialog({ open, onClose, onSignIn, onSignUp }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3.5,
          pb: 2.5,
          background: `linear-gradient(135deg, ${alpha(brand.green[400], 0.1)} 0%, ${alpha(brand.green[200], 0.06)} 100%)`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            bgcolor: alpha('#000', 0.06),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha('#000', 0.1) },
          }}
        >
          <Iconify icon="mingcute:close-line" width={15} sx={{ color: 'text.secondary' }} />
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: brand.green[400],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: `0 6px 16px ${alpha(brand.green[400], 0.35)}`,
          }}
        >
          <Iconify icon="mingcute:calendar-line" width={24} sx={{ color: '#fff' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, ...textGradient(`135deg, ${brand.green[400]} 0%, ${brand.green[900]} 100%`) }}>
          Sign in to continue
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Create an account or sign in to book this service and manage your appointments.
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box
          component="button"
          type="button"
          onClick={onSignIn}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            px: 3,
            py: 1.25,
            borderRadius: 99,
            border: 'none',
            bgcolor: brand.green[400],
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            width: '100%',
            boxShadow: `0 4px 12px ${alpha(brand.green[400], 0.35)}`,
            transition: 'background-color 0.18s ease',
            '&:hover': { bgcolor: brand.green[600] },
          }}
        >
          Sign in
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onSignUp}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            py: 1.25,
            borderRadius: 99,
            border: `1.5px solid ${alpha(brand.green[400], 0.35)}`,
            bgcolor: 'transparent',
            color: brand.green[600],
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.18s ease',
            '&:hover': { bgcolor: alpha(brand.green[400], 0.06) },
          }}
        >
          Create account
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block', mt: 0.5 }}>
          Free to join · No credit card required
        </Typography>
      </Box>
    </Dialog>
  );
}
