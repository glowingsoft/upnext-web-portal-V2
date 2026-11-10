import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

function getReasonDetails(reason, t) {
  const blocker = reason && typeof reason === 'object' ? reason : {};
  if (blocker.code === 'active_bookings') {
    return {
      title: t('deletionBlockerActiveBookingsTitle'),
      details: t('deletionBlockerActiveBookings', { count: blocker.count }),
      count: blocker.count,
      icon: 'solar:calendar-bold',
    };
  }

  if (blocker.code === 'pending_payments') {
    return {
      title: t('deletionBlockerPendingPaymentsTitle'),
      details: t('deletionBlockerPendingPayments', {
        bookingCount: blocker.bookingCount,
        paymentCount: blocker.paymentCount,
      }),
      count: blocker.paymentCount,
      icon: 'solar:wallet-money-bold',
    };
  }

  const reasonName = String(blocker.translationKey || blocker.code || '')
    .replace(/^user_deletion_blocked_/, '')
    .replace(/_/g, ' ');
  const counts = Object.entries(blocker)
    .filter(([key, value]) => key !== 'code' && key !== 'translationKey' && typeof value === 'number')
    .map(([key, value]) => `${key.replace(/Count$/, '').replace(/([A-Z])/g, ' $1')}: ${value}`);

  return {
    title: reasonName || t('deletionBlockedGenericReason'),
    details: counts.join(' · ') || t('deletionBlockedGenericDetails'),
    count: Number.isFinite(blocker.count) ? blocker.count : undefined,
    icon: 'solar:document-text-bold',
  };
}

export function UserDeletionEligibilityChecklist({ eligibility }) {
  const { t } = useTranslate();
  const blockingReasons = Array.isArray(eligibility?.blockingReasons) ? eligibility.blockingReasons : [];

  return (
    <Box
      sx={{
        mt: 2,
        p: 1.5,
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 1.5,
        bgcolor: 'primary.lighter',
      }}
    >
      {blockingReasons.length > 0 ? (
        <Stack spacing={1.25}>
          <Typography variant="caption" sx={{ px: 0.25, color: 'text.secondary' }}>
            {t('deletionBlockedSubtitle')}
          </Typography>
          {blockingReasons.map((reason, index) => {
            const details = getReasonDetails(reason, t);

            return (
              <Box
                key={`${reason?.code || reason?.translationKey || 'reason'}-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'primary.lighter',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    borderRadius: 1.25,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon={details.icon} width={19} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {details.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'text.secondary' }}>
                    {details.details}
                  </Typography>
                </Box>
                {Number.isFinite(details.count) && details.count > 0 && (
                  <Chip size="small" color="primary" variant="soft" label={details.count} sx={{ height: 24, minWidth: 24, fontWeight: 700 }} />
                )}
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2">{t('deletionBlockedNoReasons')}</Typography>
      )}
    </Box>
  );
}

UserDeletionEligibilityChecklist.propTypes = {
  eligibility: PropTypes.object.isRequired,
};
