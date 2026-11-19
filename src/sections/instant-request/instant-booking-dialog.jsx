import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { getInstantOfferDeadline } from 'src/utils/instant-booking-time';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import { useGetCardsQuery } from 'src/store/Reducer/cards-api';
import { useCreateInstantBookingMutation, useGetInstantQuoteQuery, useGetInstantSlotsQuery } from 'src/store/Reducer/instant-bookings-api';
import { normalizeCard } from 'src/sections/active-sections/cards-view/cards-data';

import { InlineAddCard } from './inline-add-card';
import { RequestWaitingDialog } from './request-waiting-dialog';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

const formatCents = (cents, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'USD').toUpperCase() }).format((Number(cents) || 0) / 100);

const formatTime = (value) => {
  const [h, m] = String(value || '').split(':').map(Number);
  if (Number.isNaN(h)) return value || '';
  return dayjs().hour(h).minute(m || 0).format('h:mm A');
};

const slotKey = (slot) => `${slot.open}-${slot.close}`;

function isPastSlot(slot, date) {
  if (!date.isSame(dayjs(), 'day')) return false;
  const [h, m] = String(slot.open).split(':').map(Number);
  return date.hour(h).minute(m || 0).isBefore(dayjs());
}

function requestLocation() {
  const stored = getMyLocation();
  if (isRealCoords(stored?.lat, stored?.lng)) return Promise.resolve({ lat: stored.lat, lng: stored.lng });
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

function PriceRow({ label, value, strong, muted, hint }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
      <Box>
        <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ color: muted ? 'text.secondary' : 'text.primary' }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Typography variant={strong ? 'h6' : 'subtitle2'} sx={{ color: strong ? 'primary.dark' : muted ? 'text.secondary' : 'text.primary', flexShrink: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SlotStep({ type, targetId, date, onDateChange, selectedKey, onSelect }) {
  const dateKey = date?.isValid?.() && !date.isBefore(dayjs(), 'day') ? date.format('YYYY-MM-DD') : null;
  const { data, isFetching, error } = useGetInstantSlotsQuery({ scope: type, targetId, date: dateKey }, { skip: !targetId || !dateKey });
  const info = data?.data;
  const slots = (info?.slots || []).filter((slot) => (slot.status || 'available') === 'available' && (slot.availableSpots == null || slot.availableSpots > 0) && !isPastSlot(slot, date));

  return (
    <Stack spacing={2.5}>
      <DatePicker
        label="Date"
        value={date}
        onChange={(value) => value && onDateChange(value)}
        disablePast
        slotProps={{ textField: { fullWidth: true } }}
      />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="subtitle2">Choose a time</Typography>
          {!isFetching && !error && info?.isOpen !== false && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {slots.length} available
            </Typography>
          )}
        </Stack>

        {isFetching ? (
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={52} />
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error">{error?.data?.message || 'Could not load available times. Please try again.'}</Alert>
        ) : info?.isOpen === false || slots.length === 0 ? (
          <Alert severity="info">No times available on this day. Please choose another date.</Alert>
        ) : (
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {slots.map((slot) => {
              const selected = selectedKey === slotKey(slot);
              return (
                <Box
                  key={slotKey(slot)}
                  component="button"
                  type="button"
                  onClick={() => onSelect(slot)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    borderRadius: 1.25,
                    border: '1.5px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1) : 'background.paper',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: selected ? 'primary.dark' : 'text.primary' }}>
                    {formatTime(slot.open)} – {formatTime(slot.close)}
                  </Typography>
                  {slot.availableSpots != null && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {slot.availableSpots} {slot.availableSpots === 1 ? 'spot' : 'spots'} left
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Stack>
  );
}

function CardOption({ card, selected, onSelect }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        p: 1.5,
        width: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        borderRadius: 1.25,
        border: '1.5px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) : 'background.paper',
      }}
    >
      <Iconify icon="solar:card-bold-duotone" width={26} sx={{ color: 'primary.main', flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
          {card.brand || 'Card'} •••• {card.last4}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Expires {card.expiryDate}
          {card.isDefault ? ' · Default' : ''}
        </Typography>
      </Box>
      <Iconify icon={selected ? 'solar:check-circle-bold' : 'solar:record-linear'} width={22} sx={{ color: selected ? 'primary.main' : 'text.disabled' }} />
    </Box>
  );
}

function TermItem({ icon, title, text, checked, onToggle }) {
  return (
    <Box
      component="label"
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        cursor: 'pointer',
        borderRadius: 1.5,
        border: '1.5px solid',
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: checked ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06) : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color'], { duration: 150 }),
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: 'warning.dark',
          bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.14),
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          {text}
        </Typography>
      </Box>
      <Checkbox checked={checked} onChange={(event) => onToggle(event.target.checked)} sx={{ p: 0.5, mt: -0.25, flexShrink: 0 }} />
    </Box>
  );
}

function ReviewStep({ type, targetId, item, provider, date, slot, cardId, onCardChange, agreed, onAgreedChange, onQuote }) {
  const { data, isFetching, error } = useGetInstantQuoteQuery({ scope: type, targetId });
  const { data: cardsData, isLoading: cardsLoading } = useGetCardsQuery();
  const [addingCard, setAddingCard] = useState(false);

  const quote = data?.data;
  const cards = useMemo(() => (cardsData?.data || []).map(normalizeCard), [cardsData]);

  useEffect(() => {
    onQuote(quote || null);
  }, [quote, onQuote]);

  useEffect(() => {
    if (cardId || cards.length === 0) return;
    const preferred = cards.find((card) => card.isDefault) || cards[0];
    onCardChange(preferred.stripePaymentMethodId);
  }, [cards, cardId, onCardChange]);

  if (isFetching) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={84} />
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={90} />
      </Stack>
    );
  }

  if (error || !quote) {
    return <Alert severity="error">{error?.data?.message || 'Could not get a price for this booking. Please try again.'}</Alert>;
  }

  const pricing = quote.pricing || {};
  const currency = quote.currency || 'USD';

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
        <Avatar variant="rounded" src={item.image} sx={{ width: 56, height: 56, bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12), color: 'primary.main' }}>
          <Iconify icon="solar:scissors-bold-duotone" width={26} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {quote.entity?.name || item.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {provider.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {date.format('ddd, MMM D')} · {formatTime(slot.open)} – {formatTime(slot.close)}
          </Typography>
        </Box>
      </Stack>

      {!quote.eligible ? (
        <Alert severity="warning">
          This {type} can&apos;t be booked instantly. The minimum price for instant booking is {formatCents(quote.minInstantPriceCents, currency)}.
        </Alert>
      ) : (
        <>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
              Price details
            </Typography>
            <Stack spacing={1} sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <PriceRow label={type === 'package' ? 'Package price' : 'Service price'} value={formatCents(pricing.servicePriceCents, currency)} />
              <PriceRow label="Booking fee" value={formatCents(pricing.chargeFeeCents ?? pricing.feeCents, currency)} />
              {pricing.promoDiscountCents > 0 && <PriceRow label="Promo discount" value={`−${formatCents(pricing.promoDiscountCents, currency)}`} />}
              <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
              <PriceRow
                strong
                label="Total"
                value={formatCents(quote.amountDueCents ?? pricing.totalCents, currency)}
                hint={quote.taxIncluded ? 'Tax included' : 'Tax not included'}
              />
              {pricing.depositCents > 0 && (
                <PriceRow muted label="Includes non-refundable deposit" value={formatCents(pricing.depositCents, currency)} />
              )}
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
              <Typography variant="subtitle2">Payment method</Typography>
              {!addingCard && (
                <Button size="small" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setAddingCard(true)}>
                  Add card
                </Button>
              )}
            </Stack>
            {cardsLoading ? (
              <Skeleton variant="rounded" height={64} />
            ) : cards.length === 0 ? (
              !addingCard && <Alert severity="info">Add a card to send your booking request. You are only charged once a provider accepts.</Alert>
            ) : (
              <Stack spacing={1}>
                {cards.map((card) => (
                  <CardOption key={card.id} card={card} selected={cardId === card.stripePaymentMethodId} onSelect={() => onCardChange(card.stripePaymentMethodId)} />
                ))}
              </Stack>
            )}
            <Collapse in={addingCard} unmountOnExit>
              <Box sx={{ mt: 1.5 }}>
                <InlineAddCard
                  isFirstCard={cards.length === 0}
                  onCancel={() => setAddingCard(false)}
                  onAdded={(paymentMethodId) => {
                    setAddingCard(false);
                    onCardChange(paymentMethodId);
                  }}
                />
              </Box>
            </Collapse>
          </Box>

          {(quote.agreement?.text || quote.cancellationPolicy?.text) && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2">Booking terms</Typography>
                </Stack>
                {quote.cancellationPolicy?.type && (
                  <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 99, fontWeight: 700, color: 'warning.dark', bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.14) }}>
                    {quote.cancellationPolicy.type === 'non_refundable' ? 'Non-refundable' : 'Refundable up to 24 hours before'}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1}>
                {quote.agreement?.text && (
                  <TermItem
                    icon="solar:wallet-money-bold-duotone"
                    title="Deposit and booking fee"
                    text={quote.agreement.text}
                    checked={agreed.agreement}
                    onToggle={(checked) => onAgreedChange({ ...agreed, agreement: checked })}
                  />
                )}
                {quote.cancellationPolicy?.text && (
                  <TermItem
                    icon="solar:calendar-mark-bold-duotone"
                    title="Cancellation policy"
                    text={quote.cancellationPolicy.text}
                    checked={agreed.policy}
                    onToggle={(checked) => onAgreedChange({ ...agreed, policy: checked })}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Add a card and tick both terms to send your request. You are only charged once a provider accepts.
              </Typography>
            </Box>
          )}
        </>
      )}

    </Stack>
  );
}

export function InstantBookingDialog({ bookingItem, title, onCloseBooking, onBooked, type }) {
  const router = useRouter();
  const [step, setStep] = useState('slot');
  const [date, setDate] = useState(dayjs());
  const [slot, setSlot] = useState(null);
  const [cardId, setCardId] = useState('');
  const [agreed, setAgreed] = useState({ agreement: false, policy: false });
  const [quote, setQuote] = useState(null);
  const [waitingRequest, setWaitingRequest] = useState(null);
  const [createBooking, { isLoading: isSending }] = useCreateInstantBookingMutation();

  useEffect(() => {
    if (!bookingItem) return;
    setStep('slot');
    setDate(dayjs());
    setSlot(null);
    setCardId('');
    setAgreed({ agreement: false, policy: false });
    setQuote(null);
  }, [bookingItem]);

  const scope = type === 'package' ? 'package' : 'service';
  const targetId = bookingItem?._id;
  const business = bookingItem?.business || bookingItem?.provider || {};
  const provider = {
    id: business._id || business.id || bookingItem?.businessId,
    name: business.businessName || business.name || 'the provider',
    image: normalizeImageUrl(business.image || business.profileImage),
  };
  const item = {
    name: bookingItem?.name || bookingItem?.title || '',
    image: bookingItem?.image || bookingItem?.coverImage || bookingItem?.photos?.[0],
  };

  const needsAgreement = Boolean(quote?.agreement?.text);
  const needsPolicy = Boolean(quote?.cancellationPolicy?.text);
  const canSend = Boolean(quote?.eligible && slot && cardId && (!needsAgreement || agreed.agreement) && (!needsPolicy || agreed.policy));

  const handleSend = async () => {
    if (!canSend) return;
    const location = await requestLocation();
    const body = {
      scope,
      targetId,
      date: `${date.format('YYYY-MM-DD')}T${slot.open}:00Z`,
      slot: { open: slot.open, close: slot.close },
      providerId: provider.id,
      stripePaymentMethodId: cardId,
      ...(location ? { lat: location.lat, lng: location.lng } : {}),
      agreedNonRefundable: true,
      agreementVersion: quote.agreement?.version || 'instant-v1',
    };

    try {
      const response = await createBooking(body).unwrap();
      const payload = response?.data?.data ?? response?.data ?? response;
      const booking = payload?.booking ?? payload;
      const bookingId = booking?._id || booking?.id || booking?.bookingId || payload?.bookingId;
      const expiresAt = getInstantOfferDeadline(booking, payload);

      if (!bookingId) {
        toast.error('The booking request was sent, but the API did not return a booking ID.');
        onBooked?.({ ...bookingItem, instantBooking: booking });
        onCloseBooking();
        router.push(paths.dashboard.bookings);
        return;
      }

      toast.success(`Request sent to ${provider.name}`);
      setWaitingRequest({
        bookingId,
        booking,
        expiresAt,
        name: quote.entity?.name || item.name,
        image: item.image,
        price: (quote.amountDueCents ?? quote.pricing?.totalCents ?? 0) / 100,
        dateLabel: date.format('ddd, MMM D'),
        slotLabel: `${formatTime(slot.open)} – ${formatTime(slot.close)}`,
        provider,
        expectedTotalCents: quote.amountDueCents ?? quote.pricing?.totalCents,
        agreementVersion: body.agreementVersion,
      });
      onBooked?.({ ...bookingItem, instantBooking: booking });
      onCloseBooking();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not send your booking request');
    }
  };

  return (
    <>
      <Dialog open={Boolean(bookingItem)} onClose={isSending ? undefined : onCloseBooking} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {bookingItem && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 3, pt: 2.5, pb: 1 }}>
              {step === 'review' && (
                <IconButton size="small" aria-label="Back" onClick={() => setStep('slot')} sx={{ ml: -1 }}>
                  <Iconify icon="eva:arrow-ios-back-fill" />
                </IconButton>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" noWrap>
                  {step === 'slot' ? title || 'Book' : 'Review and send request'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Step {step === 'slot' ? 1 : 2} of 2 · {step === 'slot' ? 'Pick a date and time' : 'Check the price and confirm'}
                </Typography>
              </Box>
              <IconButton aria-label="Close" onClick={onCloseBooking} disabled={isSending}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Stack>

            <DialogContent sx={{ pt: 2 }}>
              {step === 'slot' ? (
                <SlotStep
                  type={scope}
                  targetId={targetId}
                  date={date}
                  onDateChange={(value) => {
                    setDate(value);
                    setSlot(null);
                  }}
                  selectedKey={slot ? slotKey(slot) : null}
                  onSelect={setSlot}
                />
              ) : (
                <ReviewStep
                  type={scope}
                  targetId={targetId}
                  item={item}
                  provider={provider}
                  date={date}
                  slot={slot}
                  cardId={cardId}
                  onCardChange={setCardId}
                  agreed={agreed}
                  onAgreedChange={setAgreed}
                  onQuote={setQuote}
                />
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              {step === 'slot' ? (
                <>
                  <Button color="inherit" onClick={onCloseBooking}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" disabled={!slot} onClick={() => setStep('review')}>
                    Confirm Booking
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={() => setStep('slot')} disabled={isSending}>
                    Back
                  </Button>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    loading={isSending}
                    disabled={!canSend}
                    onClick={handleSend}
                    startIcon={<Iconify icon="solar:plain-bold" />}
                  >
                    Send booking request
                  </LoadingButton>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <RequestWaitingDialog request={waitingRequest} onClose={() => setWaitingRequest(null)} />
    </>
  );
}
