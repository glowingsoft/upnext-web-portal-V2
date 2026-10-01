import { useState } from 'react';

import { Box, Container, Divider, Grid, InputBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

const LINK_GROUPS = [
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: paths.privacy },
      { label: 'Terms & Conditions', to: paths.terms },
    ],
  },
  {
    heading: 'Pages',
    links: [
      { label: 'Home', to: '/' },
      { label: 'How it Works', to: paths.howItWorks },
      { label: 'Reviews', to: paths.reviews },
      { label: 'Events', to: paths.events },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', to: paths.auth.jwt.signIn },
      { label: 'Sign up', to: paths.auth.jwt.signUp },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: paths.about },
      { label: 'FAQ', to: paths.faqs },
      { label: 'Contact Us', to: paths.contact },
    ],
  },
];

export default function LandingFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  return (
    <Box sx={{ bgcolor: brand.ink[900], pt: 6, pb: 3 }}>
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 6 } }}>
        <Grid container spacing={5}>

          {/* Left — logo + description + newsletter */}
          <Grid item xs={12} md={4}>
            <Box
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer', display: 'inline-flex', mb: 2.5 }}
            >
              <Logo width={96} height={30} disableLink />
            </Box>

            <Typography
              variant="body2"
              sx={{ color: '#fff', lineHeight: 1.8, mb: 4, maxWidth: 300 }}
            >
              We connect clients with top-rated beauty and hair professionals. Book with confidence,
              anytime, anywhere.
            </Typography>

            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>
              Stay in the loop
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 50,
                border: `1px solid ${alpha('#fff', 0.15)}`,
                bgcolor: alpha('#fff', 0.06),
                px: 2,
                py: 0.5,
                maxWidth: 340,
              }}
            >
              <InputBase
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1,
                  color: '#fff',
                  fontSize: '0.875rem',
                  '& input::placeholder': { color: alpha('#fff', 0.35) },
                }}
              />
              <Box
                component="button"
                type="button"
                onClick={() => setEmail('')}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 2,
                  py: 0.9,
                  border: 'none',
                  borderRadius: 50,
                  bgcolor: brand.green[400],
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: brand.green[600] },
                }}
              >
                <Iconify icon="mingcute:send-fill" width={14} />
                Subscribe
              </Box>
            </Box>
          </Grid>

          {/* Right — grouped link sections */}
          {LINK_GROUPS.map((group) => (
            <Grid item xs={6} sm={4} md key={group.heading}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: '#fff',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  mb: 2,
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
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                      '&:hover': { color: brand.green[200], textDecoration: 'underline' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}

        </Grid>

        <Divider sx={{ mt: 5, mb: 3, borderColor: alpha('#fff', 0.1) }} />

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', color: '#fff' }}
        >
          {`© ${currentYear} UpNext. All rights reserved.`}
        </Typography>
      </Container>
    </Box>
  );
}
