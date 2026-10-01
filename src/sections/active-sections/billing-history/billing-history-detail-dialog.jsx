import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';

import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';

import { useGetBillingHistoryByIdQuery } from 'src/store/Reducer/bookings-api';

import { normalizeBillingHistoryDetail } from './utils/billing-history-normalizer';

// ----------------------------------------------------------------------

const ACCENT = '#b89a72';

const STATUS_COLOR_MAP = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'info',
  released: 'primary',
  partially_captured: 'warning',
  expired: 'default',
};

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', flex: '0 0 45%' }}>
        {label}
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', flex: '1 1 55%' }}>
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2.5, mb: 1 }}>
      <Iconify icon={icon} width={18} sx={{ color: ACCENT }} />
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
        {title}
      </Typography>
    </Stack>
  );
}

export function BillingHistoryDetailDialog({ open, onClose, bookingId }) {
  const { t } = useTranslate();
  const { data, isLoading, isFetching } = useGetBillingHistoryByIdQuery(bookingId, { skip: !open || !bookingId });

  const detail = data?.data ? normalizeBillingHistoryDetail(data.data) : null;
  const loading = isLoading || isFetching;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper" PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
      <Box
        sx={{
          position: 'relative',
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: (theme) => varAlpha('184 154 114', theme.palette.mode === 'dark' ? 0.16 : 0.1),
        }}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: ACCENT,
              color: 'common.white',
            }}
          >
            <Iconify icon="solar:bill-list-bold" width={22} />
          </Box>

          <Box>
            <Typography variant="h6">{t('billingDetail')}</Typography>
            {detail?.bookingNumber && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {detail.bookingNumber}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Stack>
        )}

        {!loading && !detail && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
            {t('unableToLoadBillingDetail')}
          </Typography>
        )}

        {!loading && detail && (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar alt={detail.customerName} src={detail.customerAvatar} sx={{ width: 44, height: 44, bgcolor: ACCENT, color: 'common.white' }}>
                  {detail.customerInitial}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {detail.customerName || '—'}
                  </Typography>
                  {detail.customerEmail && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      {detail.customerEmail}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 700 }}>
                  {fCurrency(detail.price)}
                </Typography>
                <Label variant="soft" color={STATUS_COLOR_MAP[detail.paymentStatus] || 'default'} sx={{ textTransform: 'capitalize' }}>
                  {detail.paymentStatus ? t(detail.paymentStatus) : '—'}
                </Label>
              </Box>
            </Stack>

            <SectionTitle icon="solar:calendar-mark-bold-duotone" title={t('booking')} />

            <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              <DetailRow
                label={t('servicePackage')}
                value={
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                    <Avatar alt={detail.serviceName} src={detail.serviceImage} variant="rounded" sx={{ width: 28, height: 28, bgcolor: 'background.neutral' }}>
                      <Iconify icon="solar:widget-2-bold-duotone" width={14} sx={{ color: 'text.disabled' }} />
                    </Avatar>
                    <Box component="span">{detail.serviceName || '—'}</Box>
                  </Stack>
                }
              />
              {detail.preferredServiceType && <DetailRow label={t('preferredServiceTypeLabel')} value={detail.preferredServiceType} />}
              {detail.slotOpen && (
                <DetailRow label={t('slot')} value={detail.isOverNight ? `${detail.slotOpen} - ${detail.slotClose} ${t('overnightLabel')}` : `${detail.slotOpen} - ${detail.slotClose}`} />
              )}
              {detail.durationMins ? <DetailRow label={t('duration')} value={t('durationMinsShort', { mins: detail.durationMins })} /> : null}
            </Stack>

            <SectionTitle icon="solar:card-bold-duotone" title={t('payment')} />

            <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {typeof detail.platformFee === 'number' && <DetailRow label={t('platformFee')} value={fCurrency(detail.platformFee)} />}
              <DetailRow label={t('paymentMethod')} value={detail.paymentMethod} />
              <DetailRow
                label={t('transactionId')}
                value={
                  detail.transactionId ? (
                    <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 500 }}>
                      {detail.transactionId}
                    </Box>
                  ) : (
                    '—'
                  )
                }
              />
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
