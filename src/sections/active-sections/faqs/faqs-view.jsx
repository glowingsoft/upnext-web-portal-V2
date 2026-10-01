import { useCallback, useMemo, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales/use-locales';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { useDeleteFaqMutation, useGetAdminFaqsQuery } from 'src/store/Reducer/settings-api';
import { getMultiLangValue } from 'src/utils/multi-lang-content';

// ----------------------------------------------------------------------

const DEFAULT_VALUES = {
  question: '',
  answer: '',
};

const RTL_LANGUAGES = ['ar'];
const FAQS_LIMIT = 10;
const LANG_TO_API_LANG = { cn: 'zh' };

const getLanguageDirection = (language) => (RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr');
const getApiLanguage = (language) => LANG_TO_API_LANG[language] || language;

const getFaqContent = (faq, language) => ({
  question: getMultiLangValue(faq?.question, getApiLanguage(language)),
  answer: getMultiLangValue(faq?.answer, getApiLanguage(language)),
});

// ----------------------------------------------------------------------

export function FaqsView() {
  const { t } = useTranslate();
  const confirmDelete = useBoolean();

  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [faqToDelete, setFaqToDelete] = useState(null);
  const activeDirection = getLanguageDirection(activeLanguage);

  const { data, isLoading, isFetching } = useGetAdminFaqsQuery({ page, limit: FAQS_LIMIT });
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const faqs = useMemo(() => {
    const raw = data?.data;
    return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
  }, [data]);

  const totalCount = data?.meta?.totalRecords || data?.meta?.total || faqs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / FAQS_LIMIT));

  const handleAccordionChange = useCallback(
    (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  const handleAskDelete = useCallback(
    (faq) => {
      setFaqToDelete(faq);
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const handleCloseDeleteDialog = useCallback(() => {
    confirmDelete.onFalse();
    setFaqToDelete(null);
  }, [confirmDelete]);

  const handleDeleteFaq = useCallback(async () => {
    if (!faqToDelete) return;

    try {
      await deleteFaq(faqToDelete._id || faqToDelete.id).unwrap();
      toast.success(t('faqDeletedSuccessfully'));
      if (expanded === (faqToDelete._id || faqToDelete.id)) {
        setExpanded(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || t('failedToDeleteFaq'));
    } finally {
      handleCloseDeleteDialog();
    }
  }, [expanded, faqToDelete, handleCloseDeleteDialog, deleteFaq, t]);

  return (
    <>
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading={t('faqs')}
          links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('faqs') }]}
          action={
            <Button component={RouterLink} href={paths.adminDashboard.content.faqsAdd} variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />}>
              {t('addFaq')}
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Box>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography variant="h5">{t('manageFrequentlyAskedQuestions')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('addRemoveFaqsDescription')}
            </Typography>
          </Stack>

          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeLanguage} onChange={(_, value) => setActiveLanguage(value)} variant="scrollable" scrollButtons="auto">
              {allLangs.map((language) => (
                <Tab
                  key={language.value}
                  value={language.value}
                  label={language.label}
                  icon={<FlagIcon code={language.countryCode} sx={{ width: 20, height: 20, borderRadius: '50%' }} />}
                  iconPosition="start"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              ))}
            </Tabs>
          </Box>

          {isFetching && <LinearProgress sx={{ mb: 2 }} />}

          <Stack spacing={2}>
            {faqs.length ? (
              faqs.map((faq, index) => {
                const faqId = faq._id || faq.id;
                const content = getFaqContent(faq, activeLanguage);

                return (
                  <Accordion key={faqId} dir={activeDirection} expanded={expanded === faqId} onChange={handleAccordionChange(faqId)}>
                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ width: 1 }}>
                        <Box sx={{ minWidth: 0, direction: activeDirection, textAlign: activeDirection === 'rtl' ? 'right' : 'left' }}>
                          <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                            {t('faqNumber', { number: (page - 1) * FAQS_LIMIT + index + 1 })}
                          </Typography>
                          <Typography variant="subtitle1">{content.question || t('noQuestionAdded')}</Typography>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={0.5} onClick={(event) => event.stopPropagation()}>
                          <IconButton
                            component={RouterLink}
                            href={paths.adminDashboard.content.faqsEdit(faqId)}
                            state={{ faq }}
                            color="primary"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            onFocusCapture={(event) => event.stopPropagation()}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAskDelete(faq);
                            }}
                            onFocusCapture={(event) => event.stopPropagation()}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          whiteSpace: 'pre-line',
                          direction: activeDirection,
                          textAlign: activeDirection === 'rtl' ? 'right' : 'left',
                        }}
                      >
                        {content.answer || t('noAnswerAdded')}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })
            ) : !isLoading ? (
              <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ py: 8, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Iconify icon="solar:question-circle-bold" width={40} sx={{ color: 'text.disabled' }} />
                <Typography variant="subtitle1">{t('noFaqsAvailable')}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('createFirstFaqHint')}
                </Typography>
              </Stack>
            ) : null}
          </Stack>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ pt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
            </Stack>
          )}
        </Box>
      </DashboardContent>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={handleCloseDeleteDialog}
        title={t('deleteFaq')}
        content={t('confirmDeleteFaq', { name: getFaqContent(faqToDelete, activeLanguage).question || '' })}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteFaq} disabled={isDeleting}>
            {t('deleteAction')}
          </Button>
        }
      />
    </>
  );
}
