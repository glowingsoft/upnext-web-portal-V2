import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, Link, Skeleton, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { useGetSlotsQuery } from 'src/store/Reducer/bookings-api';
import { PayNowDialog } from './pay-now-dialog';

dayjs.extend(customParseFormat);

const API_SLOT_SCOPES = { service: 'service', package: 'package' };
const TIME_PARSE_FORMATS = ['HH:mm', 'H:mm', 'h:mm A', 'hh:mm A'];

export function BookingScheduleDialogs({ bookingItem, title, onCloseBooking, onBooked, type, autoAccept = false, initialPromoCode }) {
  const { t } = useTranslate();
  const router = useRouter();

  const [openPolicy, setOpenPolicy] = useState(false);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const [payNowOpen, setPayNowOpen] = useState(false);

  const [paymentBooking, setPaymentBooking] = useState(null);

  useEffect(() => {
    if (bookingItem) {
      setSelectedDate(dayjs());
      setSelectedSlot(null);
      setAcceptPolicy(false);
      setOpenPolicy(false);
    }
  }, [bookingItem]);

  const slotsScope = API_SLOT_SCOPES[type];
  const slotsTargetId = bookingItem?._id;
  const slotsDate = selectedDate?.isValid?.() ? selectedDate.format('YYYY-MM-DD') : null;
  const isItemUnavailable = bookingItem?.isAvailable === false;

  const { data: slotsData, error: slotsError, isFetching: isSlotsFetching } = useGetSlotsQuery(
    { scope: slotsScope, targetId: slotsTargetId, date: slotsDate },
    { skip: !bookingItem || !slotsScope || !slotsTargetId || !slotsDate || isItemUnavailable }
  );

  const slotsErrorMessage = isItemUnavailable
    ? t('unavailableForBookingMessage', { type: t(type === 'package' ? 'package' : 'service') })
    : slotsError
      ? slotsError?.data?.message || slotsError?.message || t('somethingWentWrongTryAgain')
      : null;

  // The "outstanding payment" block isn't a slot-availability issue, so the "try a different
  // date" hint (meant for genuinely unavailable slots) doesn't apply here.
  const isOutstandingDebtError = !isItemUnavailable && /outstanding/i.test(slotsError?.data?.message || '');

  const getFallbackSlots = (item, date) => {
    const dateKey = date?.format?.('YYYY-MM-DD');

    return item?.slots?.[dateKey] || ['10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];
  };

  const slots = !bookingItem
    ? []
    : slotsScope
      ? slotsData?.data?.slots ?? slotsData?.data ?? []
      : getFallbackSlots(bookingItem, selectedDate);

  const servicePrice = bookingItem?.type === 'online' ? bookingItem?.pricePerSession : bookingItem?.price;

  const refundPercentage = Number(bookingItem?.refundPercentage ?? 20);

  const refundAmount = servicePrice != null ? fCurrency((Number(servicePrice) * refundPercentage) / 100) : null;

  const refundRulesText = bookingItem?.refundRules || t('refundCalculatedFromCancellationPolicy');

  const serviceImage = bookingItem?.image || bookingItem?.photo || bookingItem?.photos?.[0];

  const scheduleTypeWord = t(type === 'package' ? 'package' : 'service');
  const scheduleType = `${scheduleTypeWord.charAt(0).toUpperCase()}${scheduleTypeWord.slice(1)}`;
  const scheduleActionLabel = t('confirmBooking');

  const getDurationMins = () => {
    if (bookingItem?.durationMins) return Number(bookingItem.durationMins);

    const durationText = String(bookingItem?.duration || '');
    const durationValue = Number(durationText.match(/\d+/)?.[0]);

    if (!durationValue) return 60;

    return durationText.toLowerCase().includes('hour') ? durationValue * 60 : durationValue;
  };

  const getSlotStart = (slot) => {
    if (typeof slot === 'string') {
      return slot.split('-')[0].trim();
    }

    return slot?.open || slot?.start || slot?.startTime || '';
  };

  const getSlotEnd = (slot) => {
    if (typeof slot !== 'string' && (slot?.close || slot?.end || slot?.endTime)) {
      return slot.close || slot.end || slot.endTime;
    }

    const start = getSlotStart(slot);
    const slotParts = typeof slot === 'string' ? slot.split('-').map((part) => part.trim()) : [];

    if (slotParts.length > 1) {
      return slotParts[1] || '';
    }

    const parsedStart = dayjs(start, TIME_PARSE_FORMATS);

    if (!parsedStart.isValid()) return '';

    return parsedStart.add(getDurationMins(), 'minute').format('h:mm A');
  };

  const formatSlotTime = (value) => {
    if (!value) return '';

    const parsed = dayjs(value, TIME_PARSE_FORMATS, true);

    return parsed.isValid() ? parsed.format('h:mm A') : value;
  };

  const getSlotLabel = (slot) => {
    const start = formatSlotTime(getSlotStart(slot));
    const end = formatSlotTime(getSlotEnd(slot));

    return end ? `${start} - ${end}` : start;
  };

  const isSlotBookable = (slot) => {
    if (typeof slot === 'string') return true;
    if (slot?.status && slot.status !== 'available') return false;
    if (slot?.availableSpots != null && Number(slot.availableSpots) <= 0) return false;

    return true;
  };

  const isPastSlotForSelectedDate = (slot) => {
    if (!selectedDate?.isValid?.() || !selectedDate.isSame(dayjs(), 'day')) {
      return false;
    }

    const startText = getSlotStart(slot);
    const normalizedStart = String(startText).split('-')[0].trim();
    const parsedStart = dayjs(normalizedStart, TIME_PARSE_FORMATS);

    if (!parsedStart.isValid()) {
      return false;
    }

    const slotDateTime = selectedDate
      .hour(parsedStart.hour())
      .minute(parsedStart.minute())
      .second(0)
      .millisecond(0);

    return slotDateTime.isBefore(dayjs());
  };

  const getSlotKey = (slot) => {
    if (typeof slot === 'string') return slot;

    return slot?.id || `${getSlotStart(slot)}-${getSlotEnd(slot)}`;
  };

  const availableSlots = slots.filter((slot) => isSlotBookable(slot) && !isPastSlotForSelectedDate(slot));

  useEffect(() => {
    if (!selectedSlot) return;

    const slotStillAvailable = availableSlots.some((slot) => getSlotKey(slot) === selectedSlot);
    if (!slotStillAvailable) {
      setSelectedSlot(null);
    }
  }, [availableSlots, selectedSlot]);

  const serviceDetails = [
    servicePrice != null && { icon: 'solar:wallet-money-bold', value: fCurrency(servicePrice) },
    (bookingItem?.duration || bookingItem?.durationMins) && {
      icon: 'solar:clock-circle-bold',
      value: bookingItem?.duration || `${bookingItem.durationMins} ${t('mins')}`,
    },
  ].filter(Boolean);

  const handleCloseBooking = () => {
    setSelectedSlot(null);
    setAcceptPolicy(false);
    setOpenPolicy(false);
    onCloseBooking();
  };

  const handleScheduleBooking = () => {
    const slot = availableSlots.find((item) => getSlotKey(item) === selectedSlot);

    setPaymentBooking({
      ...bookingItem,
      bookingDate: selectedDate?.format('YYYY-MM-DD'),
      bookingSlotLabel: slot ? getSlotLabel(slot) : selectedSlot,
      ...(slotsScope && slot
        ? { bookingScope: slotsScope, bookingTargetId: slotsTargetId, bookingSlot: slot }
        : {}),
    });
    setPayNowOpen(true);
    handleCloseBooking();
  };

  const handlePayNowClose = () => {
    setPayNowOpen(false);
    setPaymentBooking(null);
  };

  const handlePayNowSuccess = (payment) => {
    toast.success(
      autoAccept
        ? t('bookingConfirmedSuccessfully', { type: scheduleType })
        : t('requestSentSuccessfully', { type: scheduleType })
    );
    if (onBooked) onBooked({ ...paymentBooking, payment });

    const createdBookingId = payment?.booking?._id;
    if (createdBookingId) {
      router.push(paths.dashboard.bookingSuccess(createdBookingId));
    }
  };

  return (
    <>
      <Dialog open={Boolean(bookingItem)} onClose={handleCloseBooking} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {bookingItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:calendar-add-bold" width={22} sx={{ color: 'primary.main' }} />
                <span>{title || t('bookAppointment')}</span>
              </Stack>
              <IconButton
                aria-label={t('close')}
                onClick={handleCloseBooking}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  color: 'text.secondary',
                }}
              >
                <Iconify icon="mingcute:close-line" width={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ pt: 0.5 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
                    bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {serviceImage ? (
                      <Box
                        component="img"
                        src={serviceImage}
                        alt={bookingItem.name}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          objectFit: 'cover',
                          flexShrink: 0,
                          bgcolor: 'background.neutral',
                          boxShadow: (theme) => `0 8px 18px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          color: 'primary.main',
                          bgcolor: 'background.paper',
                          boxShadow: (theme) => `0 8px 18px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
                        }}
                      >
                        <Iconify icon="solar:calendar-add-bold" width={21} />
                      </Box>
                    )}

                    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.25 }}>
                        {bookingItem.name}
                      </Typography>

                      {serviceDetails.length > 0 && (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.9 }}>
                          {serviceDetails.map((item) => (
                            <Stack
                              key={`${item.icon}-${item.value}`}
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                              }}
                            >
                              <Iconify icon={item.icon} width={14} />
                              <Typography variant="caption" fontWeight={700}>
                                {item.value}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>

                <DatePicker
                  label={t('selectDate')}
                  value={selectedDate}
                  disablePast
                  disabled={isItemUnavailable}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Iconify icon="solar:clock-circle-bold" width={18} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        {t('selectSlot')}
                      </Typography>
                    </Stack>
                    {!isSlotsFetching && availableSlots.length > 0 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {t('slotsAvailableCount', { count: availableSlots.length })}
                      </Typography>
                    )}
                  </Stack>

                  {isSlotsFetching ? (
                    <Grid container spacing={1.25}>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Skeleton variant="rounded" height={46} sx={{ borderRadius: 1.5 }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : slotsErrorMessage ? (
                    <Stack
                      alignItems="center"
                      spacing={1}
                      sx={{
                        py: 3,
                        px: 2,
                        textAlign: 'center',
                        borderRadius: 1.5,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.06),
                        border: '1px dashed',
                        borderColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.24),
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12),
                          color: 'error.main',
                        }}
                      >
                        <Iconify icon="solar:close-circle-bold" width={22} />
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: 'error.main' }}>
                        {slotsErrorMessage}
                      </Typography>
                      {!isOutstandingDebtError && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 280 }}>
                          {isItemUnavailable ? t('checkBackLaterOrChooseHint') : t('unavailableSlotsHint')}
                        </Typography>
                      )}
                    </Stack>
                  ) : availableSlots.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Iconify icon="solar:calendar-mark-bold" width={26} sx={{ color: 'text.disabled', mb: 0.75 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('noAvailableSlotsForDate')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        maxHeight: 280,
                        overflowY: 'auto',
                        pr: 0.5,
                        mr: -0.5,
                      }}
                    >
                      <Grid container spacing={1.25}>
                        {availableSlots.map((slot) => {
                          const slotKey = getSlotKey(slot);
                          const selected = selectedSlot === slotKey;

                          return (
                            <Grid item xs={12} sm={6} key={slotKey}>
                              <Box
                                component="button"
                                type="button"
                                onClick={() => setSelectedSlot(slotKey)}
                                sx={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 1,
                                  px: 1.5,
                                  py: 1.1,
                                  borderRadius: 1.5,
                                  border: '1px solid',
                                  borderColor: selected ? 'primary.main' : 'divider',
                                  bgcolor: selected ? 'primary.main' : 'background.paper',
                                  color: selected ? 'primary.contrastText' : 'text.primary',
                                  cursor: 'pointer',
                                  font: 'inherit',
                                  transition: 'all 0.18s ease',
                                  boxShadow: selected ? (theme) => `0 8px 18px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}` : 'none',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-1px)',
                                    ...(!selected && { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06) }),
                                  },
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Iconify icon="solar:clock-circle-bold" width={15} sx={{ color: selected ? 'inherit' : 'text.secondary' }} />
                                  <Typography variant="body2" fontWeight={700}>
                                    {getSlotLabel(slot)}
                                  </Typography>
                                </Stack>
                                {selected && <Iconify icon="solar:check-circle-bold" width={17} />}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </Box>

                <FormControlLabel
                  control={<Checkbox checked={acceptPolicy} onChange={(e) => setAcceptPolicy(e.target.checked)} size="small" />}
                  label={
                    <Typography variant="body2">
                      {t('iAccept')}{' '}
                      <Link component="button" underline="always" onClick={() => setOpenPolicy(true)}>
                        {t('refundRules')}
                      </Link>
                    </Typography>
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseBooking} color="inherit">
                {t('cancel')}
              </Button>
              <Button variant="contained" color="primary" disabled={!selectedSlot || !acceptPolicy} onClick={handleScheduleBooking}>
                {scheduleActionLabel}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={openPolicy} onClose={() => setOpenPolicy(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            bgcolor: (theme) => varAlpha('184 154 114', theme.palette.mode === 'dark' ? 0.16 : 0.1),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: 'common.white',
                bgcolor: '#b89a72',
                boxShadow: '0 8px 20px rgba(184, 154, 114, 0.45)',
              }}
            >
              <Iconify icon="solar:hand-money-bold" width={22} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={900} sx={{ color: 'text.primary' }}>
                {t('refundPercentage')}{' '}
                <Box component="span" sx={{ color: '#b89a72' }}>
                  ({refundPercentage}%)
                </Box>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {refundAmount ? t('refundAmountOnCancel', { amount: refundAmount }) : t('refundCalculatedFromRules')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <Iconify icon="solar:document-text-bold" width={18} sx={{ color: '#b89a72' }} />
            <Typography variant="subtitle2" fontWeight={900} sx={{ color: 'text.primary' }}>
              {t('refundDetails')}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
            {refundRulesText}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
          <Button
            fullWidth
            onClick={() => setOpenPolicy(false)}
            sx={{
              py: 1.1,
              borderRadius: 999,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#b89a72',
              color: 'common.white',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#a3855f', boxShadow: 'none' },
            }}
          >
            {t('gotIt')}
          </Button>
        </DialogActions>
      </Dialog>

      <PayNowDialog open={payNowOpen} booking={paymentBooking} initialPromoCode={initialPromoCode} onClose={handlePayNowClose} onPay={handlePayNowSuccess} />
    </>
  );
}
