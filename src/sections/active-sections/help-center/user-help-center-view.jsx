import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';
import { useGetAppHelpCenterArticleByIdQuery, useGetAppHelpCenterArticlesQuery } from 'src/store/Reducer/help-center-api';

const HELP_CENTER_LIMIT = 10;
const S3_PUBLIC_BASE_URL = 'https://upnext-sb.s3.us-east-1.amazonaws.com/';

const getArticles = (response) => {
  const raw = response?.data;
  return raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);
};

const getArticle = (response) => response?.data || response || null;

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const resolveImageUrl = (image) => {
  if (!image || image === 'noimg.png') return `${CONFIG.site.basePath}/assets/images/faqs/hero.jpg`;
  if (/^(https?:|blob:|data:)/i.test(String(image))) return image;
  return `${S3_PUBLIC_BASE_URL}${String(image).replace(/^\/+/, '')}`;
};

export default function UserHelpCenterView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, currentLang } = useTranslate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const activeLanguage = getApiLanguage(currentLang.value);
  const keyword = search.trim();

  const { data: articlesResponse, isLoading, isFetching } = useGetAppHelpCenterArticlesQuery(
    { page, limit: HELP_CENTER_LIMIT, keyword: keyword || undefined },
    { skip: Boolean(id) }
  );

  const { data: articleResponse, isLoading: isArticleLoading, isFetching: isArticleFetching } = useGetAppHelpCenterArticleByIdQuery(id, {
    skip: !id,
  });

  const articles = useMemo(() => getArticles(articlesResponse), [articlesResponse]);
  const selectedArticle = useMemo(() => getArticle(articleResponse), [articleResponse]);

  const totalCount = articlesResponse?.meta?.totalRecords || articlesResponse?.meta?.total || articles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / HELP_CENTER_LIMIT));

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  if (id) {
    if (isArticleLoading || isArticleFetching) {
      return <LoadingScreen />;
    }

    const title = getMultiLangValue(selectedArticle?.title, activeLanguage) || t('helpCenter');
    const description = getMultiLangValue(selectedArticle?.description, activeLanguage);
    const coverImage = resolveImageUrl(selectedArticle?.coverImage);

    return (
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ width: 1 }}>
          <Button onClick={() => navigate(paths.dashboard.appSettings.helpCenter)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />} sx={{ mb: 2 }}>
            {t('back')}
          </Button>

          <Box
            sx={{
              height: { xs: 220, md: 300 },
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              px: { xs: 3, md: 12 },
              py: { xs: 4, md: 5 },
              color: 'common.white',
              backgroundImage: `linear-gradient(rgba(22, 28, 36, 0.78), rgba(22, 28, 36, 0.78)), url(${coverImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <Typography variant="h1">{title}</Typography>
          </Box>

          <Box sx={{ p: 3 }} component={Card}>
            {description ? (
              <Stack
                sx={{
                  '& h1, & h2, & h3, & h4, & h5, & h6': { typography: 'h6', mt: 3, mb: 1.5, '&:first-of-type': { mt: 0 } },
                  '& p': { typography: 'body2', color: 'text.secondary', lineHeight: 1.9, mb: 1.5 },
                  '& ul, & ol': { pl: 3, mb: 1.5, color: 'text.secondary' },
                  '& a': { color: 'primary.main' },
                }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <Iconify icon="solar:document-text-bold" width={40} sx={{ color: 'text.disabled' }} />
                <Typography variant="subtitle1">{t('noContentAvailable')}</Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('helpCenter')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('helpCenter') }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Stack spacing={2} sx={{ pb: 4 }}>
        <TextField
          fullWidth
          value={search}
          onChange={handleSearch}
          placeholder={t('searchHere')}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
                opacity: isFetching ? 0.72 : 1,
              }}
            >
              {articles.map((article) => {
                const articleId = article._id || article.id;
                const title = getMultiLangValue(article.title, activeLanguage) || t('notAvailable');
                const description = stripHtml(getMultiLangValue(article.description, activeLanguage));

                return (
                  <Box
                    key={articleId}
                    onClick={() => navigate(paths.dashboard.appSettings.helpCenterDetails(articleId))}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                      cursor: 'pointer',
                    }}
                    component={Card}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ mb: 0.3, fontWeight: 700 }}>
                        {title}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {description || t('notAvailable')}
                      </Typography>
                    </Box>

                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
                  </Box>
                );
              })}
            </Box>

            {!articles.length && (
              <Table>
                <TableNoData notFound />
              </Table>
            )}

            {totalPages > 1 && (
              <Stack alignItems="center" sx={{ pt: 3 }}>
                <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </DashboardContent>
  );
}
