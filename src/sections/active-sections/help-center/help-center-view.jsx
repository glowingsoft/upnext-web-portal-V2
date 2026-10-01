import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales/use-locales';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TablePaginationCustom } from 'src/components/table';
import { useGetHelpCenterArticleByIdQuery, useGetHelpCenterArticlesQuery, useCreateHelpCenterArticleMutation, useUpdateHelpCenterArticleMutation } from 'src/store/Reducer/help-center-api';
import { getMultiLangValue } from 'src/utils/multi-lang-content';

import { HelpCenterArticleForm } from './help-center-article-form';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

const DEFAULT_LANGUAGE_VALUE = { en: '', es: '', fr: '', pt: '', zh: '', ar: '', ht: '' };

const CREATE_DEFAULT_VALUES = {
  _id: null,
  title: { ...DEFAULT_LANGUAGE_VALUE },
  description: { ...DEFAULT_LANGUAGE_VALUE },
  coverImage: '',
  status: 'active',
};

const LANG_TO_API_LANG = { cn: 'zh' };
const DEFAULT_COVER_IMAGE = 'noimg.png';
const S3_PUBLIC_BASE_URL = 'https://upnext-sb.s3.us-east-1.amazonaws.com/';
const getApiLanguage = (language) => LANG_TO_API_LANG[language] || language;

const getLocalizedText = (value, language) => getMultiLangValue(value, getApiLanguage(language));

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').trim();

const isUsableImage = (value) => Boolean(value && !String(value).toLowerCase().includes(DEFAULT_COVER_IMAGE));
const isAbsoluteUrl = (value) => /^(https?:|blob:|data:)/i.test(String(value));
const getCoverImageUrl = (value) => {
  if (!isUsableImage(value)) return '';
  if (isAbsoluteUrl(value)) return value;
  return `${S3_PUBLIC_BASE_URL}${String(value).replace(/^\/+/, '')}`;
};

function HelpCenterArticleDetail({ article, isLoading, initialLanguage = 'en', onBack, onEdit }) {
  const { t } = useTranslate();

  const coverImageUrl = getCoverImageUrl(article?.coverImage);
  const title = getLocalizedText(article?.title, 'en');
  const languages = Object.keys(DEFAULT_LANGUAGE_VALUE);

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button type="button" color="inherit" variant="outlined" startIcon={<Iconify icon="eva:arrow-ios-back-fill" />} onClick={onBack}>
          {t('backToArticles')}
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={title || t('helpCenter')}
        links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('helpCenter'), onClick: onBack }, { name: title || t('view') }]}
        action={
          article?._id && (
            <Button type="button" variant="contained" color="primary" startIcon={<Iconify icon="solar:pen-bold" />} onClick={onEdit}>
              {t('edit')}
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        {isLoading ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('loading')}
          </Typography>
        ) : (
          <Stack spacing={3}>
            {coverImageUrl && <CardMedia component="img" image={coverImageUrl} alt={title || t('coverImage')} sx={{ width: 1, maxHeight: 360, objectFit: 'cover', borderRadius: 1 }} />}

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 220px' }} gap={2}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  {t('articleTitleEnglish')}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0.75, fontWeight: 600 }}>
                  {title || t('notAvailable')}
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  {t('status')}
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <Label color={article?.status === 'active' ? 'success' : 'default'} variant="soft" sx={{ textTransform: 'capitalize' }}>
                    {article?.status || t('notAvailable')}
                  </Label>
                </Box>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                {t('fieldEnglish', { field: t('description') })}
              </Typography>
              {getLocalizedText(article?.description, 'en') ? (
                <Box
                  sx={{
                    color: 'text.secondary',
                    '& p': { mt: 0, mb: 1 },
                    '& img': { maxWidth: 1, borderRadius: 1 },
                  }}
                  dangerouslySetInnerHTML={{ __html: getLocalizedText(article?.description, 'en') }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('notAvailable')}
                </Typography>
              )}
            </Box>

            <Stack spacing={2}>
              <Typography variant="subtitle1">{t('translations')}</Typography>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
                {languages
                  .filter((language) => language !== 'en')
                  .map((language) => {
                    const langInfo = allLangs.find((item) => getApiLanguage(item.value) === language || item.value === language);
                    const translatedTitle = getLocalizedText(article?.title, language);
                    const translatedDescription = getLocalizedText(article?.description, language);

                    return (
                      <Stack key={language} spacing={1.5} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FlagIcon code={langInfo?.countryCode || 'GB'} sx={{ width: 22, height: 16 }} />
                          <Typography variant="subtitle2">{langInfo?.label || language.toUpperCase()}</Typography>
                        </Stack>

                        <Box>
                          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                            {t('title')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, wordBreak: 'break-word' }}>
                            {translatedTitle || t('notAvailable')}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                            {t('description')}
                          </Typography>
                          {translatedDescription ? (
                            <Box
                              sx={{
                                color: 'text.secondary',
                                '& p': { mt: 0, mb: 1 },
                                '& img': { maxWidth: 1, borderRadius: 1 },
                              }}
                              dangerouslySetInnerHTML={{ __html: translatedDescription }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {t('notAvailable')}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    );
                  })}
              </Box>
            </Stack>
          </Stack>
        )}
      </Card>
    </DashboardContent>
  );
}

export function HelpCenterView() {
  const { t } = useTranslate();

  const tableHead = useMemo(() => [t('srNumber'), t('title'), t('description'), t('status'), t('actions')], [t]);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all'), color: 'default' },
      { value: 'active', label: t('active'), color: 'success' },
      { value: 'inactive', label: t('inactive'), color: 'default' },
    ],
    [t]
  );

  const statusFilterField = useMemo(() => createFilterField.status({ options: statusOptions }), [statusOptions]);

  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      status: activeTab,
      keyword: searchValue.trim(),
    }),
    [activeTab, page, rowsPerPage, searchValue]
  );

  const { data: articlesResponse, isLoading, isFetching, refetch } = useGetHelpCenterArticlesQuery(queryParams);
  const { data: articleResponse, isFetching: isFetchingArticle } = useGetHelpCenterArticleByIdQuery(selectedArticleId, {
    skip: !selectedArticleId || isCreating,
  });
  const [createArticle] = useCreateHelpCenterArticleMutation();
  const [updateArticle] = useUpdateHelpCenterArticleMutation();

  const articles = useMemo(() => articlesResponse?.data || [], [articlesResponse?.data]);
  const meta = articlesResponse?.meta || {};
  const totalCount = meta.totalRecords ?? meta.total ?? articles.length;

  const selectedArticle = useMemo(() => articleResponse?.data || articles.find((article) => article._id === selectedArticleId) || null, [articleResponse?.data, articles, selectedArticleId]);

  const getStatusCount = useCallback(
    (status) => {
      const counts = meta.counts || meta.statuses || meta.articlesCount || {};
      if (status === 'all') return counts.totalDocs ?? counts.total ?? meta.totalRecords ?? articles.length;
      const countKey = `total${status.charAt(0).toUpperCase()}${status.slice(1)}`;
      return counts[countKey] ?? counts[status] ?? articles.filter((article) => article.status === status).length;
    },
    [articles, meta]
  );

  const handleFilterChange = useCallback((_key, value) => {
    setActiveTab(value);
    setPage(0);
  }, []);

  const canReset = activeTab !== 'all';

  const activeFilters = useMemo(() => {
    if (!canReset) return [];
    return [{ ...statusFilterField, value: activeTab }];
  }, [activeTab, canReset, statusFilterField]);

  const handleResetFilters = useCallback(() => {
    setActiveTab('all');
    setPage(0);
  }, []);

  const handleRemoveFilter = useCallback(() => {
    setActiveTab('all');
    setPage(0);
  }, []);

  const handleSaveArticle = useCallback(
    async (articleData) => {
      try {
        if (isCreating) {
          await createArticle(articleData).unwrap();
          toast.success(t('articleCreatedSuccessfully'));
        } else {
          await updateArticle({ id: articleData._id, ...articleData }).unwrap();
          toast.success(t('articleUpdatedSuccessfully'));
        }

        setIsCreating(false);
        setSelectedArticleId(null);
        setSelectedMode(null);
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || error?.message || t('somethingWentWrongTryAgain'));
      }
    },
    [createArticle, isCreating, refetch, t, updateArticle]
  );

  const handleBackToList = useCallback(() => {
    setIsCreating(false);
    setSelectedArticleId(null);
    setSelectedMode(null);
  }, []);

  const handleCreatePage = useCallback(() => {
    setIsCreating(true);
    setSelectedArticleId(null);
    setSelectedMode('edit');
  }, []);

  const handleViewArticle = useCallback((id) => {
    setIsCreating(false);
    setSelectedArticleId(id);
    setSelectedMode('view');
  }, []);

  const handleEditArticle = useCallback((id) => {
    setIsCreating(false);
    setSelectedArticleId(id);
    setSelectedMode('edit');
  }, []);

  const editorArticle = isCreating ? CREATE_DEFAULT_VALUES : selectedMode === 'edit' ? selectedArticle : null;
  const viewerArticle = selectedMode === 'view' ? selectedArticle : null;

  if (editorArticle) {
    return <HelpCenterArticleForm article={editorArticle} isNew={isCreating} isLoading={isFetchingArticle} onBack={handleBackToList} onSave={handleSaveArticle} />;
  }

  if (selectedMode === 'view') {
    return <HelpCenterArticleDetail article={viewerArticle} isLoading={isFetchingArticle} initialLanguage={activeLanguage} onBack={handleBackToList} onEdit={() => handleEditArticle(selectedArticleId)} />;
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('helpCenter')}
        links={[
          { name: t('dashboard'), href: paths.adminDashboard.root },
          { name: t('helpCenter'), href: paths.adminDashboard.content.helpCenter },
        ]}
        action={
          <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleCreatePage}>
            {t('addArticle')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper filterField={statusFilterField} value={activeTab} onChange={handleFilterChange} getCount={getStatusCount} />

        <Box sx={{ px: 2.5, pt: 2.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {t('language')}
            </Typography>
            <Tabs value={activeLanguage} onChange={(_, value) => setActiveLanguage(value)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
          </Stack>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPage(0);
            }}
            placeholder={t('searchArticlePlaceholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {canReset && (
          <FlexibleTableFiltersResult
            activeFilters={activeFilters}
            totalResults={totalCount}
            onResetFilters={handleResetFilters}
            onRemoveFilter={handleRemoveFilter}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Scrollbar>
          <TableContainer>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  {tableHead.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'text.primary' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {!isLoading && articles.length ? (
                  articles.map((article, index) => (
                    <TableRow key={article._id} hover>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, width: 60 }}>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell sx={{ minWidth: 200 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {getLocalizedText(article.title, activeLanguage) || t('notAvailable')}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 300 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
                          {stripHtml(getLocalizedText(article.description, activeLanguage)) || t('notAvailable')}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Label color={article.status === 'active' ? 'success' : 'default'} variant="soft" sx={{ textTransform: 'capitalize' }}>
                          {article.status || t('notAvailable')}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <GenericTableRowActions
                          actions={[
                            { key: 'view', icon: 'solar:eye-bold', tooltip: t('view'), onClick: () => handleViewArticle(article._id) },
                            { key: 'edit', icon: 'solar:pen-bold', tooltip: t('edit'), onClick: () => handleEditArticle(article._id) },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {isLoading || isFetching ? t('loading') : t('noArticlesFound')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePaginationCustom
          dense={dense}
          onChangeDense={(e) => setDense(e.target.checked)}
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
    </DashboardContent>
  );
}
