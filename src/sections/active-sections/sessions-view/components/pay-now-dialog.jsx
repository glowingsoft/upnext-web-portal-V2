import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';
import { useCreateBookingMutation, useFixBookingPaymentMutation, usePayOutstandingBookingMutation } from 'src/store/Reducer/bookings-api';
import { useCheckPromoCodeMutation } from 'src/store/Reducer/services-api';
import { useAddCardMutation, useGetCardsQuery } from 'src/store/Reducer/cards-api';
import { stripePromise } from 'src/lib/stripe';

import { normalizeCard } from '../../cards-view/cards-data';

const ACCENT = '#a68e6b';
const PRICE_AMOUNT_COLOR = '#a68e6b';
const NEW_CARD_OPTION = 'new';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1f120a',
      fontFamily: '"Public Sans", sans-serif',
      '::placeholder': { color: '#919EAB' },
    },
    invalid: { color: '#FF5630' },
  },
};

function parsePrice(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}


function PriceCard({ label, amount }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        px: 2.5,
        py: 2.25,
        borderRadius: 2.5,
        bgcolor: 'common.white',
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.1),
        boxShadow: (theme) => `0 6px 20px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.1)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(166, 142, 107, 0.08) 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          position: 'relative',
          color: 'text.secondary',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          position: 'relative',
          mt: 0.75,
          fontWeight: 700,
          fontSize: { xs: 28, sm: 30 },
          lineHeight: 1.15,
          color: PRICE_AMOUNT_COLOR,
          letterSpacing: '-0.02em',
        }}
      >
        {fCurrency(amount)}
      </Typography>
    </Box>
  );
}

function SelectableRow({ selected, icon, onClick, children, trailing }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: selected ? ACCENT : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
        bgcolor: selected ? varAlpha('166 142 107', 0.08) : (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.6),
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
      }}
    >
      <Iconify icon={icon} width={20} sx={{ color: selected ? ACCENT : 'text.disabled', flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      {trailing}
    </Box>
  );
}

function PayNowDialogContent({ open, booking, initialPromoCode, variant = 'fixPayment', onClose, onPay }) {
  const { t } = useTranslate();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useSelector((state) => state.user);

  const [applyPromo, setApplyPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState('idle');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(NEW_CARD_OPTION);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [fixBookingPayment, { isLoading: isFixingPayment }] = useFixBookingPaymentMutation();
  const [payOutstandingBooking, { isLoading: isPayingOutstanding }] = usePayOutstandingBookingMutation();
  const [checkPromoCode, { isLoading: isCheckingPromo }] = useCheckPromoCodeMutation();
  const { data: cardsData, isLoading: isLoadingCards } = useGetCardsQuery(undefined, { skip: !open });
  const [addCard] = useAddCardMutation();

  const isProcessing = isSubmitting || isCreatingBooking || isFixingPayment || isPayingOutstanding;
  const isAddingNewCard = selectedCardId === NEW_CARD_OPTION;

  const customerName = user?.displayName || user?.basicInfo?.name || '';
  const customerEmail = user?.email || user?.basicInfo?.email || '';

  const savedCards = useMemo(() => (cardsData?.data || []).map(normalizeCard), [cardsData]);

  const basePrice = useMemo(() => parsePrice(booking?.price), [booking?.price]);

  const priceAfterDiscount = useMemo(() => {
    if (promoStatus !== 'valid' || !promoDiscount) return basePrice;
    return promoDiscount.finalPrice ?? basePrice;
  }, [basePrice, promoStatus, promoDiscount]);

  const resetPromoState = () => {
    setPromoStatus('idle');
    setPromoDiscount(null);
    setPromoMessage('');
  };

  const handlePromoCodeChange = (event) => {
    setPromoCode(event.target.value);
    resetPromoState();
  };

  const handleApplyPromoCode = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;

    if (!booking?.bookingScope || !booking?.bookingTargetId) {
      setPromoStatus('invalid');
      setPromoMessage(t('promoCodeUnavailable'));
      return;
    }

    setPromoStatus('checking');
    setPromoMessage('');

    try {
      const result = await checkPromoCode({
        promoCode: trimmedCode,
        scope: booking.bookingScope,
        targetId: booking.bookingTargetId,
      }).unwrap();

      const promotion = result?.data || {};
      setPromoDiscount({
        promotionId: promotion.promotionId,
        discountType: promotion.discountType,
        discount: promotion.discount,
        discountAmount: promotion.discountAmount,
        finalPrice: promotion.finalPrice,
      });
      setPromoStatus('valid');
      setPromoMessage(t('promoCodeApplied'));
    } catch (error) {
      setPromoStatus('invalid');
      setPromoMessage(error?.data?.message || t('promoCodeInvalid'));
    }
  };

  // Coming from "Claim Offer", the promo code is already known — pre-fill and verify it
  // automatically instead of making the customer re-type the code they just clicked through on.
  useEffect(() => {
    if (open && initialPromoCode) {
      setApplyPromo(true);
      setPromoCode(initialPromoCode);
    }
  }, [open, initialPromoCode]);

  useEffect(() => {
    if (
      open &&
      initialPromoCode &&
      promoCode === initialPromoCode &&
      promoStatus === 'idle' &&
      booking?.bookingScope &&
      booking?.bookingTargetId
    ) {
      handleApplyPromoCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPromoCode, promoCode, promoStatus, booking?.bookingScope, booking?.bookingTargetId]);

  // Default to the customer's saved default card (or their only saved card) once the list has
  // loaded, so they aren't forced to re-enter card details every time. Only runs once per time
  // the dialog opens — the ref guards against re-running on every re-render while it's open.
  const hasInitializedSelectionRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasInitializedSelectionRef.current = false;
      return;
    }
    if (hasInitializedSelectionRef.current || isLoadingCards) return;

    hasInitializedSelectionRef.current = true;
    if (savedCards.length > 0) {
      const defaultCard = savedCards.find((card) => card.isDefault) || savedCards[0];
      setSelectedCardId(defaultCard.id);
    } else {
      setSelectedCardId(NEW_CARD_OPTION);
    }
  }, [open, isLoadingCards, savedCards]);

  const handleClose = () => {
    if (isProcessing) return;
    setPromoCode('');
    setApplyPromo(false);
    resetPromoState();
    setCardComplete(false);
    setPaymentError(null);
    setSaveNewCard(false);
    elements?.getElement(CardElement)?.clear();
    onClose();
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setPaymentError(event.error ? event.error.message : null);
  };

  const handlePay = async () => {
    if (isProcessing) return;

    setPaymentError(null);

    if (!stripe || (isAddingNewCard && !elements)) {
      setPaymentError(t('paymentNotReady'));
      return;
    }

    let cardElement = null;
    if (isAddingNewCard) {
      cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setPaymentError(t('cardInfoUnavailable'));
        return;
      }

      if (!cardComplete) {
        setPaymentError(t('cardInfoIncomplete'));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let paymentMethodId;

      if (isAddingNewCard) {
        const paymentMethodResult = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            ...(customerName ? { name: customerName } : {}),
            ...(customerEmail ? { email: customerEmail } : {}),
          },
        });

        if (paymentMethodResult.error) {
          throw new Error(paymentMethodResult.error.message || t('paymentMethodFailed'));
        }

        paymentMethodId = paymentMethodResult.paymentMethod.id;

        if (saveNewCard) {
          // Saving for later is a convenience on top of this payment, not a requirement of it —
          // if it fails, warn but still let the actual booking payment go through below.
          try {
            await addCard({ paymentMethodId, cardHolderName: customerName, setDefault: false }).unwrap();
          } catch (saveCardError) {
            toast.error(saveCardError?.data?.message || t('failedToSaveCardForFuture'));
          }
        }
      } else {
        const selectedCard = savedCards.find((card) => card.id === selectedCardId);
        if (!selectedCard?.stripePaymentMethodId) {
          throw new Error(t('cardInfoUnavailable'));
        }
        paymentMethodId = selectedCard.stripePaymentMethodId;
      }

      const isPromoValid = applyPromo && promoStatus === 'valid';
      const verifiedPromoCode = isPromoValid ? promoCode.trim() : '';
      const verifiedPromotionId = isPromoValid ? promoDiscount?.promotionId : '';

      // The backend creates a PaymentIntent/SetupIntent server-side and hands back a clientSecret
      // whenever it needs confirming — Stripe.js only surfaces the 3D Secure challenge once we
      // actually call confirmCardPayment/confirmCardSetup with it. Skipping this step is why SCA
      // cards were silently leaving bookings stuck on "pending" with no prompt ever shown.
      const confirmIntentIfNeeded = async (data) => {
        const clientSecret = data?.clientSecret;
        if (!clientSecret) return;

        const confirm = data?.intentType === 'setup' ? stripe.confirmCardSetup : stripe.confirmCardPayment;
        const { error, paymentIntent, setupIntent } = await confirm(clientSecret);

        if (error) {
          throw new Error(error.message || t('paymentAuthenticationFailed'));
        }

        const intent = paymentIntent || setupIntent;
        if (intent && !['succeeded', 'requires_capture'].includes(intent.status)) {
          throw new Error(t('paymentNotCompleted'));
        }
      };

      const canCreateBooking = booking?.bookingScope && booking?.bookingTargetId && booking?.bookingSlot;

      if (!canCreateBooking) {
        // No cart-shape fields — this is retrying/fixing payment on an already-existing booking
        // rather than creating a new one. Two distinct endpoints depending on why: requires_payment_fix
        // (fixBookingPayment) vs. settling an overdue/outstanding booking (payOutstandingBooking).
        if (booking?._id) {
          const payResult =
            variant === 'outstandingDebt'
              ? await payOutstandingBooking({ id: booking._id, stripePaymentMethodId: paymentMethodId }).unwrap()
              : await fixBookingPayment({ id: booking._id, paymentMethod: paymentMethodId }).unwrap();
          await confirmIntentIfNeeded(payResult?.data);
          onPay?.({ paymentMethodId, amount: priceAfterDiscount, booking: payResult?.data?.booking ?? payResult?.data });
          handleClose();
          return;
        }

        onPay?.({ paymentMethodId, promoCode: verifiedPromoCode, promotionId: verifiedPromotionId, amount: priceAfterDiscount });
        handleClose();
        return;
      }

      const result = await createBooking({
        scope: booking.bookingScope,
        targetId: booking.bookingTargetId,
        date: booking.bookingDate,
        slot: booking.bookingSlot,
        paymentMethod: paymentMethodId,
        promotionId: verifiedPromotionId,
      }).unwrap();

      await confirmIntentIfNeeded(result?.data);

      // The booking record can come back either as data.booking (alongside a Stripe
      // clientSecret/intentType when a setup/payment intent needs confirming) or as data itself.
      onPay?.({ paymentMethodId, promoCode: verifiedPromoCode, promotionId: verifiedPromotionId, amount: priceAfterDiscount, booking: result?.data?.booking ?? result?.data });
      handleClose();
    } catch (err) {
      const message = err?.data?.message || err?.message || t('bookingFailed');
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: (theme) => `0 24px 48px -12px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.24)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          pt: 3.5,
          pb: 3,
          px: 3,
          background: `linear-gradient(135deg, #8a7052 0%, ${ACCENT} 100%)`,
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, left: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -20, width: 150, height: 150, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

        <IconButton
          size="small"
          onClick={handleClose}
          disabled={isProcessing}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'common.white',
            bgcolor: varAlpha('255 255 255', 0.14),
            '&:hover': { bgcolor: varAlpha('255 255 255', 0.24) },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>

        <Box
          sx={{
            position: 'relative',
            mx: 'auto',
            mb: 1.5,
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha('255 255 255', 0.16),
          }}
        >
          <Iconify icon="solar:card-send-bold" width={28} sx={{ color: 'common.white' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'common.white', position: 'relative' }}>
          {t('payNow')}
        </Typography>
        <Typography variant="body2" sx={{ color: varAlpha('255 255 255', 0.85), mt: 0.5, position: 'relative' }}>
          {t('secureCheckoutStripe')}
        </Typography>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3, pb: 3 }}>
        <Stack spacing={2.5}>
          <PriceCard label={t('price')} amount={basePrice} />

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('applyPromoCode')}
              </Typography>
              <Switch
                checked={applyPromo}
                onChange={(event) => setApplyPromo(event.target.checked)}
                disabled={isProcessing}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT },
                }}
              />
            </Stack>

            {applyPromo && (
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('promoCode')}
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    disabled={isProcessing || isCheckingPromo}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:tag-price-bold" width={18} sx={{ color: ACCENT }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.6),
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={!promoCode.trim() || isProcessing || isCheckingPromo || promoStatus === 'valid'}
                    onClick={handleApplyPromoCode}
                    sx={{
                      flexShrink: 0,
                      px: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: ACCENT,
                      '&:hover': { bgcolor: '#967d5f' },
                    }}
                  >
                    {isCheckingPromo
                      ? t('checking')
                      : promoStatus === 'valid'
                        ? t('applied')
                        : t('apply')}
                  </Button>
                </Stack>

                {promoMessage && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify
                      icon={promoStatus === 'valid' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                      width={14}
                      sx={{ color: promoStatus === 'valid' ? 'success.main' : 'error.main' }}
                    />
                    <Typography variant="caption" sx={{ color: promoStatus === 'valid' ? 'success.main' : 'error.main' }}>
                      {promoMessage}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Box>

          {applyPromo && promoStatus === 'valid' && (
            <PriceCard label={t('priceAfterDiscount')} amount={priceAfterDiscount} />
          )}

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Iconify icon="solar:card-bold" width={18} sx={{ color: ACCENT }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {t('paymentMethod')}
              </Typography>
            </Stack>

            {isLoadingCards ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
              </Stack>
            ) : (
              <Stack spacing={1}>
                {savedCards.map((card) => (
                  <SelectableRow
                    key={card.id}
                    selected={selectedCardId === card.id}
                    icon={selectedCardId === card.id ? 'solar:check-circle-bold' : 'solar:card-bold'}
                    onClick={() => setSelectedCardId(card.id)}
                    trailing={card.isDefault && <Label color="primary" variant="soft">{t('defaultCard')}</Label>}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {card.cardNumber}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {card.expiryDate}
                    </Typography>
                  </SelectableRow>
                ))}

                <SelectableRow
                  selected={isAddingNewCard}
                  icon={isAddingNewCard ? 'solar:check-circle-bold' : 'mingcute:add-line'}
                  onClick={() => setSelectedCardId(NEW_CARD_OPTION)}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {t('addNewCard')}
                  </Typography>
                </SelectableRow>
              </Stack>
            )}

            {!isLoadingCards && isAddingNewCard && (
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box
                  sx={{
                    px: 1.75,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: paymentError ? 'error.main' : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
                    bgcolor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.6),
                    transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
                    '&:focus-within': {
                      borderColor: ACCENT,
                      boxShadow: `0 0 0 3px ${varAlpha('166 142 107', 0.16)}`,
                    },
                  }}
                >
                  <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
                </Box>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Iconify icon="solar:lock-keyhole-bold" width={13} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {t('cardDetailsSecureNote')}
                  </Typography>
                </Stack>

                <FormControlLabel
                  control={<Switch checked={saveNewCard} onChange={(event) => setSaveNewCard(event.target.checked)} />}
                  label={t('saveCardForFutureBookings')}
                />
              </Stack>
            )}
          </Box>

          {paymentError && (
            <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold" width={20} />} sx={{ borderRadius: 2 }}>
              {paymentError}
            </Alert>
          )}

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            loading={isProcessing}
            loadingPosition="start"
            disabled={
              basePrice <= 0 ||
              !stripe ||
              (isAddingNewCard ? !cardComplete : !selectedCardId) ||
              (applyPromo && Boolean(promoCode.trim()) && promoStatus !== 'valid')
            }
            onClick={handlePay}
            startIcon={<Iconify icon="solar:lock-keyhole-bold" width={18} />}
            sx={{
              mt: 0.5,
              py: 1.5,
              borderRadius: 10,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              color: 'common.white',
              background: `linear-gradient(135deg, #8a7052 0%, ${ACCENT} 100%)`,
              boxShadow: `0 12px 24px -8px ${varAlpha('166 142 107', 0.5)}`,
              '&:hover': {
                background: `linear-gradient(135deg, #7a6247 0%, #967d5f 100%)`,
                boxShadow: `0 14px 28px -8px ${varAlpha('166 142 107', 0.6)}`,
              },
              '&.Mui-disabled': {
                background: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
                color: (theme) => theme.vars.palette.text.disabled,
              },
            }}
          >
            {isProcessing ? t('processing') : t('payNow')}
          </LoadingButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export function PayNowDialog({ open, booking, initialPromoCode, variant, onClose, onPay }) {
  return (
    <Elements stripe={stripePromise}>
      <PayNowDialogContent open={open} booking={booking} initialPromoCode={initialPromoCode} variant={variant} onClose={onClose} onPay={onPay} />
    </Elements>
  );
}
