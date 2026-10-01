import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

// Shared "Provided by <business>" card — used on the Service, Package, and Promotion detail
// pages (admin, customer, and provider views alike) to link back to the provider.
export function BusinessInfoCard({ business, onView }) {
  const { t } = useTranslate();
  const [logoFailed, setLogoFailed] = useState(false);

  if (!business?.businessName) return null;

  const isAvailable = business.isAvailable !== false;
  const address = business.location?.address;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
          }}
        >
          <Iconify icon="solar:shop-bold" width={18} sx={{ color: 'primary.main' }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>{t('business', { defaultValue: 'Business' })}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('providedBy', { defaultValue: 'Provided by' })}</Typography>
        </Box>
      </Stack>

      <Card
        sx={{
          px: 2.5,
          py: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={!logoFailed ? business.image : undefined}
            onError={() => setLogoFailed(true)}
            sx={{ width: 52, height: 52, fontWeight: 700, bgcolor: 'primary.lighter', color: 'primary.dark', flexShrink: 0 }}
          >
            {(business.businessName || '?').charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {business.businessName}
            </Typography>
            {address && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                <Iconify icon="solar:map-point-bold" width={14} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {address}
                </Typography>
              </Stack>
            )}
          </Box>

          <Chip
            size="small"
            variant="soft"
            color={isAvailable ? 'success' : 'error'}
            label={isAvailable ? t('available') : t('unavailable')}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          />
        </Stack>

        {onView && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={onView}
            startIcon={<Iconify icon="solar:eye-bold" width={16} />}
            sx={{ mt: 2, fontWeight: 700 }}
          >
            {t('viewProvider', { defaultValue: 'View Business' })}
          </Button>
        )}
      </Card>
    </Box>
  );
}
