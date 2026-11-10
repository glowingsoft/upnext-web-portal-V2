import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const USER_TYPE_META = {
  admin: { label: 'Admin', color: 'error' },
  subadmin: { label: 'Admin', color: 'error' },
  business: { label: 'Provider', color: 'warning' },
  provider: { label: 'Provider', color: 'warning' },
  customer: { label: 'Customer', color: 'info' },
  user: { label: 'Customer', color: 'info' },
};

export function HomeHeader({ showHowItWorks = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const userType = user?.accountState?.userType;
  const isAdminUser = userType === 'admin' || userType === 'subadmin';
  const dashboardPath = isAdminUser ? paths.adminDashboard.root : paths.dashboard.root;
  const profilePath = isAdminUser ? paths.adminDashboard.profile : paths.dashboard.profile;
  const isExistingUser = Boolean(user);
  const userTypeMeta = USER_TYPE_META[userType] || null;
  const displayName = user?.displayName || user?.basicInfo?.name || 'My Account';

  const [activeHomeSection, setActiveHomeSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== '/') return undefined;

    const handleScroll = () => {
      const howItWorksEl = document.getElementById('how-it-works');
      const isPastHowItWorks = howItWorksEl ? howItWorksEl.getBoundingClientRect().top <= 96 : false;
      setActiveHomeSection(isPastHowItWorks ? 'how-it-works' : 'home');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate('/');
  };

  const handleSectionClick = (path) => {
    if (path === '/' && location.pathname === '/') {
      setActiveHomeSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(path);
  };

  const handleHowItWorksClick = () => {
    if (location.pathname === '/') {
      setActiveHomeSection('how-it-works');
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/', { state: { scrollTo: 'how-it-works' } });
  };

  const navItems = [
    { label: 'Home', active: location.pathname === '/' && activeHomeSection === 'home', onClick: () => handleSectionClick('/') },
    ...(showHowItWorks
      ? [{ label: 'How it Works', active: location.pathname === '/' && activeHomeSection === 'how-it-works', onClick: handleHowItWorksClick }]
      : []),
    { label: 'Services', active: location.pathname === paths.services, onClick: () => handleSectionClick(paths.services) },
    { label: 'Reviews', active: location.pathname === paths.reviews, onClick: () => handleSectionClick(paths.reviews) },
    { label: 'Events', active: location.pathname === paths.events, onClick: () => handleSectionClick(paths.events) },
  ];

  return (
    <>
      <Box
        component="header"
        sx={(theme) => ({
          top: 0,
          left: 0,
          zIndex: theme.zIndex.appBar,
          width: 1,
          height: 66,
          display: 'flex',
          position: 'fixed',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.68)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: `1px solid rgba(145, 158, 171, 0.16)`,
          boxShadow: '0 4px 18px rgba(35, 45, 38, 0.06)',
        })}
      >
        <Box
          sx={{
            zIndex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            gap: { xs: 2, md: 4 },
            width: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              sx={{ ml: -1, display: { xs: 'inline-flex', md: 'none' }, color: 'text.primary' }}
            >
              <Iconify icon="eva:menu-fill" width={24} />
            </IconButton>

            <Box onClick={handleLogoClick} sx={{ cursor: 'pointer', display: 'inline-flex', flexShrink: 0 }}>
              <Logo width={96} height={30} disableLink />
            </Box>
          </Box>

          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 4,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {navItems.map((item) => (
              <NavLink key={item.label} active={item.active} onClick={item.onClick}>
                {item.label}
              </NavLink>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
            {isExistingUser ? (
              <Box
                component={RouterLink}
                href={profilePath}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  height: 44,
                  pl: 0.5,
                  pr: { xs: 0.5, sm: 1.5 },
                  borderRadius: 999,
                  textDecoration: 'none',
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.vars.palette.divider}`,
                  boxShadow: '0 2px 10px rgba(145, 158, 171, 0.18)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    borderColor: theme.vars.palette.primary.main,
                    boxShadow: '0 6px 16px rgba(145, 158, 171, 0.24)',
                    transform: 'translateY(-1px)',
                  },
                })}
              >
                <Avatar
                  src={user?.photoURL}
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.vars.palette.primary.contrastText,
                    bgcolor: theme.vars.palette.primary.main,
                    border: `2px solid ${theme.vars.palette.background.paper}`,
                    boxShadow: `0 0 0 1.5px ${theme.vars.palette.primary.main}`,
                  })}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: 0.375, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1, fontSize: 13 }}>
                    {displayName}
                  </Typography>
                  {userTypeMeta && (
                    <Label color={userTypeMeta.color} variant="soft" sx={{ height: 16, fontSize: 9, px: 0.75 }}>
                      {userTypeMeta.label}
                    </Label>
                  )}
                </Box>
              </Box>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  href={paths.auth.jwt.signIn}
                  variant="text"
                  sx={(theme) => ({
                    height: 40,
                    px: 2,
                    borderRadius: 999,
                    typography: 'subtitle2',
                    whiteSpace: 'nowrap',
                    color: theme.vars.palette.text.primary,
                    '&:hover': { bgcolor: theme.vars.palette.action.hover },
                  })}
                >
                  Sign in
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.auth.jwt.signUp}
                  variant="contained"
                  color="primary"
                  sx={(theme) => ({
                    height: 40,
                    px: 2.5,
                    borderRadius: 999,
                    typography: 'subtitle2',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 6px 16px ${theme.vars.palette.primary.main}3d`,
                    '&:hover': { boxShadow: `0 8px 20px ${theme.vars.palette.primary.main}52` },
                  })}
                >
                  Sign up
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 280, p: 2.5 } }}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo width={96} height={30} disableLink />
          <IconButton aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <Iconify icon="mingcute:close-line" width={22} />
          </IconButton>
        </Box>

        <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => (
            <Box
              key={item.label}
              component="button"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                item.onClick();
              }}
              sx={(theme) => ({
                px: 1.5,
                py: 1.25,
                border: 'none',
                borderRadius: 1.5,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                typography: 'subtitle1',
                color: item.active ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
                bgcolor: item.active ? theme.vars.palette.action.hover : 'transparent',
              })}
            >
              {item.label}
            </Box>
          ))}
        </Box>
      </Drawer>

      <Box sx={{ height: 0 }} />
    </>
  );
}

function NavLink({ onClick, active = false, children }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={(theme) => ({
        position: 'relative',
        border: 'none',
        background: 'none',
        p: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        typography: 'subtitle2',
        whiteSpace: 'nowrap',
        color: active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
        transition: 'color 0.2s ease',
        '&:hover': { color: theme.vars.palette.primary.main },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -8,
          height: 2,
          borderRadius: 2,
          bgcolor: theme.vars.palette.primary.main,
          opacity: active ? 1 : 0,
          transform: active ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        },
      })}
    >
      {children}
    </Box>
  );
}
