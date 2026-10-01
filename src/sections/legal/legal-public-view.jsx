import { m } from 'framer-motion';
import { Box, Container, Skeleton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

export default function LegalPublicView({ title, html, loading = false }) {
  const theme = useTheme();

  return (
    <Container maxWidth={false} sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
      <SurfaceCard
        sx={{
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(4px)',
          overflow: 'hidden',
        }}
      >
        {/* Hero */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inDown}>
            <Box
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                py: { xs: 4, md: 6 },
                background: `linear-gradient(145deg, ${brand.ink[900]} 0%, ${brand.green[900]} 52%, ${brand.green[800]} 100%)`,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                }}
              >
                {title}
              </Typography>
            </Box>
          </m.div>
        </Box>

        {/* Content */}
        <Box>
          {loading ? (
            <Stack spacing={1.5} sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, md: 5 } }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="text" height={24} width={index % 3 === 2 ? '60%' : '100%'} />
              ))}
            </Stack>
          ) : html ? (
            <Box
              dangerouslySetInnerHTML={{ __html: html }}
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                py: { xs: 4, md: 5 },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 700,
                  mb: 1.5,
                  mt: 3,
                  color: theme.palette.text.primary,
                },
                '& h1:first-of-type, & h2:first-of-type, & h3:first-of-type': { mt: 0 },
                '& p': {
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                  lineHeight: 1.9,
                  color: theme.palette.text.secondary,
                  mb: 1.5,
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 1.5,
                  color: theme.palette.text.secondary,
                  fontSize: theme.typography.body2.fontSize,
                  lineHeight: 1.9,
                },
                '& a': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                },
              }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, md: 5 }, color: theme.palette.text.secondary }}
            >
              No content available right now.
            </Typography>
          )}
        </Box>
      </SurfaceCard>
    </Container>
  );
}
