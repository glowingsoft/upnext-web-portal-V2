import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslate } from 'src/locales/use-locales';

const FALLBACK_IMAGE = '/assets/images/about/hero.webp';

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
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{
              px: 1.25,
              height: 34,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              mb: 3,
              color: '#a58b67',
              borderColor: 'rgba(165, 139, 103, 0.35)',
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: 'rgba(165, 139, 103, 0.55)',
                bgcolor: 'rgba(165, 139, 103, 0.06)',
              },
            }}
          >
            {t('viewAll')}
          </Button>
        }
      />

      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
        }}
        slotProps={{
          content: {
            paddingBottom: '16px',
          },
        }}
      >
        <Stack spacing={2} sx={{ px: 2, pt: 1, pb: 2 }}>
          {services.length === 0 ? (
            <Box sx={{ py: 6, px: 2, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Iconify icon="solar:bill-list-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('noSuggestedServicesYet')}
              </Typography>
            </Box>
          ) : (
            services.map((service) => (
              <ServiceCard key={service._id} service={service} onClick={() => onServiceClick?.(service._id)} />
            ))
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

function ServiceCard({ service, onClick }) {
  const { t } = useTranslate();
  const imageUrl = service.photos?.[0] || service.suggestedServices?.[0]?.image || service.suggestedServices?.[0]?.photo || FALLBACK_IMAGE;
  const duration = `${service.durationMins ?? 30} ${t('mins')}`;
  const rating = service.averageRating ?? service.rating ?? 0;
  const distance = service.distanceKm;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1,
        gap: 1.5,
        width: 1,
        display: 'grid',
        cursor: 'pointer',
        borderRadius: 1.5,
        position: 'relative',
        alignItems: 'stretch',
        bgcolor: 'background.paper',
        gridTemplateColumns: { xs: '84px minmax(0, 1fr)', sm: '92px minmax(0, 1fr) 112px' },
        minHeight: { xs: 108, sm: 116 },
        boxShadow: '0 8px 24px rgba(145, 158, 171, 0.14)',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        // transition: (theme) => theme.transitions.create(['box-shadow', 'transform'], { duration: 120 }),
        // '&:hover': {
        //   transform: 'translateY(-2px)',
        //   boxShadow: '0 12px 28px rgba(145, 158, 171, 0.22)',
        // },
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt={service.name}
        onError={(event) => {
          event.currentTarget.src = FALLBACK_IMAGE;
        }}
        sx={{
          width: { xs: 84, sm: 92 },
          height: { xs: 84, sm: 92 },
          borderRadius: 1.5,
          objectFit: 'cover',
        }}
      />

      <Stack sx={{ minWidth: 0, pr: { xs: 6, sm: 0 } }}>
        <Typography variant="subtitle1" noWrap>
          {service.name}
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.25, color: 'text.secondary' }} noWrap>
          {service.venueTitle || service.providerName}
        </Typography>

        {distance != null && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75, color: 'text.secondary' }}>
            <Iconify icon="solar:map-point-bold" width={16} sx={{ color: '#a58b67' }} />
            <Typography variant="caption">{t('kmAway', { distance })}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="flex-end"
        spacing={0.5}
        sx={{
          pr: 1,
          pb: 0.5,
          minWidth: 0,
          alignSelf: 'end',
          justifySelf: 'end',
          gridColumn: { xs: '2', sm: '3' },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#a58b67', fontWeight: 700 }}>
          {fCurrency(service.price)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          / {duration}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          top: 0,
          right: 0,
          px: 1,
          py: 0.5,
          minWidth: 50,
          position: 'absolute',
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 10,
          bgcolor: '#a58b67',
          color: 'common.white',
        }}
      >
        <Iconify icon="solar:star-bold" width={14} sx={{ color: 'common.white' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {rating}
        </Typography>
      </Stack>
    </Box>
  );
}
