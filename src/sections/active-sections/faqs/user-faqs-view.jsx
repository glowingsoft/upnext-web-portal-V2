import { useMemo, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useGetFaqsQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

const FAQS_LIMIT = 20;

export default function UserFaqsView() {
  const { t, currentLang } = useTranslate();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const activeLanguage = getApiLanguage(currentLang.value);

  const { data, isLoading, isFetching } = useGetFaqsQuery({ page, limit: FAQS_LIMIT });

  const faqs = useMemo(() => {
    const raw = data?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [data]);

  const totalCount = data?.meta?.totalRecords || data?.meta?.total || faqs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / FAQS_LIMIT));

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('faqs')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('settings') }, { name: t('faqs') }]} sx={{ mb: { xs: 3, md: 5 } }} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            my: { xs: 2, md: 1 },
          }}
        >
          {t('frequentlyAskedQuestions')}
        </Typography>
      </Box>

      {isLoading || isFetching ? (
        <LoadingScreen />
      ) : (
        <>
          {faqs.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('noFaqsAvailable')}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {faqs.map((item) => {
                const itemId = item._id || item.id;
                const question = getMultiLangValue(item.question, activeLanguage);
                const answer = getMultiLangValue(item.answer, activeLanguage);
                const isExpanded = expanded === itemId;

                return (
                  <Accordion
                    key={itemId}
                    expanded={isExpanded}
                    onChange={handleChange(itemId)}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                      borderRadius: '10px !important',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { borderColor: 'primary.main' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <Iconify
                          icon="eva:arrow-ios-downward-fill"
                          width={18}
                          sx={{ color: isExpanded ? 'primary.main' : 'text.secondary' }}
                        />
                      }
                      sx={{
                        px: 2.5,
                        py: 1,
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 0 },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isExpanded ? 'primary.main' : 'text.primary',
                          transition: 'color 0.2s',
                        }}
                      >
                        {question}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                        {answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ pt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
            </Stack>
          )}
        </>
      )}
    </DashboardContent>
  );
}
