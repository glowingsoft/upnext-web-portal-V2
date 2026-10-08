import { Box, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

const STATIC_LINK_GROUPS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Services', to: paths.services },
      { label: 'Reviews', to: paths.reviews },
      { label: 'Events', to: paths.events },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: paths.about },
      { label: 'How it Works', to: paths.howItWorks },
      { label: 'FAQ', to: paths.faqs },
      { label: 'Contact Us', to: paths.contact },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: paths.privacy },
      { label: 'Terms & Conditions', to: paths.terms },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: 'ri:instagram-line', href: 'https://www.instagram.com/' },
  { label: 'Facebook', icon: 'ri:facebook-fill', href: 'https://www.facebook.com/' },
  { label: 'TikTok', icon: 'ri:tiktok-fill', href: 'https://www.tiktok.com/' },
  { label: 'X', icon: 'ri:twitter-x-fill', href: 'https://x.com/' },
];

const GUEST_ACCOUNT_LINKS = [
  { label: 'Sign in', to: paths.auth.jwt.signIn },
  { label: 'Sign up', to: paths.auth.jwt.signUp },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const { user } = useSelector((state) => state.user);
  const userType = user?.accountState?.userType;
  const isAdminUser = userType === 'admin' || userType === 'subadmin';

  const accountLinks = user
    ? [
        { label: 'Dashboard', to: isAdminUser ? paths.adminDashboard.root : paths.dashboard.root },
        { label: 'My Profile', to: isAdminUser ? paths.adminDashboard.profile : paths.dashboard.profile },
      ]
    : GUEST_ACCOUNT_LINKS;

  const linkGroups = [...STATIC_LINK_GROUPS, { heading: 'Account', links: accountLinks }];

  return (
    <Box sx={{ bgcolor: brand.ink[900], pt: { xs: 6, md: 8 }, pb: 3 }}>
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 6 } }}>
        <Grid container spacing={5}>

          {/* Left — logo + description + social links */}
          <Grid item xs={12} md={4}>
            <Box
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer', display: 'inline-flex', mb: 2.5 }}
            >
              <Logo width={96} height={30} disableLink />
            </Box>

            <Typography
              variant="body2"
              sx={{ color: alpha('#fff', 0.72), lineHeight: 1.8, mb: 4, maxWidth: 300 }}
            >
              We connect clients with top-rated beauty and hair professionals. Book with confidence,
              anytime, anywhere.
            </Typography>

            <Stack direction="row" spacing={1.25}>
              {SOCIAL_LINKS.map((social) => (
                <Box
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: alpha('#fff', 0.82),
                    border: `1px solid ${alpha('#fff', 0.18)}`,
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                    '&:hover': { color: '#fff', bgcolor: brand.green[400], borderColor: brand.green[400] },
                  }}
                >
                  <Iconify icon={social.icon} width={18} />
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Right — grouped link sections */}
          {linkGroups.map((group) => (
            <Grid item xs={6} sm={4} md key={group.heading}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: brand.green[400],
                  letterSpacing: '0.2em',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  mb: 2.5,
                }}
              >
                {group.heading}
              </Typography>

              <Stack spacing={1.25}>
                {group.links.map((link) => (
                  <Typography
                    key={link.to}
                    variant="body2"
                    onClick={() => navigate(link.to)}
                    sx={{
                      color: alpha('#fff', 0.82),
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                      '&:hover': { color: brand.green[200], textDecoration: 'underline', textUnderlineOffset: 3 },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}

        </Grid>

        <Divider sx={{ mt: { xs: 5, md: 7 }, mb: 3, borderColor: alpha('#fff', 0.1) }} />

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', color: alpha('#fff', 0.6) }}
        >
          {`© ${currentYear} UpNext. All rights reserved.`}
        </Typography>
      </Container>
    </Box>
  );
}
