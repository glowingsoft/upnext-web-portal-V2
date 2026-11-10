import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

import ServiceCard from '../../services-view/components/service-card-main';

export const SuggestedServicesSection = memo(({ services, onView }) => {
  const { t } = useTranslate();

  if (!services?.length) return null;

  return (
    <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, border: (theme) => `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}` }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:bill-list-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={700}>
          {t('suggestedServices')}
        </Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {services.map((service) => (
          <ServiceCard key={service._id || service.id} svc={service} onView={() => onView(service)} />
        ))}
      </Box>
    </Card>
  );
});

SuggestedServicesSection.displayName = 'SuggestedServicesSection';
