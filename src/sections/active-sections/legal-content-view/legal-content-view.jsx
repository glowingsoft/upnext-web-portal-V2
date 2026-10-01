import { Box, Card, Stack, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTranslate } from 'src/locales/use-locales';
import { useGetLegalContentQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

const TYPE_TO_FIELD_KEY = { terms: 'terms_and_conditions', about: 'about_us', privacy: 'privacy_policy' };

export default function LegalContentView({ type = 'about', title }) {
  const { t, currentLang } = useTranslate();
  const { data, isLoading, isFetching } = useGetLegalContentQuery(type);

  if (isLoading || isFetching) {
    return <LoadingScreen />;
  }

  const fieldKey = TYPE_TO_FIELD_KEY[type] || 'about_us';
  const html = getMultiLangValue(data?.data?.[fieldKey], getApiLanguage(currentLang.value));

  return (
    <DashboardContent maxWidth={false}>
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
          backgroundImage: `linear-gradient(rgba(22, 28, 36, 0.78), rgba(22, 28, 36, 0.78)), url(${CONFIG.site.basePath}/assets/images/faqs/hero.jpg)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography variant="h1">{title}</Typography>
      </Box>

      <Box component={Card} sx={{ p: 3 }}>
        {html ? (
          <Stack
            sx={{
              '& h1, & h2, & h3': { typography: 'h6', mt: 3, mb: 1.5, '&:first-of-type': { mt: 0 } },
              '& p': { typography: 'body2', color: 'text.secondary', lineHeight: 1.9, mb: 1.5 },
              '& ul, & ol': { pl: 3, mb: 1.5, color: 'text.secondary' },
              '& a': { color: 'primary.main' },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <Iconify icon="solar:document-text-bold" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="subtitle1">{t('noContentAvailable')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('checkBackLaterHint')}
            </Typography>
          </Stack>
        )}
      </Box>
    </DashboardContent>
  );
}
