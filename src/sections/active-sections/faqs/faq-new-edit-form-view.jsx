import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Field, Form } from 'src/components/hook-form';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales/use-locales';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useAddFaqMutation, useGetAdminFaqsQuery, useUpdateFaqMutation } from 'src/store/Reducer/settings-api';

// ----------------------------------------------------------------------

const DEFAULT_CONTENT = {
  question: '',
  answer: '',
};

const DEFAULT_FORM_VALUES = {
  translations: allLangs.reduce((acc, language) => ({ ...acc, [language.value]: DEFAULT_CONTENT }), {}),
};

const RTL_LANGUAGES = ['ar'];
const LANG_TO_API_LANG = { cn: 'zh' };

const getLanguageDirection = (language) => (RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr');
const getApiLanguage = (language) => LANG_TO_API_LANG[language] || language;

const getFaqFormValues = (faq) => {
  // Legacy/seed FAQs may store question/answer as a plain string instead of a per-language
  // map. Treat that as the English value so it's visible (and re-saveable) instead of blank.
  const questionMap = typeof faq?.question === 'string' ? { en: faq.question } : faq?.question || {};
  const answerMap = typeof faq?.answer === 'string' ? { en: faq.answer } : faq?.answer || {};

  return {
    translations: allLangs.reduce(
      (acc, language) => ({
        ...acc,
        [language.value]: {
          question: questionMap[getApiLanguage(language.value)] || '',
          answer: answerMap[getApiLanguage(language.value)] || '',
        },
      }),
      {}
    ),
  };
};

// When the loaded FAQ's question/answer came back as a flat string (the admin list endpoint
// collapsing the per-language map down to one locale — the same bug we found on the legal
// content endpoints), every language except English is "unknown": we never received its real
// content, so it must not be forced-required or blanked out on save.
const buildLanguageMap = (translations, field, unknownLanguages) =>
  allLangs.reduce((acc, language) => {
    const value = translations?.[language.value]?.[field]?.trim() || '';
    if (value || !unknownLanguages.has(language.value)) {
      acc[getApiLanguage(language.value)] = value;
    }
    return acc;
  }, {});

export function FaqNewEditFormView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const location = useLocation();
  const { id } = useParams();

  const faqsPath = paths.adminDashboard.content.faqs;
  const isEdit = pathname.endsWith('/edit') && Boolean(id);

  // Prefer the FAQ passed via router state (from the list's edit action) — avoids needing a
  // "get FAQ by id" endpoint. Falls back to searching a large page of the list (e.g. on refresh).
  const faqFromState = location.state?.faq;

  const { data: faqsData, isLoading: isFaqsLoading } = useGetAdminFaqsQuery(
    { page: 1, limit: 200 },
    { skip: !isEdit || Boolean(faqFromState) }
  );

  const faq = useMemo(() => {
    if (!isEdit) return null;
    if (faqFromState) return faqFromState;

    const raw = faqsData?.data;
    const list = raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
    return list.find((item) => (item._id || item.id) === id) || null;
  }, [isEdit, faqFromState, faqsData, id]);

  const isLoadingFaq = isEdit && !faqFromState && isFaqsLoading;

  // The list endpoint sometimes returns question/answer as a flat string instead of the full
  // per-language map (same bug found on the legal content endpoints). When that happens we only
  // actually know the English value — every other language is "unknown", not "empty", so it
  // must not be required or overwritten with blank content on save.
  const isFaqFlattened = isEdit && faq && (typeof faq.question === 'string' || typeof faq.answer === 'string');
  const unknownLanguages = useMemo(
    () => new Set(isFaqFlattened ? allLangs.filter((language) => language.value !== 'en').map((language) => language.value) : []),
    [isFaqFlattened]
  );

  const [addFaq] = useAddFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();

  const faqSchema = zod.object({
    translations: zod.object(
      allLangs.reduce((acc, language) => {
        if (unknownLanguages.has(language.value)) {
          return {
            ...acc,
            [language.value]: zod.object({
              question: zod.string().trim().optional().default(''),
              answer: zod.string().trim().optional().default(''),
            }),
          };
        }

        return {
          ...acc,
          [language.value]: zod.object({
            question: zod
              .string()
              .trim()
              .min(1, { message: `${language.label} ${t('questionIsRequired')}` }),
            answer: zod
              .string()
              .trim()
              .min(1, { message: `${language.label} ${t('answerIsRequired')}` }),
          }),
        };
      }, {})
    ),
  });

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(faqSchema),
    defaultValues: isEdit && faq ? getFaqFormValues(faq) : DEFAULT_FORM_VALUES,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(isEdit && faq ? getFaqFormValues(faq) : DEFAULT_FORM_VALUES);
  }, [faq, isEdit, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const payload = {
      question: buildLanguageMap(data.translations, 'question', unknownLanguages),
      answer: buildLanguageMap(data.translations, 'answer', unknownLanguages),
    };

    try {
      if (isEdit) {
        await updateFaq({ id: faq._id || faq.id, ...payload }).unwrap();
        toast.success(t('faqUpdatedSuccessfully'));
      } else {
        await addFaq(payload).unwrap();
        toast.success(t('faqAddedSuccessfully'));
      }
      router.push(faqsPath);
    } catch (error) {
      toast.error(error?.data?.message || t('failedToSaveFaq'));
    }
  });

  if (isLoadingFaq) {
    return <LoadingScreen />;
  }

  if (isEdit && !faq) {
    return (
      <DashboardContent>
        <Alert severity="warning">{t('faqNotFound')}</Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={isEdit ? t('editFaq') : t('addFaq')}
        links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('faqs'), href: faqsPath }, { name: isEdit ? t('editFaq') : t('addFaq') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isFaqFlattened && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('faqTranslationsIncompleteWarning')}
        </Alert>
      )}

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <Card>
          <Stack spacing={3} sx={{ p: 3 }}>
            {allLangs.map((language) => {
              const direction = getLanguageDirection(language.value);

              return (
                <Box key={language.value}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <FlagIcon code={language.countryCode} sx={{ width: 20, height: 20, borderRadius: '50%' }} />
                    <Typography variant="subtitle2">{language.label}</Typography>
                  </Stack>

                  <Stack spacing={2}>
                    <Field.Text
                      name={`translations.${language.value}.question`}
                      label={t('question')}
                      placeholder={t('enterFaqQuestion')}
                      inputProps={{ dir: direction }}
                      sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                    />

                    <Field.Text
                      name={`translations.${language.value}.answer`}
                      label={t('answer')}
                      placeholder={t('writeAnswer')}
                      multiline
                      rows={4}
                      inputProps={{ dir: direction }}
                      sx={{ '& textarea': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                    />
                  </Stack>
                </Box>
              );
            })}

            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                {isEdit ? t('saveChanges') : t('addFaq')}
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </DashboardContent>
  );
}
