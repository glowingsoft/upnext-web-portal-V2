import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { m } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import {
  useAcceptBookingMutation,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useGetAdminBookingByIdQuery,
  useGetBookingByIdQuery,
  useRejectBookingMutation,
  useSendBookingReminderMutation,
  useStartBookingMutation,
} from 'src/store/Reducer/bookings-api';
import { varAlpha } from 'src/theme/styles';

import { varHover } from 'src/components/animate';
import { BookingOverviewTab } from './components/booking-overview-tab';
import { CancellationReasonSection } from './components/cancellation-reason-section';
import { BookingReviewTab } from './components/booking-review-tab';
import { CANCEL_RED, CancelBookingDialog } from './components/cancel-booking-dialog';
import { PayNowDialog } from './components/pay-now-dialog';
import { ReviewDialog } from './components/review-dialog';
import { normalizeBooking } from './utils/booking-normalizer';
import { SuggestedServicesSection } from './components/suggested-services-section';

const STATUS_COLOR = {
  requested: 'warning',
  scheduled: 'info',
  ongoing: 'primary',
  completed: 'success',
  expired: 'default',
  canceled: 'error',
};

const REMINDER_TYPES = [
  { type: 'slot', icon: 'solar:calendar-mark-bold', labelKey: 'sendSlotReminder' },
  { type: 'payment', icon: 'solar:wallet-bold-duotone', labelKey: 'sendPaymentReminder' },
  { type: 'start', icon: 'solar:play-circle-bold', labelKey: 'sendStartReminder' },
];

function normalizeSuggestedService(item) {
  const durationMins = item.durationMins ?? item.sessionSlotMins;
  return {
    ...item,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    reviewCount: item.reviewCount ?? item.totalReviews ?? 0,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  };
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) return `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export const BookingDetailView = memo(({ booking, readOnly = false }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const isProvider = userType === 'provider' || userType === 'business';
  const viewerRole = readOnly ? 'admin' : isProvider ? 'provider' : 'customer';

  const [reviewMode, setReviewMode] = useState(null);
  const [payNowOpen, setPayNowOpen] = useState(false);
  const [cancelBookingOpen, setCancelBookingOpen] = useState(false);
  const [cancelDialogVariant, setCancelDialogVariant] = useState('cancel');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });

  const [sessionReview, setSessionReview] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(booking.status);
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus);
  const [cancellationReason, setCancellationReason] = useState(booking.cancel?.reason ?? booking.cancellationReason ?? '');
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedReminderType, setSelectedReminderType] = useState(REMINDER_TYPES[0].type);

  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();
  const [cancelBooking, { isLoading: isCanceling }] = useCancelBookingMutation();
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();
  const [sendBookingReminder, { isLoading: isSendingReminder }] = useSendBookingReminderMutation();
  const [startBooking, { isLoading: isStarting }] = useStartBookingMutation();

  const [secondsUntilCanStart, setSecondsUntilCanStart] = useState(booking.timer?.secondsUntilCanStart ?? null);

  // paymentFixDeadline is an absolute timestamp (not a pre-computed seconds-remaining field like
  // timer.secondsUntilCanStart), so the countdown is derived client-side from it directly.
  const getSecondsUntilPaymentFixDeadline = () => {
    if (!booking.paymentFixDeadline) return null;
    const diff = Math.floor((new Date(booking.paymentFixDeadline).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };
  const [secondsUntilPaymentFixDeadline, setSecondsUntilPaymentFixDeadline] = useState(getSecondsUntilPaymentFixDeadline);

  useEffect(() => {
    setSessionReview(null);
    setBookingStatus(booking.status);
    setPaymentStatus(booking.paymentStatus);
    setCancellationReason(booking.cancel?.reason ?? booking.cancellationReason ?? '');
    setSecondsUntilCanStart(booking.timer?.secondsUntilCanStart ?? null);
    setSecondsUntilPaymentFixDeadline(getSecondsUntilPaymentFixDeadline());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    booking._id,
    booking.status,
    booking.review,
    booking.paymentStatus,
    booking.cancel?.reason,
    booking.cancellationReason,
    booking.timer?.secondsUntilCanStart,
    booking.paymentFixDeadline,
  ]);

  useEffect(() => {
    if (booking.timer?.secondsUntilCanStart == null) return undefined;
    const intervalId = setInterval(() => {
      setSecondsUntilCanStart((prev) => (prev == null || prev <= 0 ? prev : prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [booking._id, booking.timer?.secondsUntilCanStart]);

  useEffect(() => {
    if (!booking.paymentFixDeadline) return undefined;
    const intervalId = setInterval(() => {
      setSecondsUntilPaymentFixDeadline((prev) => (prev == null || prev <= 0 ? prev : prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [booking._id, booking.paymentFixDeadline]);

  // requested   — customer: withdraw request (cancel API) · provider: accept/reject
  // scheduled   — customer: cancel booking · provider: send reminder
  // ongoing     — customer: nothing · provider: complete
  // completed   — both: review section (add on customer side, view/empty-state on provider side)
  // canceled    — both: cancellation reason
  // expired     — details + "Expired" label only, no actions
  const showCustomerCancel = isCustomer && bookingStatus === 'scheduled';
  const showCustomerWithdrawRequest = isCustomer && bookingStatus === 'requested';
  const isPaymentFixRequired = paymentStatus === 'requires_payment_fix';
  const showCustomerPayNow = isCustomer && (paymentStatus === 'pending' || isPaymentFixRequired) && (bookingStatus === 'requested' || bookingStatus === 'scheduled');
  const showProviderAcceptReject = isProvider && bookingStatus === 'requested';
  const showProviderComplete = isProvider && bookingStatus === 'ongoing';
  const showReminder = isProvider && bookingStatus === 'scheduled';
  const showReviewSection = bookingStatus === 'completed';
  const suggestedServices = useMemo(() => (booking.suggestedServices || []).map(normalizeSuggestedService), [booking.suggestedServices]);
  const showSuggestedServices = isCustomer && bookingStatus === 'canceled' && suggestedServices.length > 0;

  // canStart/timer only appear on the booking detail response while status === 'scheduled'.

  const showProviderStart = isProvider && bookingStatus === 'scheduled' && booking.timer != null;
  const canStartNow = Boolean(booking.canStart) || secondsUntilCanStart === 0;

  const isProcessing = isAccepting || isRejecting || isCanceling || isCompleting;

  const handleCancelConfirm = () => setConfirmDialog({ open: false, type: null });
  const handleOpenCancelDialog = (variant = 'cancel') => {
    setCancelDialogVariant(variant);
    setCancelBookingOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelBookingOpen(false);
    setCancelDialogVariant('cancel');
  };

  const handleConfirmAccept = async () => {
    try {
      const result = await acceptBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || 'scheduled');
      toast.success(t('bookingAcceptedSuccess'));
      setConfirmDialog({ open: false, type: null });
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handlePayNowSuccess = (payload) => {
    setPaymentStatus(payload?.booking?.paymentStatus || 'authorized');
    toast.success(t('paymentSuccessful'));
    setPayNowOpen(false);
  };

  const handleStartBooking = async () => {
    try {
      const result = await startBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || 'ongoing');
      toast.success(t('bookingStartedSuccess'));
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleConfirmComplete = async () => {
    try {
      const result = await completeBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || 'completed');
      toast.success(t('bookingCompletedSuccess'));
      setConfirmDialog({ open: false, type: null });
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleCancelOrRejectConfirm = async ({ reason }) => {
    try {
      if (cancelDialogVariant === 'reject') {
        const result = await rejectBooking({ id: booking._id, reason }).unwrap();
        setBookingStatus(result?.data?.status || 'canceled');
        setCancellationReason(reason?.trim() ?? '');
        toast.success(t('bookingRejectedSuccess'));
      } else if (cancelDialogVariant === 'withdraw') {
        const result = await cancelBooking({ id: booking._id, reason }).unwrap();
        setBookingStatus(result?.data?.status || 'canceled');
        setCancellationReason(reason?.trim() ?? '');
        toast.success(t('withdrawRequest'));
      } else {
        const result = await cancelBooking({ id: booking._id, reason }).unwrap();
        setBookingStatus(result?.data?.status || 'canceled');
        setCancellationReason(reason?.trim() ?? '');
        toast.success(t('bookingCancelledSuccess'));
      }
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
      throw error;
    }
  };

  // type: 'payment' | 'slot' | 'start'
  const handleSendReminder = async (type) => {
    try {
      await sendBookingReminder({ id: booking._id, type }).unwrap();
      toast.success(type === 'payment' ? t('sendPaymentReminder') : t('sendReminder'));
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
      throw error;
    }
  };

  const handleOpenReminderDialog = () => {
    setSelectedReminderType(REMINDER_TYPES[0].type);
    setReminderDialogOpen(true);
  };

  const handleCloseReminderDialog = () => {
    if (isSendingReminder) return;
    setReminderDialogOpen(false);
  };

  const handleSubmitReminder = async () => {
    try {
      await handleSendReminder(selectedReminderType);
      setReminderDialogOpen(false);
    } catch (error) {
      // Error already toasted in handleSendReminder — keep the dialog open so the user can retry.
    }
  };

  const fallbackImage = '/assets/images/salon/promotion-hero.png';
  const cover = booking.cover || (booking.photos && booking.photos.length > 0 && typeof booking.photos[0] === 'string' ? booking.photos[0] : fallbackImage);
  const hasRealCover = Boolean(cover) && cover !== fallbackImage && !coverLoadFailed;

  const hasCustomerActions = isCustomer && (showCustomerCancel || (showCustomerPayNow && !isPaymentFixRequired) || showCustomerWithdrawRequest);
  const hasProviderActions = isProvider && (showProviderAcceptReject || showProviderComplete || showReminder);

  const otherParty = isCustomer
    ? { id: booking.providerId, name: booking.providerName, avatar: normalizeImageUrl(booking.business?.image) }
    : { id: booking.clientId, name: booking.client?.name, avatar: normalizeImageUrl(booking.client?.profileIcon) };

  const isMessagingClosed = bookingStatus === 'completed' || bookingStatus === 'canceled' || bookingStatus === 'expired';
  const canMessageOtherParty = !readOnly && (isCustomer || isProvider) && !!otherParty.id && !isMessagingClosed;

  const handleMessage = () => {
    if (!otherParty.id) return;
    router.push(paths.dashboard.chat, {
      state: {
        userId: otherParty.id,
        name: otherParty.name || '',
        profileIcon: otherParty.avatar || '',
        bookingId: booking._id || '',
      },
    });
  };

  const handleViewSuggestedService = (service) => {
    const serviceId = service._id || service.id;
    if (!serviceId) return;
    router.push(readOnly ? paths.adminDashboard.serviceDetails(serviceId) : paths.dashboard.serviceDetails(serviceId));
  };

  const providerConfirmConfig = {
    accept: {
      open: confirmDialog.open && confirmDialog.type === 'accept',
      title: t('acceptBooking'),
      content: t('confirmBookingAction', {
        action: t('accept'),
        name: booking.client?.name || '',
      }),
      color: 'success.main',
      label: t('accept'),
      onConfirm: handleConfirmAccept,
    },
    complete: {
      open: confirmDialog.open && confirmDialog.type === 'complete',
      title: t('completeBookingTitle'),
      content: t('confirmCompleteBookingMessage'),
      color: 'success.main',
      label: t('complete'),
      onConfirm: handleConfirmComplete,
    },
  };
  const activeProviderConfirm = providerConfirmConfig[confirmDialog.type];

  return (
    <>
      <Container
        maxWidth={false}
        sx={{
          pt: 0,
          pb: 3,
          maxWidth: '1500px',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          minHeight: 1,
          bgcolor: (theme) =>
            `linear-gradient(180deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)} 0%, ${theme.vars.palette.background.default} 28%, ${theme.vars.palette.background.default} 100%)`,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<Iconify width={16} height={16} sx={{ fontWeight: 800 }} icon="solar:alt-arrow-left-linear" />}
            onClick={() => router.back()}
            sx={{ color: 'text.primary', fontWeight: 800 }}
          >
            {t('back')}
          </Button>
        </Box>

        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {/* Cover — static warm gradient, matches service/package/customer detail pages */}
          <Box
            sx={{
              height: { xs: 160, md: 200 },
              position: 'relative',
              background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          />

          {/* Info Bar */}
          <Box
            sx={{
              position: 'relative',
              minHeight: 80,
              px: { xs: 2.5, md: 3 },
              py: 2,
              pl: { xs: 18, md: 22 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Rounded rectangle cover overlapping the gradient */}
            <Box
              sx={{
                position: 'absolute',
                left: { xs: 20, md: 40 },
                top: { xs: -24, md: -30 },
                zIndex: 5,
                width: { xs: 88, md: 104 },
                height: { xs: 88, md: 104 },
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '4px solid #fff',
                bgcolor: '#eadfc8',
                boxShadow: (theme) => `0 12px 28px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.28)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasRealCover ? (
                <Box component="img" src={cover} alt={booking.serviceName} onError={() => setCoverLoadFailed(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Iconify icon="solar:calendar-bold" width={36} sx={{ color: '#b79a73' }} />
              )}
            </Box>

            {/* Name + subtitle */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h5" fontWeight={800} noWrap sx={{ lineHeight: 1.2 }}>
                {booking.serviceName}
              </Typography>
              {booking.bookingId && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }} noWrap>
                  {booking.bookingId}
                </Typography>
              )}
            </Box>

            {/* Status chip on right */}
            <Label variant="soft" color={STATUS_COLOR[bookingStatus] ?? 'default'} sx={{ ml: 'auto', flexShrink: 0, fontWeight: 700, textTransform: 'capitalize' }}>
              {t(bookingStatus)}
            </Label>
          </Box>

          {/* Actions Bar */}
          {!readOnly && (hasCustomerActions || hasProviderActions || canMessageOtherParty) && (
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {canMessageOtherParty && (
                <Button
                  component={m.button}
                  whileTap="tap"
                  whileHover="hover"
                  variants={varHover(1.03, 0.99)}
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon="solar:chat-round-dots-bold" width={16} />}
                  onClick={handleMessage}
                >
                  {isCustomer ? t('messageProvider') : t('messageCustomer')}
                </Button>
              )}

              {hasCustomerActions && (
                <>
                  {showCustomerWithdrawRequest && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon="carbon:close" width={16} />}
                      onClick={() => handleOpenCancelDialog('withdraw')}
                      sx={{ bgcolor: CANCEL_RED, '&:hover': { bgcolor: '#6e1818' } }}
                    >
                      {t('withdrawRequest')}
                    </Button>
                  )}

                  {showCustomerCancel && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon="carbon:close" width={16} />}
                      onClick={() => handleOpenCancelDialog('cancel')}
                      sx={{ bgcolor: CANCEL_RED, '&:hover': { bgcolor: '#6e1818' } }}
                    >
                      {t('cancelBooking')}
                    </Button>
                  )}

                  {showCustomerPayNow && !isPaymentFixRequired && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<Iconify icon="solar:wallet-bold-duotone" width={16} />}
                      onClick={() => setPayNowOpen(true)}
                    >
                      {t('payNow')}
                    </Button>
                  )}
                </>
              )}

              {hasProviderActions && (
                <>
                  {showProviderAcceptReject && (
                    <>
                      <Button
                        component={m.button}
                        whileTap="tap"
                        whileHover="hover"
                        variants={varHover(1.03, 0.99)}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Iconify icon="eva:checkmark-fill" width={16} />}
                        onClick={() => setConfirmDialog({ open: true, type: 'accept' })}
                      >
                        {t('accept')}
                      </Button>
                      <Button
                        component={m.button}
                        whileTap="tap"
                        whileHover="hover"
                        variants={varHover(1.03, 0.99)}
                        variant="contained"
                        size="small"
                        startIcon={<Iconify icon="carbon:close" width={16} />}
                        onClick={() => handleOpenCancelDialog('reject')}
                        sx={{ bgcolor: CANCEL_RED, '&:hover': { bgcolor: '#6e1818' } }}
                      >
                        {t('reject')}
                      </Button>
                    </>
                  )}

                  {showProviderComplete && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
                      onClick={() => setConfirmDialog({ open: true, type: 'complete' })}
                    >
                      {t('complete')}
                    </Button>
                  )}

                  {showReminder && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Iconify icon="solar:bell-bold" width={16} />}
                      disabled={isSendingReminder}
                      onClick={handleOpenReminderDialog}
                    >
                      {t('sendReminder')}
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}
        </Card>

        {isCustomer && isPaymentFixRequired && (
          <Box
            sx={{
              position: 'relative',
              mt: 2,
              px: { xs: 2.5, md: 3 },
              py: { xs: 2, md: 2.25 },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.24),
              bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
              '@keyframes paymentFixPulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.35 },
              },
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={1.75} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                  }}
                >
                  <Iconify icon="solar:danger-triangle-bold" width={22} sx={{ color: 'error.main' }} />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.dark' }}>
                    {t('paymentFixDeadlineHint')}
                  </Typography>

                  {secondsUntilPaymentFixDeadline != null && (
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
                      <Iconify icon="solar:hourglass-line-bold" width={15} sx={{ color: 'error.main', animation: 'paymentFixPulse 1.6s ease-in-out infinite' }} />
                      <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 500 }}>
                        {t('cancelsIn')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3 }}>
                        {formatCountdown(secondsUntilPaymentFixDeadline)}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setPayNowOpen(true)}
                startIcon={<Iconify icon="solar:wallet-bold-duotone" width={16} />}
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {t('payNow')}
              </Button>
            </Stack>
          </Box>
        )}

        {showProviderStart && canStartNow && (
          <Box
            sx={{
              position: 'relative',
              mt: 2,
              px: { xs: 2.5, md: 3 },
              py: { xs: 2, md: 2.25 },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.24),
              bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={1.75} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                  }}
                >
                  <Iconify icon="solar:play-circle-bold" width={22} sx={{ color: 'success.main' }} />
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {t('startBookingEarlyHint')}
                </Typography>
              </Stack>

              <Button
                variant="contained"
                color="success"
                size="small"
                disabled={isStarting}
                onClick={handleStartBooking}
                startIcon={<Iconify icon="solar:play-circle-bold" width={16} />}
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {isStarting ? t('processing') : t('startBooking')}
              </Button>
            </Stack>
          </Box>
        )}

        {showProviderStart && !canStartNow && secondsUntilCanStart != null && (
          <Box
            sx={{
              position: 'relative',
              mt: 2,
              px: { xs: 2.5, md: 3 },
              py: { xs: 2, md: 2.25 },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.24),
              bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.08),
              '@keyframes startTimerPulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.35 },
              },
            }}
          >
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.16),
                }}
              >
                <Iconify icon="solar:hourglass-line-bold" width={22} sx={{ color: 'info.main', animation: 'startTimerPulse 1.6s ease-in-out infinite' }} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {t('startBookingCountdownHint')}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 500 }}>
                    {t('startsIn')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3 }}>
                    {formatCountdown(secondsUntilCanStart)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}

        <Stack spacing={2} sx={{ mt: 2 }}>
          <BookingOverviewTab booking={{ ...booking, status: bookingStatus }} viewerRole={viewerRole} />
          {bookingStatus === 'canceled' && cancellationReason && <CancellationReasonSection reason={cancellationReason} />}
          {showSuggestedServices && <SuggestedServicesSection services={suggestedServices} onView={handleViewSuggestedService} />}
          {showReviewSection && (
            <BookingReviewTab
              booking={{ ...booking, status: bookingStatus }}
              review={sessionReview}
              onAdminDeleteReview={() => setSessionReview(null)}
              onReviewSave={(data) => setSessionReview(data)}
            />
          )}
        </Stack>
      </Container>

      <Dialog open={reminderDialogOpen} onClose={handleCloseReminderDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('sendReminder')}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label={t('reminderType')}
            value={selectedReminderType}
            onChange={(event) => setSelectedReminderType(event.target.value)}
            disabled={isSendingReminder}
            sx={{ mt: 1 }}
          >
            {REMINDER_TYPES.map((reminder) => (
              <MenuItem key={reminder.type} value={reminder.type}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={reminder.icon} width={18} />
                  <span>{t(reminder.labelKey)}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseReminderDialog} color="inherit" disabled={isSendingReminder}>
            {t('cancel')}
          </Button>
          <Button variant="contained" color="primary" disabled={isSendingReminder} onClick={handleSubmitReminder}>
            {isSendingReminder ? t('processing') : t('submit')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(activeProviderConfirm?.open)}
        onClose={handleCancelConfirm}
        title={activeProviderConfirm?.title}
        content={activeProviderConfirm?.content}
        action={
          <Box
            component="button"
            type="button"
            onClick={activeProviderConfirm?.onConfirm}
            disabled={isProcessing}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 1,
              border: 'none',
              cursor: 'pointer',
              bgcolor: activeProviderConfirm?.color,
              color: 'common.white',
              fontWeight: 600,
              fontSize: 14,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? t('processing') : activeProviderConfirm?.label}
          </Box>
        }
      />

      <CancelBookingDialog open={cancelBookingOpen} variant={cancelDialogVariant} onClose={handleCloseCancelDialog} onConfirm={handleCancelOrRejectConfirm} />
      <PayNowDialog open={payNowOpen} booking={booking} onClose={() => setPayNowOpen(false)} onPay={handlePayNowSuccess} />

      {reviewMode && (
        <ReviewDialog
          open
          mode={reviewMode}
          review={sessionReview}
          onClose={() => setReviewMode(null)}
          onSubmit={(data) => {
            setSessionReview({
              ...data,
              submittedAt: sessionReview?.submittedAt ?? new Date().toISOString(),
            });
            setReviewMode(null);
          }}
        />
      )}
    </>
  );
});

BookingDetailView.displayName = 'BookingDetailView';

function BookingDetailSkeleton() {
  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto', px: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={90} height={34} />
      </Box>

      <Card sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ position: 'relative', height: { xs: 240, md: 300 } }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 4, pt: 8 }}>
            <Skeleton variant="text" width={260} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.24)' }} />
          </Box>
          <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
            <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.24)' }} />
          </Box>
        </Box>
      </Card>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Card sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="text" width={180} height={28} />
          </Stack>

          <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2, mb: 2.5 }} />

          <Stack spacing={0}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.25 }}>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
                <Skeleton variant="text" width="100%" height={24} />
              </Stack>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export function BookingDetailPageView() {
  const { t, i18n } = useTranslate();
  const { id } = useParams();
  const pathname = usePathname();

  const readOnly = pathname.includes('/admin-dashboard');

  const myLocation = getMyLocation();
  const hasRealMyLocation = isRealCoords(myLocation?.lat, myLocation?.lng);

  const adminResult = useGetAdminBookingByIdQuery(id, { skip: !id || !readOnly });
  const userResult = useGetBookingByIdQuery(
    hasRealMyLocation ? { id, lat: myLocation.lat, lng: myLocation.lng } : id,
    { skip: !id || readOnly }
  );
  const { data: bookingResponse, isLoading, isFetching } = readOnly ? adminResult : userResult;

  // normalizeBooking formats day/date labels via the current dayjs locale — re-run it when
  // the language changes too, not just when the underlying data changes.
  const booking = useMemo(() => {
    const apiBooking = Array.isArray(bookingResponse?.data) ? bookingResponse.data[0] : bookingResponse?.data;
    return apiBooking ? normalizeBooking(apiBooking) : null;
  }, [bookingResponse?.data, i18n.resolvedLanguage]);

  if (isLoading || isFetching) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="warning">{t('bookingNotFound')}</Alert>
      </Container>
    );
  }

  return <BookingDetailView booking={booking} readOnly={readOnly} />;
}
