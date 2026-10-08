import { m } from 'framer-motion';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

import { brand } from 'src/sections/home/landing/theme';
import PageHero from 'src/sections/home/landing/PageHero';

const HEADING_FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";

const contentPadding = {
  maxWidth: 1120,
  mx: 'auto',
  px: { xs: 3, sm: 5, md: 8 },
  py: { xs: 6, md: 10 },
};

export default function LegalPublicView({ eyebrow = 'Legal', title, subtitle, html, loading = false }) {
  const theme = useTheme();

  return (
    <Box sx={{ pt: { xs: '64px', md: '66px' }, minHeight: '70vh', bgcolor: 'background.paper' }}>
      <Box>
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inDown}>
            <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
          </m.div>
        </Box>

        <Box>
          {loading ? (
            <Stack spacing={1.5} sx={{ ...contentPadding, minHeight: '100vh' }}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} variant="text" height={24} width={index % 3 === 2 ? '60%' : '100%'} />
              ))}
            </Stack>
          ) : html ? (
            <Box
              dangerouslySetInnerHTML={{ __html: html }}
              sx={{
                ...contentPadding,
                fontSize: '1rem',
                lineHeight: 1.85,
                color: theme.palette.text.secondary,
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontFamily: HEADING_FONT,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                  mt: 5,
                  mb: 1.5,
                  color: theme.palette.text.primary,
                },
                '& h1': { fontSize: { xs: '1.6rem', md: '1.9rem' } },
                '& h2': { fontSize: { xs: '1.4rem', md: '1.6rem' } },
                '& h3': { fontSize: { xs: '1.2rem', md: '1.3rem' } },
                '& h4, & h5, & h6': { fontSize: '1.1rem' },
                '& > :first-of-type': { mt: 0 },
                '& p': { fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', color: 'inherit', mb: 2 },
                '& ul, & ol': { pl: 3, mb: 2, fontSize: 'inherit', lineHeight: 'inherit', color: 'inherit' },
                '& ul': { listStyleType: 'disc' },
                '& ol': { listStyleType: 'decimal' },
                '& li': { mb: 0.75 },
                '& li::marker': { color: brand.green[400] },
                '& strong, & b': { color: theme.palette.text.primary, fontWeight: 700 },
                '& a': {
                  color: brand.green[600],
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  '&:hover': { color: brand.green[800] },
                },
                '& hr': { my: 4, border: 'none', borderTop: `1px solid ${alpha(brand.green[400], 0.25)}` },
              }}
            />
          ) : (
            <Typography sx={{ ...contentPadding, textAlign: 'center', color: theme.palette.text.secondary }}>
              No content available right now.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
