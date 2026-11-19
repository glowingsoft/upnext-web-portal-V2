import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';
import {
  useAcceptInstantOfferMutation,
  useDeclineInstantBookingMutation,
  useGetInstantOffersQuery,
} from 'src/store/Reducer/instant-bookings-api';
import { getLocalInstantDeadline, parseInstantTimestamp } from 'src/utils/instant-booking-time';

import { toast } from 'src/components/snackbar';

export const LiveOffersContext = createContext(null);

export function useLiveOffers() {
  return useContext(LiveOffersContext);
}

export function getSecondsLeft(offer, now) {
  return Math.max(0, Math.ceil((offer.expiresAt - now) / 1000));
}

function timestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value < 1e12 ? value * 1000 : value;
  if (typeof value !== 'string' || !value) return null;

  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric < 1e12 ? numeric * 1000 : numeric;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractOffers(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.offers)) return payload.offers;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.offers)) return payload.data.offers;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(response?.offers)) return response.offers;
  return [];
}

function getStatusCounts(response, offers) {
  const statusCounts = response?.meta?.statusCounts || response?.data?.meta?.statusCounts || {};
  const count = (value, fallback = 0) => {
    if (value == null || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    all: count(statusCounts.all, offers.length),
    incoming: count(statusCounts.pending, offers.length),
    accepted: count(statusCounts.accepted),
    declined: count(statusCounts.declined),
    expired: count(statusCounts.expired),
    closed: count(statusCounts.closed),
  };
}

function normalizeOffer(offer, serverClockOffsetMs, selectedStatus) {
  const source = offer?.offer || offer || {};
  const booking = source.booking || source.instantBooking || {};
  const rawStatus = source.status || source.offerStatus || (selectedStatus === 'all' ? 'pending' : selectedStatus);
  const status = rawStatus === 'pending' ? 'incoming' : rawStatus;
  const targetValue = booking.target || source.target || booking.bookedService || booking.service || booking.package;
  const target = Array.isArray(targetValue) ? targetValue[0] : targetValue || {};
  const customer = source.customer || source.userInfo || booking.userInfo || booking.user || {};
  const category = source.category || target.category || booking.category || '';
  const rawSlot = source.slot || booking.slot || source.timeSlot || booking.timeSlot || {};
  const slot = typeof rawSlot === 'object' ? rawSlot : {};
  const slotParts = typeof rawSlot === 'string' ? rawSlot.split(/\s*[-–]\s*/) : [];
  const slotOpen = slot.open || slot.start || source.slotOpen || booking.slotOpen || source.startTime || booking.startTime || slotParts[0] || '';
  const slotClose = slot.close || slot.end || source.slotClose || booking.slotClose || source.endTime || booking.endTime || slotParts[1] || '';
  const rawDate = source.date || booking.date || source.appointmentAt || booking.appointmentAt;
  const pricing = source.pricing || booking.pricing || {};
  const sourcePrice = source.price?.paid ?? source.price?.amount ?? source.price?.total ?? source.price;
  const bookingPrice = booking.price && typeof booking.price === 'object'
    ? booking.price.paid ?? booking.price.amount
    : booking.price;
  const targetPrice = target.price && typeof target.price === 'object'
    ? target.price.paid ?? target.price.amount
    : target.price;
  const rawCustomerRating = customer.rating?.avgRating ?? customer.rating;
  const customerRating = rawCustomerRating == null || rawCustomerRating === '' ? null : Number(rawCustomerRating);
  const rawPrice =
    sourcePrice ??
    source.amount ??
    bookingPrice ??
    booking.snapshot?.pricing?.finalPrice ??
    booking.finalPrice ??
    (pricing.amountDueCents != null
      ? pricing.amountDueCents / 100
      : pricing.totalCents != null
        ? pricing.totalCents / 100
        : targetPrice ?? 0);
  const rawExpiry = source.expiresAt ?? source.offerExpiresAt ?? booking.offerExpiresAt;
  const serverNow = source.serverNow ?? booking.serverNow;
  const expiry = serverNow != null
    ? getLocalInstantDeadline(rawExpiry, serverNow)
    : timestamp(rawExpiry) != null && Number.isFinite(serverClockOffsetMs)
      ? timestamp(rawExpiry) - serverClockOffsetMs
      : timestamp(rawExpiry);
  const locationType =
    source.locationType ||
    booking.preferredServiceType?.optionName ||
    booking.type?.optionName ||
    (typeof booking.type === 'string' ? booking.type : null) ||
    booking.deliveryMethod ||
    'At provider location';
  const image =
    source.image ||
    source.service?.image ||
    target.image ||
    target.photos?.[0] ||
    source.business?.image ||
    booking.coverImage ||
    booking.service?.image ||
    booking.package?.image ||
    '';
  const price = Number(rawPrice);

  return {
    ...source,
    id: source.offerId || source.instantOfferId || source._id || source.id,
    offerId: source.offerId || source.instantOfferId || source._id || source.id,
    bookingId: source.bookingId || source.instantBookingId || booking._id || booking.id,
    status,
    receivedAt: timestamp(source.receivedAt || source.sentAt || source.createdAt) || Date.now(),
    respondedAt: timestamp(source.respondedAt),
    expiresAt: expiry || 0,
    serviceName: source.serviceName || source.service?.name || source.name || target.name || booking.name || booking.entityName || 'Booking request',
    kind: source.scope === 'package' || booking.scope === 'package' ? 'package' : 'service',
    category: typeof category === 'string' ? category : category?.name || '',
    price: Number.isFinite(price) ? price : 0,
    durationMins: source.durationMins || booking.sessionSlotMins || target.durationMins || 0,
    slotOpen,
    slotClose,
    image: typeof image === 'string' ? image : '',
    customer: {
      name: customer.name || source.customerName || 'Customer',
      rating: Number.isFinite(customerRating) ? customerRating : null,
      avatar: customer.avatar || customer.profileIcon || customer.image || '',
    },
    locationType: typeof locationType === 'string' ? locationType : 'At provider location',
    address: source.address || booking.location?.address || booking.businessInfo?.location?.address || booking.userInfo?.location?.address || '',
    appointmentAt: rawDate,
  };
}

export function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

export function useLiveOffersState(enabled) {
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState(null);
  const [status, setStatus] = useState('pending');
  const responseInFlight = useRef(new Set());
  const { socket } = useChatSocketContext();
  const [allTabsActive, setAllTabsActive] = useState(false);
  const activateAllTabs = useCallback(() => setAllTabsActive(true), []);
  const tabSkip = !enabled || !allTabsActive;
  const pendingQuery = useGetInstantOffersQuery({ status: 'pending' }, { skip: !enabled });
  const acceptedQuery = useGetInstantOffersQuery({ status: 'accepted' }, { skip: tabSkip && status !== 'accepted' });
  const declinedQuery = useGetInstantOffersQuery({ status: 'declined' }, { skip: tabSkip && status !== 'declined' });
  const expiredQuery = useGetInstantOffersQuery({ status: 'expired' }, { skip: tabSkip && status !== 'expired' });
  const closedQuery = useGetInstantOffersQuery({ status: 'closed' }, { skip: tabSkip && status !== 'closed' });
  const queriesByStatus = { pending: pendingQuery, accepted: acceptedQuery, declined: declinedQuery, expired: expiredQuery, closed: closedQuery };
  const activeQuery = queriesByStatus[status] || pendingQuery;
  const { data, currentData, error, isFetching } = activeQuery;
  const refetchers = [pendingQuery.refetch, acceptedQuery.refetch, declinedQuery.refetch, expiredQuery.refetch, closedQuery.refetch];
  const refetchersRef = useRef(refetchers);
  refetchersRef.current = refetchers;
  const refetch = useCallback(() => {
    refetchersRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        // Query not started yet (skipped); nothing to refresh.
      }
    });
  }, []);
  const [acceptInstantOffer, { isLoading: isAccepting }] = useAcceptInstantOfferMutation();
  const [declineInstantBooking, { isLoading: isDeclining }] = useDeclineInstantBookingMutation();
  const offers = useMemo(() => {
    const responseServerNow = parseInstantTimestamp(currentData?.serverNow ?? currentData?.data?.serverNow);
    const responseOffset = responseServerNow == null ? serverClockOffsetMs : responseServerNow - Date.now();
    return extractOffers(currentData).map((offer) => normalizeOffer(offer, responseOffset, status));
  }, [currentData, serverClockOffsetMs, status]);

  useEffect(() => {
    if (!enabled || !socket) return undefined;

    const syncClockAndRefetch = (payload) => {
      const serverNow = parseInstantTimestamp(payload?.serverNow);
      if (serverNow != null) setServerClockOffsetMs(serverNow - Date.now());
      refetch();
    };
    socket.on('offerReceived', syncClockAndRefetch);
    socket.on('offerClosed', syncClockAndRefetch);

    return () => {
      socket.off('offerReceived', syncClockAndRefetch);
      socket.off('offerClosed', syncClockAndRefetch);
    };
  }, [enabled, refetch, socket]);

  const acceptOffer = useCallback(async (id) => {
    if (responseInFlight.current.has(id)) return;

    const offer = offers.find((item) => item.id === id);
    if (!offer?.offerId) {
      toast.error('This offer is missing its offer ID.');
      return;
    }

    responseInFlight.current.add(id);
    try {
      await acceptInstantOffer(offer.offerId).unwrap();
      toast.success(`Offer accepted: ${offer.serviceName}`);
    } catch (requestError) {
      refetch();
      toast.error(requestError?.data?.message || 'Could not accept this offer.');
    } finally {
      responseInFlight.current.delete(id);
    }
  }, [acceptInstantOffer, offers, refetch]);

  const declineOffer = useCallback(async (id) => {
    if (responseInFlight.current.has(id)) return;

    const offer = offers.find((item) => item.id === id);
    if (!offer?.bookingId) {
      toast.error('This offer is missing its booking ID.');
      return;
    }

    responseInFlight.current.add(id);
    try {
      await declineInstantBooking(offer.bookingId).unwrap();
      toast.info(`Offer declined: ${offer.serviceName}`);
    } catch (requestError) {
      refetch();
      toast.error(requestError?.data?.message || 'Could not decline this offer.');
    } finally {
      responseInFlight.current.delete(id);
    }
  }, [declineInstantBooking, offers, refetch]);

  const dismissNotification = useCallback((id) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  const counts = useMemo(() => getStatusCounts(data ?? currentData ?? pendingQuery.data, offers), [data, currentData, pendingQuery.data, offers]);

  return useMemo(
    () => ({
      enabled,
      status,
      setStatus,
      activateAllTabs,
      demoEnabled: false,
      offers,
      counts,
      dismissedIds,
      error,
      isFetching,
      hasCurrentData: currentData != null,
      isResponding: isAccepting || isDeclining,
      acceptOffer,
      declineOffer,
      dismissNotification,
    }),
    [enabled, status, setStatus, activateAllTabs, offers, counts, dismissedIds, error, isFetching, currentData, isAccepting, isDeclining, acceptOffer, declineOffer, dismissNotification]
  );
}
