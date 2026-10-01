import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

const FALLBACK_IMAGE = '/assets/images/salon/promotion-hero.png';

export const BookingServiceCard = memo(({ booking }) => {
  const { t } = useTranslate();
  const isOnline = booking.deliveryMethod === 'online';
  const s = booking.serviceSummary ?? {};

  const image = s.image ?? FALLBACK_IMAGE;
  const description =
    s.description ||
    (booking.whatsIncluded?.length
      ? booking.whatsIncluded.join(' · ')
      : t('professionalServiceWithProvider', { provider: booking.providerName || t('yourProvider') }));

  const rating = s.rating ?? 0;
  const reviewCount = s.reviewCount ?? 0;
  const distanceKm = s.distanceKm ?? null;
  const durationMins = s.durationMins ?? null;
  const priceText = booking.price != null ? fCurrency(booking.price) : '—';

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35),
          boxShadow: (theme) => `0 8px 28px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
        <Box
          component="img"
          src={image}
          alt={booking.serviceName}
          sx={{
            width: { xs: '100%', sm: 104 },
            height: { xs: 200, sm: 104 },
            borderRadius: 1.5,
            objectFit: 'cover',
            flexShrink: 0,
            bgcolor: 'background.neutral',
          }}
          onError={(e) => {
            const el = e.currentTarget;
            if (el.src.includes(FALLBACK_IMAGE)) return;
            el.src = FALLBACK_IMAGE;
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: -0.2, mb: 0.5 }}>
            {booking.serviceName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.5 }}>
              <Iconify icon="solar:star-bold" width={16} sx={{ color: 'warning.main' }} />
              <Typography component="span" variant="body2" fontWeight={700}>
                {Number(rating).toFixed(1)}
              </Typography>
              <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                {t('reviewCountParens', { count: reviewCount })}
              </Typography>
              {distanceKm != null ? (
                <>
                  <Typography component="span" variant="caption" sx={{ color: 'text.disabled', px: 0.5 }}>
                    ·
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('kmAway', { distance: distanceKm })}
                  </Typography>
                </>
              ) : (
                isOnline && (
                  <>
                    <Typography component="span" variant="caption" sx={{ color: 'text.disabled', px: 0.5 }}>
                      ·
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t('onlineService')}
                    </Typography>
                  </>
                )
              )}
            </Stack>

            <Stack alignItems="flex-end" spacing={0} sx={{ whiteSpace: 'nowrap' }}>
              {booking.actualPrice != null && (
                <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                  {fCurrency(booking.actualPrice)}
                </Typography>
              )}
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {priceText}
                {durationMins != null && (
                  <Typography component="span" variant="caption" fontWeight={500} sx={{ color: 'text.secondary', ml: 0.25 }}>
                    /{t('durationMinsShort', { mins: durationMins })}
                  </Typography>
                )}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
});

BookingServiceCard.displayName = 'BookingServiceCard';
