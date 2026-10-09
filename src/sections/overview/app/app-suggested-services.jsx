import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import ListingPreviewCard from 'src/sections/home/landing/ListingPreviewCard';

export function AppSuggestedServices({ title, services, onViewAll, onServiceClick, sx, ...other }) {
  const { t } = useTranslate();

  return (
    <Card {...other} sx={[{ display: 'flex', flexDirection: 'column', minHeight: 0, width: 1 }, ...(sx ? [sx] : [])]}>
      <CardHeader
        title={title}
        action={
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{ px: 1.25, height: 34, borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
          >
            {t('viewAll')}
          </Button>
        }
      />

      <Box sx={{ p: 3, pt: 2.5, flex: 1 }}>
        {services.length === 0 ? (
          <Box sx={{ py: 6, px: 2, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Iconify icon="solar:bill-list-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('noSuggestedServicesYet')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
            {services.map((service) => (
              <ListingPreviewCard key={service._id} kind="service" item={service} onView={() => onServiceClick?.(service._id)} />
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}
