import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ProviderImage from 'src/assets/images/trainer.jpg';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fDate } from 'src/utils/format-time';

const ACCENT = '#a68e6b';
const ACCENT_HOVER = '#967d5f';
const CARD_CREAM = '#fffaf0';

export default function PromotionCard({ svc, providerName, onView, hideDistance }) {
  const { t } = useTranslate();

  const isUnavailable = svc.isAvailable === false;

  const discountLabel =
    svc.discountType === 'percentage'
      ? `${svc.discountValue ?? svc.discount ?? 20}% ${t('off')}`
      : `$${svc.discountValue ?? svc.discount ?? 20} ${t('off')}`;

  const validUntil = fDate(svc.expiresAt || svc.validUntil || svc.expiryDate || svc.endDate || dayjs().add(30, 'day').toISOString());

  return (
    <Card
      sx={{
        position: 'relative',
        p: 2.25,
        borderRadius: 3,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
        bgcolor: CARD_CREAM,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isUnavailable && (
        <Chip
          size="small"
          variant="soft"
          color="error"
          icon={<Iconify icon="solar:close-circle-bold" width={14} />}
          label={t('unavailable')}
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, height: 20, fontSize: 10, fontWeight: 700 }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, ...(isUnavailable && { opacity: 0.6, filter: 'grayscale(0.4)' }) }}>
      <Stack direction="row" spacing={1.75} alignItems="flex-start">
        <Box
          component="img"
          src={svc.image || ProviderImage}
          alt={svc.name}
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            objectFit: 'cover',
            flexShrink: 0,
            bgcolor: 'background.neutral',
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0, pr: isUnavailable ? 8 : 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {svc.name}
          </Typography>
          {providerName && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:shop-bold" width={13} sx={{ color: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {providerName}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      <Stack spacing={0.75}>
        {svc.targetName && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Iconify icon="solar:bill-list-bold" width={16} sx={{ color: ACCENT, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {t('appliesTo')}:{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {svc.targetName}
                </Box>
              </Typography>
            </Stack>
            {svc.description && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  pl: 3,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {svc.description}
              </Typography>
            )}
          </Box>
        )}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:tag-price-bold" width={16} sx={{ color: ACCENT, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('discount')}:{' '}
            <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {discountLabel}
            </Box>
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:calendar-mark-bold" width={16} sx={{ color: ACCENT, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('validUntil')}: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{validUntil}</Box>
          </Typography>
        </Stack>
        {!hideDistance && (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="mingcute:location-fill" width={16} sx={{ color: ACCENT, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('kmAway', { distance: svc.distance ?? '1.4' })}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Button
        fullWidth
        variant="contained"
        onClick={onView}
        sx={{
          mt: 0.5,
          py: 1.1,
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          bgcolor: ACCENT,
          color: 'common.white',
          boxShadow: 'none',
          '&:hover': { bgcolor: ACCENT_HOVER, boxShadow: 'none' },
        }}
      >
        {t('claimOffer', { defaultValue: 'Claim Offer' })}
      </Button>
      </Box>
    </Card>
  );
}
