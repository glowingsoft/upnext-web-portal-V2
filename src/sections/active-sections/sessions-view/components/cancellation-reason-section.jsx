import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

export const CancellationReasonSection = memo(({ reason }) => {
  const { t } = useTranslate();

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.12)}`,
        background: (theme) =>
          `linear-gradient(135deg, ${varAlpha(theme.vars.palette.error.mainChannel, 0.14)} 0%, ${theme.vars.palette.background.paper} 45%, ${varAlpha(theme.vars.palette.error.mainChannel, 0.08)} 100%)`,
        boxShadow: (theme) => `0 8px 24px ${varAlpha(theme.vars.palette.error.mainChannel, 0.08)}`,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
        {t('cancellationReason')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
        {reason?.trim() ? reason : t('notAvailable')}
      </Typography>
    </Card>
  );
});

CancellationReasonSection.displayName = 'CancellationReasonSection';
