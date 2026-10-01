import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Field, Form } from 'src/components/hook-form';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

const LANGUAGE_KEYS = ['en', 'es', 'fr', 'pt', 'zh', 'ar', 'ht'];
const TRANSLATION_LANGS = [
  { key: 'es', label: 'Spanish (es)' },
  { key: 'fr', label: 'French (fr)' },
  { key: 'pt', label: 'Portuguese (pt)' },
  { key: 'zh', label: 'Chinese (zh)' },
  { key: 'ar', label: 'Arabic (ar)' },
  { key: 'ht', label: 'Haitian Creole (ht)' },
];
const LANG_COUNTRY = { en: 'GB', es: 'ES', fr: 'FR', pt: 'PT', zh: 'CN', ar: 'SA', ht: 'HT' };
const RTL_LANGS = new Set(['ar']);
const DEFAULT_COVER_IMAGE = 'noimg.png';
const S3_PUBLIC_BASE_URL = 'https://upnext-sb.s3.us-east-1.amazonaws.com/';

function FlagAdornment({ lang }) {
  return (
    <InputAdornment position="start">
      <FlagIcon code={LANG_COUNTRY[lang]} sx={{ width: 22, height: 16 }} />
    </InputAdornment>
  );
}

const toFieldName = (prefix, key) => `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
const getLanguageDirection = (key) => (RTL_LANGS.has(key) ? 'rtl' : 'ltr');

const getLocalized = (value, key) => {
  if (typeof value === 'string') return key === 'en' ? value : '';
  return value?.[key] || '';
};

const isDefaultCoverImage = (value) => !value || String(value).toLowerCase().includes(DEFAULT_COVER_IMAGE);

const isAbsoluteUrl = (value) => /^(https?:|blob:|data:)/i.test(String(value));

const getCoverPreviewUrl = (value) => {
  if (isDefaultCoverImage(value)) return null;
  if (isAbsoluteUrl(value)) return value;

  return `${S3_PUBLIC_BASE_URL}${String(value).replace(/^\/+/, '')}`;
};

const getCoverImagePayload = (coverUrl, originalCoverImage) => {
  if (!coverUrl) return DEFAULT_COVER_IMAGE;

  const originalPreviewUrl = getCoverPreviewUrl(originalCoverImage);
  if (typeof coverUrl === 'string' && originalPreviewUrl && coverUrl === originalPreviewUrl) {
    return originalCoverImage;
  }

  return coverUrl;
};

function buildLocalizedObject(data, prefix) {
  return LANGUAGE_KEYS.reduce((acc, key) => {
    const fieldName = key === 'en' ? prefix : toFieldName(prefix, key);
    acc[key] = data[fieldName] || '';
    return acc;
  }, {});
}

function toFormValues(article) {
  return {
    _id: article?._id || null,
    title: getLocalized(article?.title, 'en'),
    titleEs: getLocalized(article?.title, 'es'),
    titleFr: getLocalized(article?.title, 'fr'),
    titlePt: getLocalized(article?.title, 'pt'),
    titleZh: getLocalized(article?.title, 'zh'),
    titleAr: getLocalized(article?.title, 'ar'),
    titleHt: getLocalized(article?.title, 'ht'),
    description: getLocalized(article?.description, 'en'),
    descriptionEs: getLocalized(article?.description, 'es'),
    descriptionFr: getLocalized(article?.description, 'fr'),
    descriptionPt: getLocalized(article?.description, 'pt'),
    descriptionZh: getLocalized(article?.description, 'zh'),
    descriptionAr: getLocalized(article?.description, 'ar'),
    descriptionHt: getLocalized(article?.description, 'ht'),
    coverUrl: getCoverPreviewUrl(article?.coverImage),
    status: article?.status || 'active',
  };
}

export function HelpCenterArticleForm({ article, isNew, isLoading, onBack, onSave }) {
  const { t } = useTranslate();
  const [uploadS3] = useUploadS3Mutation();

  const ARTICLE_STATUS_OPTIONS = [
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
  ];

  const articleEditorSchema = zod.object({
    title: zod
      .string()
      .trim()
      .min(1, { message: t('titleIsRequired') }),
    description: zod
      .string()
      .min(1, { message: t('descriptionIsRequired') })
      .refine((value) => value.replace(/<[^>]*>/g, '').trim().length > 0, {
        message: t('descriptionIsRequired'),
      }),
    coverUrl: zod.any().nullable().optional(),
    status: zod.enum(['active', 'inactive'], { required_error: t('statusIsRequired') }),
    titleEs: zod.string().optional(),
    titleFr: zod.string().optional(),
    titlePt: zod.string().optional(),
    titleZh: zod.string().optional(),
    titleAr: zod.string().optional(),
    titleHt: zod.string().optional(),
    descriptionEs: zod.string().optional(),
    descriptionFr: zod.string().optional(),
    descriptionPt: zod.string().optional(),
    descriptionZh: zod.string().optional(),
    descriptionAr: zod.string().optional(),
    descriptionHt: zod.string().optional(),
  });

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(articleEditorSchema),
    defaultValues: toFormValues(article),
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(toFormValues(article));
  }, [article, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    let coverImage = getCoverImagePayload(data.coverUrl, article?.coverImage);

    if (data.coverUrl instanceof File) {
      const formData = new FormData();
      formData.append('files', data.coverUrl);
      const res = await uploadS3(formData).unwrap();
      coverImage = res?.data?.file || coverImage;
    }

    const title = buildLocalizedObject(data, 'title');
    const description = buildLocalizedObject(data, 'description');

    await onSave({
      ...(article?._id ? { _id: article._id } : {}),
      title,
      description,
      coverImage: coverImage || DEFAULT_COVER_IMAGE,
      status: data.status,
    });
  });

  const handleRemoveCover = useCallback(() => {
    setValue('coverUrl', null, { shouldValidate: true });
  }, [setValue]);

  const pageTitle = isNew ? t('addArticle') : getLocalized(article?.title, 'en') || t('edit');
  const saveLabel = isNew ? t('createArticle') : t('saveArticle');

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button type="button" color="inherit" variant="outlined" startIcon={<Iconify icon="eva:arrow-ios-back-fill" />} onClick={onBack}>
          {t('backToArticles')}
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={pageTitle}
        links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('helpCenter'), onClick: onBack }, { name: pageTitle }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <Card>
          <Stack spacing={3} sx={{ p: 3 }}>
            {isLoading && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('loading')}
              </Typography>
            )}

            <Field.Text name="title" label={t('fieldEnglish', { field: t('articleTitle') })} InputProps={{ startAdornment: <FlagAdornment lang="en" /> }} />

            <Field.Select name="status" label={t('status')}>
              {ARTICLE_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('coverImage')}</Typography>
              <Field.Upload name="coverUrl" maxSize={3145728} onDelete={handleRemoveCover} />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('fieldEnglish', { field: t('description') })}</Typography>
              <Field.Editor name="description" sx={{ maxHeight: 520 }} placeholder={t('writeArticleDescriptionPlaceholder')} />
            </Stack>

            <Divider>
              <Typography variant="overline" sx={{ color: 'text.secondary', px: 1 }}>
                {t('translations')}
              </Typography>
            </Divider>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
              {TRANSLATION_LANGS.map(({ key, label }) => {
                const direction = getLanguageDirection(key);
                return (
                  <Stack key={key} spacing={2}>
                    <Field.Text
                      name={toFieldName('title', key)}
                      label={t('fieldLanguageLabel', { field: t('title'), lang: label })}
                      InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                      inputProps={{ dir: direction }}
                      sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                    />
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2">{t('fieldLanguageLabel', { field: t('description'), lang: label })}</Typography>
                      <Field.Editor
                        name={toFieldName('description', key)}
                        sx={{ maxHeight: 420, '& .ql-editor': { direction: 'ltr', textAlign: 'left' } }}
                        placeholder={t('writeArticleDescriptionPlaceholder')}
                      />
                    </Stack>
                  </Stack>
                );
              })}
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                {saveLabel}
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </Box>
  );
}
