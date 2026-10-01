import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { UploadIllustration } from 'src/assets/illustrations';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function UploadPlaceholder({ ...other }) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      {...other}
    >
      <UploadIllustration hideBackground sx={{ width: 200 }} />

      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Box sx={{ typography: 'h6' }}>{t('dropOrSelectFile')}</Box>
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
          {t('dropFilesHereOrClick')}
          <Box
            component="span"
            sx={{ mx: 0.5, color: 'primary.main', textDecoration: 'underline' }}
          >
            {t('browse')}
          </Box>
          {t('throughYourMachine')}
        </Box>
      </Stack>
    </Box>
  );
}
