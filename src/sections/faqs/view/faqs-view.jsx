import { useMemo, useState } from 'react';

import { m } from 'framer-motion';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import PageHero from 'src/sections/home/landing/PageHero';

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
    <Box sx={{ pt: { xs: '64px', md: '66px' }, minHeight: '70vh', bgcolor: 'background.paper' }}>
      <Box>
        {/* Hero */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inDown}>
            <PageHero
              eyebrow="Support"
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about UpNext. Can't find the answer? Reach out via our Contact page."
            />
          </m.div>
        </Box>

        {/* Accordion list */}
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Box sx={{ maxWidth: 1040, mx: 'auto', px: { xs: 2.5, sm: 5, md: 8 }, py: { xs: 6, md: 10 } }}>
              {loading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={68} sx={{ borderRadius: '12px' }} />
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
                        mb: 2,
                        border: `1px solid ${alpha(brand.green[400], 0.2)}`,
                        borderRadius: '12px !important',
                        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                        '&:before': { display: 'none' },
                        '&:hover': { borderColor: alpha(brand.green[400], 0.5) },
                        '&.Mui-expanded': {
                          borderColor: alpha(brand.green[400], 0.5),
                          boxShadow: `0 24px 48px -28px ${alpha(brand.green[800], 0.35)}`,
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${alpha(brand.green[400], 0.5)}`,
                              color: expanded === itemId ? '#fff' : brand.green[600],
                              bgcolor: expanded === itemId ? brand.green[400] : 'transparent',
                              transition: 'background-color 0.25s ease, color 0.25s ease',
                            }}
                          >
                            <Iconify icon="mingcute:down-line" width={18} />
                          </Box>
                        }
                        sx={{
                          px: { xs: 2.5, md: 3.5 },
                          py: 1.5,
                          minHeight: 68,
                          gap: 2,
                          '& .MuiAccordionSummary-content': { my: 0 },
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.4,
                            fontSize: { xs: '1.05rem', sm: '1.05rem', md: '1.15rem', lg: '1.15rem' },
                            color: expanded === itemId ? brand.green[600] : theme.palette.text.primary,
                            transition: 'color 0.2s',
                          }}
                        >
                          {question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: { xs: 2.5, md: 3.5 }, pt: 0, pb: 3 }}>
                        <Typography sx={{ maxWidth: 680, color: theme.palette.text.secondary, lineHeight: 1.85, fontSize: '0.975rem' }}>
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
      </Box>
    </Box>
  );
}
