import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';

import { brand } from './theme';

function scrollToId(id) {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export { scrollToId };

export default function LandingNav({ showHowItWorks = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      scrollToId('home');
      return;
    }

    navigate('/');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250,250,248,0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${alpha(brand.ink[400], 0.1)}`,
        py: 1.5,
        px: { xs: 2, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Logo width={96} height={30} onClick={handleLogoClick} sx={{ cursor: 'pointer' }} />

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {showHowItWorks && (
          <Box
            component="span"
            onClick={() => scrollToId('how-it-works')}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              alignItems: 'center',
              px: 2,
              py: 0.75,
              borderRadius: 50,
              cursor: 'pointer',
              backgroundColor: alpha('#fff', 0.95),
              color: brand.ink[900],
              fontWeight: 700,
              fontSize: '0.875rem',
              lineHeight: 1.5,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              mr: 1,
              border: `1px solid ${alpha(brand.green[100], 0.18)}`,
              boxShadow: '0 1px 4px 0 rgba(60, 120, 80, 0.03)',
              '&:hover': { backgroundColor: alpha(brand.green[100], 0.25) },
            }}
          >
            How it Works
          </Box>
        )}
        <Box
          component={RouterLink}
          to={paths.auth.jwt.signIn}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            borderRadius: 50,
            textDecoration: 'none',
            backgroundColor: alpha(brand.green[100], 0.5),
            color: brand.ink[900],
            fontWeight: 700,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'background-color 0.2s',
            mr: 1,
            border: `1px solid ${alpha(brand.green[200], 0.5)}`,
            '&:hover': { backgroundColor: alpha(brand.green[200], 0.7) },
          }}
        >
          Sign in
        </Box>

        <Box
          component={RouterLink}
          to={paths.auth.jwt.signUp}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            borderRadius: 50,
            textDecoration: 'none',
            backgroundColor: brand.green[400],
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: brand.green[600] },
          }}
        >
          Sign up
        </Box>
      </Box>
    </Box>
  );
}
