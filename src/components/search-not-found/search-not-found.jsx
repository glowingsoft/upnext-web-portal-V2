import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function SearchNotFound({ query, sx, ...other }) {
  const { t } = useTranslate();

  if (!query) {
    return (
      <Typography variant="body2" sx={sx}>
        {t('enterKeywordsToSearch')}
      </Typography>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', borderRadius: 1.5, ...sx }} {...other}>
      <Box sx={{ mb: 1, typography: 'h6' }}>{t('notFound')}</Box>

      <Typography variant="body2">
        {t('noResultsFoundFor', { query })}
        <br /> {t('tryCheckingTyposOrCompleteWords')}
      </Typography>
    </Box>
  );
}
