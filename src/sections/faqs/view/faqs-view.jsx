import { useMemo, useState } from 'react';

import { m } from 'framer-motion';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useGetFaqsQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

// Public marketing page — a single page of FAQs is plenty, no pager needed.
const FAQS_LIMIT = 50;

export function FaqsView() {
  const theme = useTheme();
  const { currentLang } = useTranslate();
  const activeLanguage = getApiLanguage(currentLang.value);
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, isFetching } = useGetFaqsQuery({ page: 1, limit: FAQS_LIMIT });

  const faqs = useMemo(() => {
    const raw = data?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [data]);

  const loading = isLoading || isFetching;

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
                Frequently Asked Questions
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mt: 1.5, maxWidth: 700 }}>
                Everything you need to know about UpNext. Can&apos;t find the answer? Reach out via our Contact page.
              </Typography>
            </Box>
          </m.div>
        </Box>

        {/* Accordion list */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Box sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}>
              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={56} sx={{ borderRadius: '10px' }} />
                  ))}
                </Stack>
              ) : faqs.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                  No FAQs available right now.
                </Typography>
              ) : (
                faqs.map((item) => {
                  const itemId = item._id || item.id;
                  const question = getMultiLangValue(item.question, activeLanguage);
                  const answer = getMultiLangValue(item.answer, activeLanguage);

                  return (
                    <Accordion
                      key={itemId}
                      expanded={expanded === itemId}
                      onChange={handleChange(itemId)}
                      disableGutters
                      elevation={0}
                      sx={{
                        mb: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '10px !important',
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': {
                          borderColor: alpha(brand.green[400], 0.4),
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <Iconify
                            icon="mingcute:down-line"
                            width={18}
                            sx={{ color: expanded === itemId ? brand.green[400] : theme.palette.text.secondary }}
                          />
                        }
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: 1,
                          minHeight: 56,
                          '& .MuiAccordionSummary-content': { my: 0 },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: expanded === itemId ? brand.green[400] : theme.palette.text.primary,
                            transition: 'color 0.2s',
                          }}
                        >
                          {question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pt: 0, pb: 2.5 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.9 }}>
                          {answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Box>
          </m.div>
        </Box>
      </SurfaceCard>
    </Container>
  );
}
