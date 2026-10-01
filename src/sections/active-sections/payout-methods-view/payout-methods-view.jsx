import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { varAlpha } from 'src/theme/styles';
import { useGetPayoutMethodsQuery } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

function maskAccountNumber(last4) {
  if (!last4) return '-';
  return `**** **** ${last4}`;
}

function PayoutMethodTile({ method }) {
  const { t } = useTranslate();

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: 2.5,
          minHeight: 160,
          color: 'common.white',
          background: 'linear-gradient(135deg, #241b13 0%, #8a7052 55%, #a68e6b 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -36, right: -24, width: 120, height: 120, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
        <Box sx={{ position: 'absolute', bottom: -46, left: -18, width: 130, height: 130, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: varAlpha('255 255 255', 0.16),
            }}
          >
            <Iconify icon="solar:buildings-2-bold" width={20} />
          </Box>

          {method.isDefault && (
            <Label color="warning" variant="filled" sx={{ bgcolor: varAlpha('255 255 255', 0.2), color: 'common.white' }}>
              {t('defaultCard')}
            </Label>
          )}
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 3,
            fontFamily: '"Roboto Mono", monospace',
            fontSize: { xs: 17, sm: 19 },
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          {maskAccountNumber(method.last4)}
        </Typography>

        <Box sx={{ position: 'relative', mt: 2.5 }}>
          <Typography variant="caption" sx={{ color: varAlpha('255 255 255', 0.7), textTransform: 'uppercase', letterSpacing: 0.6, display: 'block' }}>
            {t('bankAccount')}
          </Typography>
          <Typography variant="subtitle2" noWrap>
            {method.bankName || '-'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

function PayoutMethodSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" sx={{ minHeight: 160 }} />
    </Card>
  );
}

export function PayoutMethodsView() {
  const { t } = useTranslate();
  const { data, isLoading, isFetching } = useGetPayoutMethodsQuery();

  const payoutMethods = data?.data || [];
  const loading = isLoading || isFetching;

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('payoutMethod')}
        links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('connect'), href: paths.dashboard.appSettings.connect }, { name: t('payoutMethod') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {loading ? (
          Array.from({ length: 1 }).map((_, i) => <PayoutMethodSkeleton key={i} />)
        ) : payoutMethods.length > 0 ? (
          payoutMethods.map((method) => <PayoutMethodTile key={method.id} method={method} />)
        ) : (
          <Card
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              textAlign: 'center',
              gridColumn: '1 / -1',
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Iconify icon="solar:buildings-2-bold-duotone" width={44} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('noPayoutMethodsYet')}
              </Typography>
            </Stack>
          </Card>
        )}
      </Box>
    </DashboardContent>
  );
}
