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
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePathname, useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';

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
import { INSTANT_STATUS_META, humanizeStatus } from 'src/utils/instant-booking-status';
import { SuggestedServicesSection } from './components/suggested-services-section';
import { InstantRequestPanel } from 'src/sections/instant-request/instant-request-panel';
import { CancelInstantBookingDialog } from 'src/sections/instant-request/cancel-instant-booking-dialog';
import { InstantCancellationSummary } from 'src/sections/instant-request/instant-cancellation-summary';
import { ProviderOfferTimer } from 'src/sections/instant-request/provider-offer-timer';
import {
  instantBookingsApi,
  useAcceptInstantOfferMutation,
  useCancelInstantBookingMutation,
  useCompleteInstantBookingMutation,
  useDeclineInstantBookingMutation,
  useCustomerArrivedInstantBookingMutation,
  useGetInstantBookingQuery,
  useStartInstantBookingMutation,
} from 'src/store/Reducer/instant-bookings-api';
import { getLocalInstantDeadline } from 'src/utils/instant-booking-time';

const STATUS_COLOR = {
  requested: 'warning',
  scheduled: 'info',
  ongoing: 'primary',
  completed: 'success',
  expired: 'default',
  canceled: 'error',
};

function formatInstantWhen(raw) {
  const toTime = (value) => {
    const [h, m] = String(value || '').split(':').map(Number);
    if (Number.isNaN(h)) return value || '';
    const d = new Date(2000, 0, 1, h, m || 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const day = raw.date ? new Date(String(raw.date).slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  const time = raw.slot?.open ? `${toTime(raw.slot.open)} – ${toTime(raw.slot.close)}` : '';
  return [day, time].filter(Boolean).join(' · ');
}

function shortBookingRef(value) {
  const ref = String(value || '').replace(/^[A-Z]{1,3}-/, '').split('-')[0];
  return ref ? ref.toUpperCase() : '';
}

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

function formatCancellationCents(cents, currency, unavailable) {
  const amount = Number(cents);
  if (cents == null || !Number.isFinite(amount)) return unavailable;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100);
}

const INSTANT_STATUS_GUIDANCE = {
  requested: {
    severity: 'info',
    customer: {
      title: ['instantRequestedCustomerTitle', 'Request in progress — what happens next?'],
      intro: ['instantRequestedCustomerIntro', 'We are contacting available providers for your appointment.'],
      steps: [
        ['instantRequestedCustomerStep1', 'Watch this page for provider responses and booking updates.'],
        ['instantRequestedCustomerStep2', 'If a request expires or is declined, you can try again or choose another provider.'],
      ],
    },
    provider: {
      title: ['instantRequestedProviderTitle', 'Instant request in progress'],
      intro: ['instantRequestedProviderIntro', 'Review the request and respond before the offer expires.'],
      steps: [
        ['instantRequestedProviderStep1', 'Check the service, appointment time, and customer details.'],
        ['instantRequestedProviderStep2', 'Accept only if you can provide the service at the requested time.'],
      ],
    },
  },
  awaiting_customer_decision: {
    severity: 'info',
    customer: {
      title: ['instantDecisionCustomerTitle', 'Provider response — your decision is needed'],
      intro: ['instantDecisionCustomerIntro', 'A provider is waiting for your response.'],
      steps: [
        ['instantDecisionCustomerStep1', 'Review the provider and offer details.'],
        ['instantDecisionCustomerStep2', 'Accept or decline before the offer expires.'],
      ],
    },
    provider: {
      title: ['instantDecisionProviderTitle', 'Waiting for customer decision'],
      intro: ['instantDecisionProviderIntro', 'The customer is reviewing your offer.'],
      steps: [
        ['instantDecisionProviderStep1', 'Wait for the customer to accept or decline.'],
        ['instantDecisionProviderStep2', 'The booking is not confirmed until the status changes to Confirmed.'],
      ],
    },
  },
  accepted_awaiting_payment: {
    severity: 'warning',
    customer: {
      title: ['instantPaymentPendingCustomerTitle', 'Provider accepted — payment pending'],
      intro: ['instantPaymentPendingCustomerIntro', 'Your booking is not confirmed until the payment step is complete.'],
      steps: [
        ['instantPaymentPendingCustomerStep1', 'Complete any payment action shown on this page.'],
        ['instantPaymentPendingCustomerStep2', 'Wait for the booking status to change to Confirmed before attending.'],
      ],
    },
    provider: {
      title: ['instantPaymentPendingProviderTitle', 'Waiting for customer payment'],
      intro: ['instantPaymentPendingProviderIntro', 'The booking is not confirmed until the customer payment step is complete.'],
      steps: [
        ['instantPaymentPendingProviderStep1', 'Wait for the status to change to Confirmed before starting the service.'],
        ['instantPaymentPendingProviderStep2', 'Check the booking for payment and status updates.'],
      ],
    },
  },
  confirmed: {
    severity: 'success',
    customer: {
      title: ['instantConfirmedNextStepsTitle', 'Booking confirmed — what happens next?'],
      intro: ['instantConfirmedCustomerIntro', 'Your appointment is confirmed. Here are the next steps:'],
      steps: [
        ['instantConfirmedCustomerStep1', 'Review the appointment date, time, service, and provider details above.'],
        ['instantConfirmedCustomerStep2', 'Message your provider if you need to coordinate arrival, access, or other details.'],
        ['instantConfirmedCustomerStep3', 'Be ready at the scheduled time. Check Booking overview for payment and cancellation details.'],
      ],
    },
    provider: {
      title: ['instantConfirmedNextStepsTitle', 'Booking confirmed — what happens next?'],
      intro: ['instantConfirmedProviderIntro', 'The customer’s appointment is confirmed. Prepare for the scheduled service:'],
      steps: [
        ['instantConfirmedProviderStep1', 'Review the service, appointment time, and customer details.'],
        ['instantConfirmedProviderStep2', 'Message the customer if you need to coordinate access or special requirements.'],
        ['instantConfirmedProviderStep3', 'After the customer marks arrival, use Start to begin the session.'],
      ],
    },
  },
  ongoing: {
    severity: 'info',
    customer: {
      title: ['instantOngoingCustomerTitle', 'Your session is in progress'],
      intro: ['instantOngoingCustomerIntro', 'Your provider has started the appointment.'],
      steps: [
        ['instantOngoingCustomerStep1', 'Message your provider if you need help during the service.'],
        ['instantOngoingCustomerStep2', 'Review the booking overview for payment and service details.'],
      ],
    },
    provider: {
      title: ['instantOngoingProviderTitle', 'Session in progress'],
      intro: ['instantOngoingProviderIntro', 'The appointment is underway.'],
      steps: [
        ['instantOngoingProviderStep1', 'Complete the booked service and keep the customer informed.'],
        ['instantOngoingProviderStep2', 'Mark the booking complete when the service is finished.'],
      ],
    },
  },
  completed: {
    severity: 'success',
    customer: {
      title: ['instantCompletedCustomerTitle', 'Session completed'],
      intro: ['instantCompletedCustomerIntro', 'Your instant booking is complete.'],
      steps: [
        ['instantCompletedCustomerStep1', 'Review the final payment and booking details.'],
        ['instantCompletedCustomerStep2', 'Share your experience by leaving a review.'],
      ],
    },
    provider: {
      title: ['instantCompletedProviderTitle', 'Booking completed'],
      intro: ['instantCompletedProviderIntro', 'The service has been marked complete.'],
      steps: [
        ['instantCompletedProviderStep1', 'Review payout and deductions in the booking overview.'],
        ['instantCompletedProviderStep2', 'Follow up with the customer if needed.'],
      ],
    },
  },
  canceled: {
    severity: 'warning',
    customer: {
      title: ['instantCanceledCustomerTitle', 'Booking canceled'],
      intro: ['instantCanceledCustomerIntro', 'This instant booking is no longer active.'],
      steps: [
        ['instantCanceledCustomerStep1', 'Review the cancellation and refund details in the booking overview.'],
        ['instantCanceledCustomerStep2', 'Create a new request if you still need this service.'],
      ],
    },
    provider: {
      title: ['instantCanceledProviderTitle', 'Booking canceled'],
      intro: ['instantCanceledProviderIntro', 'This instant booking is no longer active.'],
      steps: [
        ['instantCanceledProviderStep1', 'Review the cancellation reason and any penalty in the booking overview.'],
        ['instantCanceledProviderStep2', 'Do not attend or perform the canceled service.'],
      ],
    },
  },
  expired: {
    severity: 'warning',
    customer: {
      title: ['instantExpiredCustomerTitle', 'Request expired'],
      intro: ['instantExpiredCustomerIntro', 'No provider accepted this request before it expired.'],
      steps: [
        ['instantExpiredCustomerStep1', 'Send the request again or choose another provider.'],
        ['instantExpiredCustomerStep2', 'Check the appointment details before retrying.'],
      ],
    },
    provider: {
      title: ['instantExpiredProviderTitle', 'Offer expired'],
      intro: ['instantExpiredProviderIntro', 'This request is no longer available to accept.'],
      steps: [
        ['instantExpiredProviderStep1', 'No action is needed for this expired offer.'],
        ['instantExpiredProviderStep2', 'New booking requests will appear in Live Booking Offers.'],
      ],
    },
  },
};

function InstantBookingStatusGuidance({ status, isCustomer, t }) {
  const guidance = INSTANT_STATUS_GUIDANCE[status];
  if (!guidance) return null;

  const copy = guidance[isCustomer ? 'customer' : 'provider'];
  const statusColor = INSTANT_STATUS_META[status]?.color;
  const alertSeverity = statusColor === 'primary' ? 'info' : guidance.severity;
  const resolveText = ([key, fallback]) => t(key, { defaultValue: fallback });

  return (
    <Alert
      severity={alertSeverity}
      icon={
        <Iconify
          icon={
            status === 'ongoing'
              ? 'solar:play-circle-bold'
              : guidance.severity === 'success'
                ? 'solar:check-circle-bold'
                : 'solar:info-circle-bold'
          }
        />
      }
      sx={{
        mb: 2,
        ...(['success', 'warning', 'info'].includes(alertSeverity) && {
          bgcolor: (theme) => varAlpha(theme.vars.palette[alertSeverity].mainChannel, 0.08),
          color: `${alertSeverity}.dark`,
          border: (theme) => `1px solid ${varAlpha(theme.vars.palette[alertSeverity].mainChannel, 0.2)}`,
          '& .MuiAlert-icon': { color: `${alertSeverity}.main` },
        }),
        ...(statusColor === 'primary' && {
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          color: 'primary.dark',
          border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
          '& .MuiAlert-icon': { color: 'primary.main' },
        }),
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {resolveText(copy.title)}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {resolveText(copy.intro)}
      </Typography>
      <Stack component="ol" spacing={0.5} sx={{ mt: 1, mb: 0, pl: 2.5 }}>
        {copy.steps.map(([key, fallback]) => (
          <Typography key={key} component="li" variant="body2">
            {resolveText([key, fallback])}
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
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

export const BookingDetailView = memo(({ booking, readOnly = false, instantOfferStatus, isRefreshing = false }) => {
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
  const [instantCancelOpen, setInstantCancelOpen] = useState(false);
  const [instantArrivalActionDone, setInstantArrivalActionDone] = useState(false);
  const [instantNow, setInstantNow] = useState(() => Date.now());
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus);
  const [cancellationReason, setCancellationReason] = useState(booking.cancel?.reason ?? booking.cancellationReason ?? '');
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedReminderType, setSelectedReminderType] = useState(REMINDER_TYPES[0].type);

  const [acceptBooking, { isLoading: isAcceptingRegular }] = useAcceptBookingMutation();
  const [rejectBooking, { isLoading: isRejectingRegular }] = useRejectBookingMutation();
  const [acceptInstantOffer, { isLoading: isAcceptingInstant }] = useAcceptInstantOfferMutation();
  const [declineInstantBooking, { isLoading: isDecliningInstant }] = useDeclineInstantBookingMutation();
  const isRejecting = isRejectingRegular || isDecliningInstant;
  const isAccepting = isAcceptingRegular || isAcceptingInstant;
  const [cancelBooking, { isLoading: isCanceling }] = useCancelBookingMutation();
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();
  const [sendBookingReminder, { isLoading: isSendingReminder }] = useSendBookingReminderMutation();
  const [startBooking, { isLoading: isStarting }] = useStartBookingMutation();
  const [cancelInstantBooking, { isLoading: isCancelingInstant }] = useCancelInstantBookingMutation();
  const [startInstantBooking, { isLoading: isStartingInstant }] = useStartInstantBookingMutation();
  const [customerArrivedInstantBooking, { isLoading: isMarkingInstantArrival }] = useCustomerArrivedInstantBookingMutation();
  const [completeInstantBooking, { isLoading: isCompletingInstant }] = useCompleteInstantBookingMutation();

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

  useEffect(() => {
    if (!booking.instant?.flow?.appointmentStart) return undefined;
    const intervalId = setInterval(() => setInstantNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [booking._id, booking.instant?.flow?.appointmentStart]);

  useEffect(() => {
    setInstantArrivalActionDone(false);
  }, [booking._id]);

  // requested   — customer: withdraw request (cancel API) · provider: accept/reject
  // scheduled   — customer: cancel booking · provider: send reminder
  // ongoing     — customer: nothing · provider: complete
  // completed   — both: review section (add on customer side, view/empty-state on provider side)
  // canceled    — both: cancellation reason
  // expired     — details + "Expired" label only, no actions
  const isInstant = Boolean(booking.instant);
  const instantAppointmentStart = booking.instant?.flow?.appointmentStart || booking.flow?.appointmentStart;
  const instantAppointmentStartMs = instantAppointmentStart ? Date.parse(instantAppointmentStart) : NaN;
  const instantArrivalAvailable =
    Boolean(booking.canStart || booking.instant?.canStart) ||
    (Number.isFinite(instantAppointmentStartMs) && instantNow >= instantAppointmentStartMs - 5 * 60 * 1000);
  const customerArrived = Boolean(
    booking.instant?.checkIns?.customerArrived ||
      booking.checkIns?.customerArrived ||
      booking.instant?.customerArrived ||
      booking.customerArrived ||
      booking.instant?.flow?.customerArrived ||
      instantArrivalActionDone
  );
  const showInstantArrived =
    isInstant &&
    bookingStatus === 'confirmed' &&
    instantArrivalAvailable &&
    !customerArrived &&
    (isCustomer || isProvider);
  const showInstantProviderStart =
    isInstant && isProvider && bookingStatus === 'confirmed' && instantArrivalAvailable && customerArrived;
  const showInstantArrivalBadge =
    isInstant && customerArrived && ['confirmed', 'ongoing'].includes(bookingStatus) && (isCustomer || isProvider);
  const showInstantStatusGuidance =
    isInstant && (isCustomer || isProvider) && Boolean(INSTANT_STATUS_GUIDANCE[bookingStatus]);
  const showInstantCancel = isInstant && ['accepted_awaiting_payment', 'confirmed'].includes(bookingStatus) && (isCustomer || isProvider);
  const showCustomerCancel = isCustomer && !isInstant && bookingStatus === 'scheduled';
  const showCustomerWithdrawRequest = isCustomer && !isInstant && bookingStatus === 'requested';
  const isPaymentFixRequired = paymentStatus === 'requires_payment_fix';
  const showCustomerPayNow = isCustomer && !isInstant && (paymentStatus === 'pending' || isPaymentFixRequired) && (bookingStatus === 'requested' || bookingStatus === 'scheduled');
  const showProviderAcceptReject = isProvider && bookingStatus === 'requested';
  const showProviderComplete = isProvider && bookingStatus === 'ongoing';
  const showReminder = isProvider && bookingStatus === 'scheduled';
  const showReviewSection = bookingStatus === 'completed';
  const suggestedServices = useMemo(() => (booking.suggestedServices || []).map(normalizeSuggestedService), [booking.suggestedServices]);
  const showSuggestedServices = isCustomer && bookingStatus === 'canceled' && suggestedServices.length > 0;

  // canStart/timer only appear on the booking detail response while status === 'scheduled'.

  const showProviderStart =
    (isProvider && bookingStatus === 'scheduled' && booking.timer != null) || showInstantProviderStart;
  const canStartNow = Boolean(booking.canStart) || secondsUntilCanStart === 0 || showInstantProviderStart;

  const isProcessing =
    isAccepting ||
    isRejecting ||
    isCanceling ||
    isCancelingInstant ||
    isCompleting ||
    isStartingInstant ||
    isMarkingInstantArrival ||
    isCompletingInstant;

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
      let result;
      if (booking.instant) {
        const offerId = booking.instant.flow?.currentOffer?.offerId;
        if (!offerId) {
          toast.error('This request is no longer waiting for your answer.');
          setConfirmDialog({ open: false, type: null });
          return;
        }
        result = await acceptInstantOffer(offerId).unwrap();
        setBookingStatus(result?.data?.status || result?.data?.booking?.status || 'accepted_awaiting_payment');
        toast.success(t('bookingAcceptedSuccess'));
        setConfirmDialog({ open: false, type: null });
        return;
      }
      result = await acceptBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || 'scheduled');
      toast.success(t('bookingAcceptedSuccess'));
      setConfirmDialog({ open: false, type: null });
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleConfirmInstantCancel = async () => {
    try {
      const result = await cancelInstantBooking({
        id: booking._id,
        reason: isProvider ? 'provider' : 'client',
      }).unwrap();
      setBookingStatus(result?.data?.status || result?.data?.booking?.status || 'canceled');
      toast.success(t('bookingCancelledSuccess'));
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
      const result = isInstant
        ? await startInstantBooking(booking._id).unwrap()
        : await startBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || result?.data?.booking?.status || 'ongoing');
      toast.success(t('bookingStartedSuccess'));
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleInstantCustomerArrived = async () => {
    try {
      const result = await customerArrivedInstantBooking(booking._id).unwrap();
      setInstantArrivalActionDone(true);
      if (result?.data?.status) setBookingStatus(result.data.status);
      toast.success(t(isCustomer ? 'iHaveArrived' : 'customerArrived', {
        defaultValue: isCustomer ? 'Arrival reported' : 'Customer arrival reported',
      }));
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleConfirmComplete = async () => {
    try {
      const result = isInstant
        ? await completeInstantBooking({ id: booking._id }).unwrap()
        : await completeBooking(booking._id).unwrap();
      setBookingStatus(result?.data?.status || result?.data?.booking?.status || 'completed');
      toast.success(t('bookingCompletedSuccess'));
      setConfirmDialog({ open: false, type: null });
    } catch (error) {
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleCancelOrRejectConfirm = async ({ reason }) => {
    try {
      if (cancelDialogVariant === 'reject' && booking.instant) {
        const result = await declineInstantBooking(booking._id).unwrap();
        setBookingStatus(result?.data?.status || result?.data?.booking?.status || 'declined');
        setCancellationReason(reason?.trim() ?? '');
        toast.success(t('bookingRejectedSuccess'));
      } else if (cancelDialogVariant === 'reject') {
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

  const hasCustomerActions = isCustomer && (showCustomerCancel || (showCustomerPayNow && !isPaymentFixRequired) || showCustomerWithdrawRequest || showInstantCancel || showInstantArrived);
  const hasProviderActions = isProvider && (showProviderAcceptReject || showProviderComplete || showReminder || showInstantCancel || showInstantArrived);

  const otherParty = isCustomer
    ? { id: booking.providerId, name: booking.providerName, avatar: normalizeImageUrl(booking.business?.image) }
    : { id: booking.clientId, name: booking.client?.name, avatar: normalizeImageUrl(booking.client?.profileIcon) };

  const isMessagingClosed = bookingStatus === 'completed' || bookingStatus === 'canceled' || bookingStatus === 'expired';
  const canMessageOtherParty = !readOnly && (isCustomer || isProvider) && !!otherParty.id && !isMessagingClosed && booking.canMessage !== false;

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

  const cancellationImpact = booking.instant?.cancellationImpact || {};
  const cancellationCurrency = booking.instant?.currency || booking.instant?.pricing?.currency || 'USD';
  const unavailableAmount = t('notAvailable');
  const instantCancelContent = (
    <Stack spacing={1.5}>
      <Typography variant="body2">{t('instantCancelImpactIntro')}</Typography>
      {isCustomer && (
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="body2">
            {t('instantCustomerCancellationFee')}: {formatCancellationCents(cancellationImpact.customer?.feeCents, cancellationCurrency, unavailableAmount)}
          </Typography>
          <Typography variant="body2">
            {t('instantCustomerRefund')}: {formatCancellationCents(cancellationImpact.customer?.refundCents, cancellationCurrency, unavailableAmount)}
          </Typography>
        </Box>
      )}
      {isProvider && (
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="body2">
            {t('instantProviderCancellationPenalty')}: {formatCancellationCents(cancellationImpact.provider?.penaltyCents, cancellationCurrency, unavailableAmount)}
          </Typography>
        </Box>
      )}
    </Stack>
  );

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
    'instant-cancel': {
      open: confirmDialog.open && confirmDialog.type === 'instant-cancel',
      title: t('cancelBooking'),
      content: instantCancelContent,
      color: 'error.main',
      label: t('cancelBooking'),
      onConfirm: handleConfirmInstantCancel,
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
              <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 0.5, columnGap: 1.5, rowGap: 0.5, color: 'text.secondary' }}>
                {booking.bookingId && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    component="button"
                    type="button"
                    title="Copy booking ID"
                    onClick={() => {
                      navigator.clipboard?.writeText(booking.bookingId);
                      toast.success('Booking ID copied');
                    }}
                    sx={{ p: 0, border: 'none', bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Booking #{shortBookingRef(booking.bookingId)}
                    </Typography>
                    <Iconify icon="solar:copy-linear" width={15} />
                  </Stack>
                )}
                {(booking.day || booking.slot) && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="solar:calendar-linear" width={15} />
                    <Typography variant="body2" noWrap>
                      {booking.instant?.slot?.open ? formatInstantWhen(booking.instant) : [booking.day, booking.slot].filter(Boolean).join(' · ')}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Status chip on right */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-end', sm: 'center' }}
              spacing={0.75}
              sx={{ ml: 'auto', flexShrink: 0 }}
            >
              {booking.instant ? (
                <Label
                  variant="soft"
                  color={INSTANT_STATUS_META[bookingStatus]?.color ?? 'default'}
                  startIcon={<Iconify icon={INSTANT_STATUS_META[bookingStatus]?.icon ?? 'solar:info-circle-bold'} width={16} />}
                  sx={{ fontWeight: 700, height: 28, px: 1.25 }}
                >
                  {INSTANT_STATUS_META[bookingStatus]?.label ?? humanizeStatus(bookingStatus)}
                </Label>
              ) : (
                <Label variant="soft" color={STATUS_COLOR[bookingStatus] ?? 'default'} sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {t(bookingStatus, { defaultValue: humanizeStatus(bookingStatus) })}
                </Label>
              )}
              {showInstantArrivalBadge && (
                <Label
                  variant="soft"
                  color="success"
                  startIcon={<Iconify icon="solar:user-check-rounded-bold" width={14} />}
                  sx={{ height: 28, px: 1.25, whiteSpace: 'nowrap' }}
                >
                  {isCustomer
                    ? t('youArrived', { defaultValue: 'You arrived' })
                    : t('customerArrived', { defaultValue: 'Customer arrived' })}
                </Label>
              )}
            </Stack>
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
                '& > .MuiButton-root': {
                  width: { xs: '100%', sm: 158 },
                  minWidth: { xs: '100%', sm: 158 },
                  height: 36,
                  whiteSpace: 'nowrap',
                },
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

                  {showInstantCancel && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon="carbon:close" width={16} />}
                      onClick={() => setInstantCancelOpen(true)}
                      sx={{ bgcolor: CANCEL_RED, '&:hover': { bgcolor: '#6e1818' } }}
                    >
                      {t('cancelBooking')}
                    </Button>
                  )}

                  {showInstantArrived && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      color="info"
                      size="small"
                      startIcon={<Iconify icon="solar:map-point-bold" width={16} />}
                      disabled={isMarkingInstantArrival}
                      onClick={handleInstantCustomerArrived}
                    >
                      {isMarkingInstantArrival
                        ? t('processing')
                        : t('iHaveArrived', { defaultValue: 'I have arrived' })}
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

                  {showInstantCancel && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon="carbon:close" width={16} />}
                      onClick={() => setInstantCancelOpen(true)}
                      sx={{ bgcolor: CANCEL_RED, '&:hover': { bgcolor: '#6e1818' } }}
                    >
                      {t('cancelBooking')}
                    </Button>
                  )}

                  {showInstantArrived && (
                    <Button
                      component={m.button}
                      whileTap="tap"
                      whileHover="hover"
                      variants={varHover(1.03, 0.99)}
                      variant="contained"
                      color="info"
                      size="small"
                      startIcon={<Iconify icon="solar:user-check-rounded-bold" width={16} />}
                      disabled={isMarkingInstantArrival}
                      onClick={handleInstantCustomerArrived}
                    >
                      {isMarkingInstantArrival
                        ? t('processing')
                        : t('customerArrived', { defaultValue: 'Customer arrived' })}
                    </Button>
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
                      sx={{ fontWeight: 700 }}
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
                color="primary"
                size="small"
                disabled={isStarting || isStartingInstant}
                onClick={handleStartBooking}
                startIcon={<Iconify icon="solar:play-circle-bold" width={16} />}
                sx={{ width: 158, minWidth: 158, height: 36, flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {isStarting || isStartingInstant ? t('processing') : t('startBooking')}
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
          {showInstantStatusGuidance && (
            <InstantBookingStatusGuidance status={bookingStatus} isCustomer={isCustomer} t={t} />
          )}
          {isProvider && isInstant && bookingStatus === 'requested' && <ProviderOfferTimer booking={{ ...booking.instant, status: bookingStatus }} />}
          {isCustomer && isInstant && (
            <InstantRequestPanel
              booking={booking.instant}
              offerStatus={instantOfferStatus}
              isRefreshing={isRefreshing}
            />
          )}
          <BookingOverviewTab booking={{ ...booking, status: bookingStatus }} viewerRole={viewerRole} />
          {bookingStatus === 'canceled' && isInstant && booking.instant?.cancellation ? (
            <InstantCancellationSummary booking={booking.instant} viewer={isProvider ? 'provider' : 'customer'} providerName={booking.providerName || booking.business?.businessName} />
          ) : (
            bookingStatus === 'canceled' && cancellationReason && <CancellationReasonSection reason={cancellationReason} />
          )}
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
      {(isCustomer || isProvider) && isInstant && (
        <CancelInstantBookingDialog
          open={instantCancelOpen}
          bookingId={booking._id}
          viewer={isProvider ? 'provider' : 'customer'}
          onClose={() => setInstantCancelOpen(false)}
          onCancelled={() => setBookingStatus('canceled')}
        />
      )}

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
  const searchParams = useSearchParams();

  const dispatch = useDispatch();
  const [instantOfferStatus, setInstantOfferStatus] = useState(null);
  const readOnly = pathname.includes('/admin-dashboard');
  const viewer = useSelector((state) => state.user?.user);
  const viewerType = viewer?.accountState?.userType;
  const isCustomerViewer = !readOnly && (viewerType === 'user' || viewerType === 'customer');
  const isProviderViewer = !readOnly && (viewerType === 'provider' || viewerType === 'business');
  const isInstantBookingViewer = (isCustomerViewer || isProviderViewer) && searchParams.get('mode') === 'instant';
  const { socket } = useChatSocketContext();

  useEffect(() => {
    setInstantOfferStatus(null);
  }, [id]);

  const myLocation = getMyLocation();
  const hasRealMyLocation = isRealCoords(myLocation?.lat, myLocation?.lng);

  const adminResult = useGetAdminBookingByIdQuery(id, { skip: !id || !readOnly });
  const userResult = useGetBookingByIdQuery(
    hasRealMyLocation ? { id, lat: myLocation.lat, lng: myLocation.lng } : id,
    { skip: !id || readOnly || isInstantBookingViewer }
  );
  const instantResult = useGetInstantBookingQuery(id, { skip: !id || !isInstantBookingViewer });
  const { data: bookingResponse, isLoading, isFetching } = readOnly ? adminResult : isInstantBookingViewer ? instantResult : userResult;

  useEffect(() => {
    if (!socket || !id || !isInstantBookingViewer) return undefined;

    const updateBookingFromEvent = (payload, statusOverride, ignoreEventStatus = false) => {
      if (payload?.bookingId !== id) return;
      const eventBooking = payload?.booking || payload?.data?.booking || payload?.data || payload;
      const status = statusOverride ?? (ignoreEventStatus ? undefined : payload?.status ?? eventBooking?.status);
      const paymentStatus =
        payload?.paymentStatus ??
        payload?.paymentInfo?.status ??
        payload?.payment?.status ??
        eventBooking?.paymentStatus ??
        eventBooking?.paymentInfo?.status ??
        eventBooking?.payment?.status;
      if (!status && !paymentStatus) return;

      dispatch(
        instantBookingsApi.util.updateQueryData('getInstantBooking', id, (draft) => {
          const apiBooking = Array.isArray(draft?.data) ? draft.data[0] : draft?.data;
          if (!apiBooking) return;
          if (status) apiBooking.status = status;
          if (paymentStatus) apiBooking.paymentStatus = paymentStatus;
        })
      );
    };

    const handleOfferReceived = (payload) => {
      updateBookingFromEvent(payload, 'requested');
      if (payload?.bookingId !== id) return;
      setInstantOfferStatus('pending');

      const deadline = getLocalInstantDeadline(payload.expiresAt, payload.serverNow);
      if (deadline == null) return;
      dispatch(
        instantBookingsApi.util.updateQueryData('getInstantBooking', id, (draft) => {
          const apiBooking = Array.isArray(draft?.data) ? draft.data[0] : draft?.data;
          if (apiBooking) {
            apiBooking.offerExpiresAt = payload.expiresAt;
            apiBooking.serverNow = payload.serverNow;
            apiBooking.flow = apiBooking.flow || {};
            apiBooking.flow.currentOffer = apiBooking.flow.currentOffer || {};
            apiBooking.flow.currentOffer.expiresAt = payload.expiresAt;
            apiBooking.flow.currentOffer.serverNow = payload.serverNow;
          }
        })
      );
    };
    const handleOfferClosed = (payload) => {
      if (payload?.bookingId !== id) return;
      const isOfferStatus = ['pending', 'accepted', 'declined', 'expired', 'closed'].includes(payload.status);
      if (isOfferStatus) setInstantOfferStatus(payload.status);
      updateBookingFromEvent(payload, undefined, isOfferStatus);
      dispatch(instantBookingsApi.util.invalidateTags([{ type: 'instantBooking', id }]));
    };
    const handleBookingStatusChanged = (payload) => {
      if (payload?.bookingId !== id) return;
      if (payload.status && payload.status !== 'requested') setInstantOfferStatus(null);
      updateBookingFromEvent(payload);
      dispatch(instantBookingsApi.util.invalidateTags([{ type: 'instantBooking', id }]));
    };
    const handleBookingPaymentUpdated = (payload) => {
      const eventBooking = payload?.booking || payload?.data?.booking || payload?.data || payload;
      const bookingId = payload?.bookingId ?? payload?.instantBookingId ?? eventBooking?._id;
      if (bookingId !== id) return;
      const paymentStatus =
        payload?.paymentStatus ??
        payload?.paymentInfo?.status ??
        payload?.payment?.status ??
        eventBooking?.paymentStatus ??
        eventBooking?.paymentInfo?.status ??
        eventBooking?.payment?.status ??
        payload?.status;
      if (paymentStatus) {
        dispatch(
          instantBookingsApi.util.updateQueryData('getInstantBooking', id, (draft) => {
            const apiBooking = Array.isArray(draft?.data) ? draft.data[0] : draft?.data;
            if (apiBooking) apiBooking.paymentStatus = paymentStatus;
          })
        );
      }
      dispatch(instantBookingsApi.util.invalidateTags([{ type: 'instantBooking', id }]));
    };

    socket.on('offerReceived', handleOfferReceived);
    socket.on('offerClosed', handleOfferClosed);
    socket.on('bookingStatusChanged', handleBookingStatusChanged);
    socket.on('bookingPaymentUpdated', handleBookingPaymentUpdated);

    return () => {
      socket.off('offerReceived', handleOfferReceived);
      socket.off('offerClosed', handleOfferClosed);
      socket.off('bookingStatusChanged', handleBookingStatusChanged);
      socket.off('bookingPaymentUpdated', handleBookingPaymentUpdated);
    };
  }, [dispatch, id, isInstantBookingViewer, socket]);

  // normalizeBooking formats day/date labels via the current dayjs locale — re-run it when
  // the language changes too, not just when the underlying data changes.
  const booking = useMemo(() => {
    let apiBooking = Array.isArray(bookingResponse?.data) ? bookingResponse.data[0] : bookingResponse?.data;
    if (apiBooking && isInstantBookingViewer) apiBooking = { ...apiBooking, mode: 'instant' };
    return apiBooking ? normalizeBooking(apiBooking) : null;
  }, [bookingResponse?.data, i18n.resolvedLanguage, isInstantBookingViewer]);

  if (isLoading || (isFetching && !bookingResponse)) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="warning">{t('bookingNotFound')}</Alert>
      </Container>
    );
  }

  return (
    <BookingDetailView
      booking={booking}
      readOnly={readOnly}
      instantOfferStatus={instantOfferStatus}
      isRefreshing={isFetching}
    />
  );
}
