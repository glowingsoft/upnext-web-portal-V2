import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';
import { getTrafficPayload } from 'src/utils/traffic-source';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['slots', 'bookings'],
  endpoints: (builder) => ({
    getSlots: builder.query({
      query: ({ scope, targetId, date }) => ({
        url: API_ROUTES.SLOTS,
        method: 'GET',
        params: { scope, targetId, date },
      }),
      providesTags: (result, error, arg) => [{ type: 'slots', id: `${arg?.scope}-${arg?.targetId}-${arg?.date}` }],
    }),
    createBooking: builder.mutation({
      query: ({ scope, targetId, date, slot, paymentMethod, promotionId }) => {
        const source = getTrafficPayload()?.source;
        return {
          url: API_ROUTES.BOOKINGS,
          method: 'POST',
          body: {
            scope,
            targetId,
            date,
            slot,
            ...(paymentMethod ? { stripePaymentMethodId: paymentMethod } : {}),
            ...(promotionId ? { promotionId } : {}),
            ...(source ? { source } : {}),
          },
        };
      },
      invalidatesTags: ['slots', 'bookings'],
    }),
    acceptBooking: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.BOOKING_ACCEPT(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['bookings', { type: 'bookings', id }],
    }),
    rejectBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: API_ROUTES.BOOKING_REJECT(id),
        method: 'PATCH',
        ...(reason ? { body: { reason } } : {}),
      }),
      invalidatesTags: (result, error, arg) => ['bookings', { type: 'bookings', id: arg?.id }],
    }),
    cancelBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: API_ROUTES.BOOKING_CANCEL(id),
        method: 'PATCH',
        ...(reason ? { body: { reason } } : {}),
      }),
      invalidatesTags: (result, error, arg) => ['bookings', { type: 'bookings', id: arg?.id }],
    }),
    completeBooking: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.BOOKING_COMPLETE(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['bookings', { type: 'bookings', id }],
    }),
    startBooking: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.BOOKING_START(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['bookings', { type: 'bookings', id }],
    }),
    // paymentMethod is optional — omit it to receive a clientSecret back for Stripe Elements instead.
    fixBookingPayment: builder.mutation({
      query: ({ id, paymentMethod }) => ({
        url: API_ROUTES.BOOKING_FIX_PAYMENT(id),
        method: 'POST',
        body: {
          ...(paymentMethod ? { paymentMethod } : {}),
        },
      }),
      invalidatesTags: (result, error, { id }) => ['bookings', { type: 'bookings', id }],
    }),
    // Settles an outstanding (overdue) booking payment from the customer dashboard's debt
    // banner — a separate flow/endpoint from fixBookingPayment above (which is specifically for
    // the requires_payment_fix booking-detail scenario). stripePaymentMethodId is optional —
    // omit it to fall back to the customer's vaulted card.
    payOutstandingBooking: builder.mutation({
      query: ({ id, stripePaymentMethodId }) => ({
        url: API_ROUTES.PAY_BOOKING(id),
        method: 'POST',
        body: {
          ...(stripePaymentMethodId ? { stripePaymentMethodId } : {}),
        },
      }),
      invalidatesTags: (result, error, { id }) => ['bookings', { type: 'bookings', id }],
    }),
    // type: 'payment' | 'slot' | 'start'
    sendBookingReminder: builder.mutation({
      query: ({ id, type }) => ({
        url: API_ROUTES.BOOKING_REMINDER(id),
        method: 'POST',
        body: { type },
      }),
    }),
    getMyBookings: builder.query({
      query: ({ page = 1, limit = 10, status, scope, date, keyword } = {}) => ({
        url: API_ROUTES.BOOKINGS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    getBusinessBookings: builder.query({
      query: ({ page = 1, limit = 10, status, scope, date, userId, keyword } = {}) => ({
        url: API_ROUTES.BUSINESS_BOOKINGS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(userId ? { userId } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    getBookingsCalendar: builder.query({
      query: ({ range = 'monthly', date, status } = {}) => ({
        url: API_ROUTES.BOOKINGS_CALENDAR,
        method: 'GET',
        params: {
          range,
          ...(date ? { date } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    // Accepts either a plain id, or { id, lat, lng } — sending the customer's session location
    // gets real per-item distance back on the response's suggestedServices list.
    getBookingById: builder.query({
      query: (arg) => {
        const { id, lat, lng } = typeof arg === 'object' && arg !== null ? arg : { id: arg };
        return {
          url: API_ROUTES.BOOKING_BY_ID(id),
          method: 'GET',
          params: {
            ...(lat != null && lng != null ? { lat, lng } : {}),
          },
        };
      },
      providesTags: (result, error, arg) => [
        { type: 'bookings', id: typeof arg === 'object' && arg !== null ? arg.id : arg },
      ],
    }),
    getCustomerBookings: builder.query({
      query: ({ id, page = 1, limit = 10, status, scope, date, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_CUSTOMER_BOOKINGS(id),
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    getAdminBookings: builder.query({
      query: ({ page = 1, limit = 10, status, scope, date, businessId, userId, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_BOOKINGS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(businessId ? { businessId } : {}),
          ...(userId ? { userId } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    getAdminBookingById: builder.query({
      query: (id) => ({
        url: API_ROUTES.ADMIN_BOOKING_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'bookings', id }],
    }),
    getBillingHistory: builder.query({
      query: ({ page = 1, limit = 10, status, startDate, endDate, keyword } = {}) => ({
        url: API_ROUTES.BILLING_HISTORY,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['bookings'],
    }),
    getBillingHistoryById: builder.query({
      query: (bookingId) => ({
        url: API_ROUTES.BILLING_HISTORY_BY_ID(bookingId),
        method: 'GET',
      }),
      providesTags: (result, error, bookingId) => [{ type: 'bookings', id: bookingId }],
    }),
  }),
});

export const {
  useGetSlotsQuery,
  useCreateBookingMutation,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useStartBookingMutation,
  useFixBookingPaymentMutation,
  usePayOutstandingBookingMutation,
  useSendBookingReminderMutation,
  useGetMyBookingsQuery,
  useGetBusinessBookingsQuery,
  useGetBookingsCalendarQuery,
  useGetBookingByIdQuery,
  useGetCustomerBookingsQuery,
  useGetAdminBookingsQuery,
  useGetAdminBookingByIdQuery,
  useGetBillingHistoryQuery,
  useGetBillingHistoryByIdQuery,
} = bookingsApi;
