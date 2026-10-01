import dayjs from 'dayjs';

import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';

import ProviderImage from 'src/assets/images/trainer.jpg';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fDate } from 'src/utils/format-time';

// Plain read-only promotion summary card — used for the provider/admin management views (a
// business viewing its own promotions, or an admin viewing a business's promotions), where
// "claiming" the offer makes no sense. The customer-facing marketplace and provider-public-profile
// views use the redesigned PromotionCard (with the "Claim Offer" CTA) instead.
export default function PromotionSummaryCard({ svc, providerName, onView }) {
  const { t } = useTranslate();

  const discountLabel =
    svc.discountType === 'percentage'
      ? `${svc.discountValue ?? svc.discount ?? 20}% ${t('off')}`
      : `$${svc.discountValue ?? svc.discount ?? 20} ${t('off')}`;

  const validUntil = fDate(svc.expiresAt || svc.validUntil || svc.expiryDate || svc.endDate || dayjs().add(30, 'day').toISOString());

  return (
    <Box
      component={Card}
      sx={{
        p: 2.25,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.primary.light}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: 2.5,
      }}
    >
      {/* Top: image + name + description */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src={svc.image || ProviderImage}
          alt={svc.name}
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            objectFit: 'cover',
            flexShrink: 0,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {svc.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {svc.description || providerName}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ width: 1 }} />

      {/* Middle: discount + valid until on left, Details on right */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Box>
          <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
            {discountLabel}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.4 }}>
            <Iconify icon="solar:calendar-mark-bold" width={13} sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('validUntil')} {validUntil}
            </Typography>
          </Stack>
        </Box>

        <Button
          variant="text"
          size="small"
          onClick={onView}
          endIcon={<Iconify icon="eva:external-link-fill" width={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            color: 'primary.main',
            px: 0.75,
            minWidth: 'auto',
            borderRadius: 1.5,
            alignSelf: 'center',
            '& .MuiButton-endIcon': { ml: 0.5, transition: 'transform 0.18s ease' },
            '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) },
            '&:hover .MuiButton-endIcon': { transform: 'translateX(2px) translateY(-2px)' },
          }}
        >
          {t('details')}
        </Button>
      </Box>
    </Box>
  );
}
