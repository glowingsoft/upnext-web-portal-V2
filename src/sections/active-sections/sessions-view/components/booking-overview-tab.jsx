import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { PhotosGallery } from 'src/components/photos-gallery';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { capitalizeFirstLetter, fDate, formatStr } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { BookingServiceCard } from './booking-service-card';
import { formatPaymentStatusLabel, getPaymentStatusColor } from '../utils/booking-normalizer';

function DetailRow({ icon, label, value, color = 'primary' }) {
  const isDefault = color === 'default';
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ py: 1.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isDefault
            ? (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12)
            : (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
          color: isDefault ? 'text.disabled' : `${color}.main`,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} sx={{ flex: 1, minWidth: 0 }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 0 }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
          ) : (
            value
          )}
        </Box>
      </Stack>
    </Stack>
  );
}

export const BookingOverviewTab = memo(({ booking, viewerRole = 'customer' }) => {
  const { t } = useTranslate();
  const savingsKey = viewerRole === 'admin' ? 'discountAppliedAmount' : viewerRole === 'provider' ? 'customerSaved' : 'youSaved';
  const isSubscription = booking.serviceType === 'subscription' || Boolean(booking.daysCombination?.length);
  const isOnsite = booking.deliveryMethod === 'onsite';

  const showCurrentDay = isSubscription && booking.status === 'ongoing' && (booking.sessionSubState === 'in_progress' || booking.sessionSubState === 'awaiting_start');
  const dayLabel = showCurrentDay ? t('currentDay') : t('upcomingDay');
  const slotsLabel = showCurrentDay ? t('currentSlot') : t('upcomingSlot');
  const dayValue = showCurrentDay ? booking.currentDay : booking.upcomingDay;
  const slotsValue = showCurrentDay ? booking.currentSlots : booking.upcomingSlots;

  const venueLocationValue =
    booking.venueLocation != null &&
    (booking.venueMapUrl ? (
      <Link
        href={booking.venueMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        fontWeight={600}
        underline="hover"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        {booking.venueLocation}
        <Iconify icon="eva:external-link-fill" width={14} />
      </Link>
    ) : (
      booking.venueLocation
    ));

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        boxShadow: (theme) => `0 12px 40px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
      }}
    >
      {/* Header band */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.75}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: (theme) => `linear-gradient(135deg, ${theme.vars.palette.primary.dark} 0%, ${theme.vars.palette.primary.main} 100%)`,
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 90, width: 100, height: 100, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

        <Box
          sx={{
            position: 'relative',
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha('255 255 255', 0.18),
          }}
        >
          <Iconify icon="solar:bill-list-bold-duotone" width={22} sx={{ color: 'common.white' }} />
        </Box>
        <Typography variant="h6" sx={{ position: 'relative', fontWeight: 800, letterSpacing: -0.3, color: 'common.white' }}>
          {t('bookingOverview')}
        </Typography>
      </Stack>

      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {/* Customer */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
                <Iconify icon="solar:user-rounded-bold" width={14} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('customer')}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={booking.client?.profileIcon}
                  sx={{
                    width: 44,
                    height: 44,
                    fontSize: 15,
                    fontWeight: 800,
                    border: '2px solid',
                    borderColor: 'divider',
                    bgcolor: 'primary.lighter',
                    color: 'primary.dark',
                  }}
                >
                  {booking.client?.initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ lineHeight: 1.3 }}>
                    {booking.client?.name}
                  </Typography>
                  {booking.client?.email && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                      {booking.client.email}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* Service Provider / Business */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
                <Iconify icon="solar:shop-bold" width={14} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('serviceProvider')}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={booking.business?.image}
                  variant="rounded"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    border: '2px solid',
                    borderColor: 'divider',
                    bgcolor: 'primary.lighter',
                    color: 'primary.dark',
                  }}
                >
                  <Iconify icon="solar:shop-bold" width={20} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ lineHeight: 1.3 }}>
                    {booking.providerName ?? t('notAvailable')}
                  </Typography>
                  {booking.venueLocation && (
                    booking.venueMapUrl ? (
                      <Link
                        href={booking.venueMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        noWrap
                        underline="hover"
                        sx={{ display: 'block', color: 'text.secondary' }}
                      >
                        {booking.venueLocation}
                      </Link>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                        {booking.venueLocation}
                      </Typography>
                    )
                  )}
                </Box>
              </Stack>
            </Box>
          </Box>

          {booking.requestedAt && (
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1, textAlign: 'right' }}>
              {t('requested')} {fDate(booking.requestedAt, formatStr.date)}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', mb: 1.25 }}>
            {t('bookedService')}
          </Typography>
          <BookingServiceCard booking={booking} />
        </Box>

        {booking.photos?.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <PhotosGallery photos={booking.photos} altPrefix="Booking photo" />
          </Box>
        )}

        {booking.price != null && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
              border: (theme) => `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                    color: 'success.dark',
                  }}
                >
                  <Iconify icon="solar:wallet-bold-duotone" width={20} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {t('price')}
                </Typography>
              </Stack>

              <Stack alignItems="flex-end" spacing={0.25}>
                {booking.actualPrice != null && (
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                    {fCurrency(booking.actualPrice)}
                  </Typography>
                )}
                <Typography variant="h5" fontWeight={800} sx={{ color: 'success.dark' }}>
                  {fCurrency(booking.price)}
                </Typography>
              </Stack>
            </Box>

            {booking.actualPrice != null && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  mt: 1.25,
                  pt: 1.25,
                  borderTop: (theme) => `dashed 1px ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                }}
              >
                <Iconify icon="solar:tag-price-bold" width={16} sx={{ color: 'success.dark' }} />
                <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 700 }}>
                  {t(savingsKey, { amount: fCurrency(booking.actualPrice - booking.price) })}
                </Typography>
              </Stack>
            )}
          </Box>
        )}

        <Stack divider={<Divider sx={{ borderStyle: 'dashed', opacity: 0.7 }} />}>
          {booking.bookingId != null && <DetailRow icon="solar:hashtag-square-bold" label={t('bookingReference')} value={booking.bookingId} color="secondary" />}

          {booking.preferredServiceType != null && (
            <DetailRow icon="solar:map-point-bold" label={t('preferredLocation')} value={booking.preferredServiceType} color="secondary" />
          )}

          {!isSubscription && (
            <>
              {booking.day != null && <DetailRow icon="solar:calendar-bold-duotone" label={t('day')} value={booking.day} color="info" />}

              {booking.slot != null && <DetailRow icon="solar:clock-circle-bold" label={t('time')} value={booking.slot} color="warning" />}

              {isOnsite && booking.venueTitle != null && <DetailRow icon="solar:buildings-bold" label={t('venue')} value={booking.venueTitle} color="primary" />}

              {isOnsite && booking.venueLocation != null && <DetailRow icon="solar:map-point-bold" label={t('location')} value={venueLocationValue} color="error" />}
            </>
          )}

          {isSubscription && (
            <>
              {dayValue != null && <DetailRow icon="solar:calendar-bold" label={dayLabel} value={dayValue} color="info" />}
              {slotsValue != null && <DetailRow icon="solar:clock-circle-bold" label={slotsLabel} value={slotsValue} color="warning" />}
              {booking.daysCombination?.length > 0 && (
                <Box sx={{ py: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 1.5, pb: 0.5 }}>
                    <Iconify icon="solar:calendar-minimalistic-bold" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t('daysAndSlots')}
                    </Typography>
                  </Stack>
                  <Stack spacing={0}>
                    {booking.daysCombination.map((day) => (
                      <DetailRow key={day} icon="solar:calendar-bold" label={day} value={booking.daySlots?.[day] ?? t('notAvailable')} color="info" />
                    ))}
                  </Stack>
                </Box>
              )}
              {isOnsite && (
                <>
                  {booking.venueTitle != null && <DetailRow icon="solar:buildings-bold" label={t('venue')} value={booking.venueTitle} color="primary" />}
                  {booking.venueLocation != null && <DetailRow icon="solar:map-point-bold" label={t('location')} value={venueLocationValue} color="error" />}
                </>
              )}
              {booking.weekNumber != null && <DetailRow icon="solar:hashtag-square-bold" label={t('weekNumber')} value={booking.weekNumber} color="secondary" />}
            </>
          )}

          {booking.paymentStatus != null && (
            <DetailRow
              icon="solar:card-bold"
              label={t('payment')}
              color={getPaymentStatusColor(booking.paymentStatus)}
              value={
                <Label variant="soft" color={getPaymentStatusColor(booking.paymentStatus)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  {t(booking.paymentStatus, { defaultValue: formatPaymentStatusLabel(booking.paymentStatus) })}
                </Label>
              }
            />
          )}

          {booking.status === 'requested' && booking.expiresAt != null && (
            <DetailRow
              icon="solar:hourglass-line-bold"
              label={t('expiresAt')}
              value={fDate(booking.expiresAt, formatStr.dateTime)}
              color="error"
            />
          )}

          {booking.sessionSubState != null && (
            <DetailRow
              icon="solar:play-stream-bold"
              label={t('sessionProgress')}
              value={String(booking.sessionSubState)
                .split('_')
                .map((w) => capitalizeFirstLetter(w))
                .join(' ')}
              color="primary"
            />
          )}
        </Stack>
      </Box>
    </Card>
  );
});

BookingOverviewTab.displayName = 'BookingOverviewTab';
