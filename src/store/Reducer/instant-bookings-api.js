import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const instantBookingsApi = createApi({
  reducerPath: 'instantBookingsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['instantBooking', 'instantSlots', 'instantOffers'],
  endpoints: (builder) => ({
    getInstantSlots: builder.query({
      query: ({ scope, targetId, date }) => ({ url: API_ROUTES.INSTANT.SLOTS, method: 'GET', params: { scope, targetId, date } }),
      providesTags: (result, error, arg) => [{ type: 'instantSlots', id: `${arg?.scope}-${arg?.targetId}-${arg?.date}` }],
    }),

    getInstantQuote: builder.query({
      query: ({ scope, targetId }) => ({ url: API_ROUTES.INSTANT.QUOTE, method: 'GET', params: { scope, targetId } }),
      keepUnusedDataFor: 0,
    }),

    createInstantBooking: builder.mutation({
      query: (body) => ({ url: API_ROUTES.INSTANT.BOOKINGS, method: 'POST', body }),
      invalidatesTags: ['instantBooking', 'instantSlots'],
    }),

    getInstantBookings: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => ({
        url: API_ROUTES.INSTANT.BOOKINGS,
        method: 'GET',
        params: { page, limit, ...(status ? { status } : {}) },
      }),
      providesTags: ['instantBooking'],
    }),

    getInstantOffers: builder.query({
      query: ({ status = 'pending' } = {}) => ({
        url: API_ROUTES.INSTANT.OFFERS,
        method: 'GET',
        params: { status },
      }),
      providesTags: ['instantOffers'],
    }),

    acceptInstantOffer: builder.mutation({
      query: (id) => ({ url: API_ROUTES.INSTANT.ACCEPT_OFFER(id), method: 'PATCH' }),
      invalidatesTags: ['instantOffers', 'instantBooking'],
    }),

    declineInstantBooking: builder.mutation({
      query: (id) => ({ url: API_ROUTES.INSTANT.DECLINE_BOOKING(id), method: 'POST' }),
      invalidatesTags: ['instantOffers', 'instantBooking'],
    }),

    getInstantBooking: builder.query({
      query: (id) => ({ url: API_ROUTES.INSTANT.BOOKING_BY_ID(id), method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'instantBooking', id }],
    }),

    startInstantBooking: builder.mutation({
      query: (id) => ({ url: API_ROUTES.INSTANT.START(id), method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [{ type: 'instantBooking', id }],
    }),

    customerArrivedInstantBooking: builder.mutation({
      query: (id) => ({ url: API_ROUTES.INSTANT.CUSTOMER_ARRIVED(id), method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'instantBooking', id }],
    }),

    arriveInstantBooking: builder.mutation({
      query: ({ id, lat, lng }) => ({
        url: API_ROUTES.INSTANT.ARRIVED(id),
        method: 'POST',
        body: { lat, lng },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    completeInstantBooking: builder.mutation({
      query: ({ id }) => ({
        url: API_ROUTES.INSTANT.COMPLETE(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    contestInstantNoShow: builder.mutation({
      query: ({ id, note }) => ({
        url: API_ROUTES.INSTANT.CONTEST_NO_SHOW(id),
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    getNextProviders: builder.query({
      query: (id) => ({ url: API_ROUTES.INSTANT.NEXT_PROVIDERS(id), method: 'GET' }),
      keepUnusedDataFor: 0,
    }),

    sendInstantAgain: builder.mutation({
      query: ({ id, ...body }) => ({ url: API_ROUTES.INSTANT.SEND_AGAIN(id), method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    sendInstantNext: builder.mutation({
      query: ({ id, ...body }) => ({ url: API_ROUTES.INSTANT.SEND_NEXT(id), method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    fixInstantPayment: builder.mutation({
      query: ({ id, stripePaymentMethodId }) => ({ url: API_ROUTES.INSTANT.FIX_PAYMENT(id), method: 'POST', body: { stripePaymentMethodId } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),

    getInstantCancelQuote: builder.query({
      query: (id) => ({ url: API_ROUTES.INSTANT.CANCEL_QUOTE(id), method: 'GET' }),
      keepUnusedDataFor: 0,
    }),

    providerCancelInstantBooking: builder.mutation({
      query: ({ id, reason }) => ({ url: API_ROUTES.INSTANT.PROVIDER_CANCEL(id), method: 'PATCH', body: { reason } }),
      invalidatesTags: (result, error, { id }) => ['instantBooking', 'instantOffers', { type: 'instantBooking', id }],
    }),

    cancelInstantBooking: builder.mutation({
      query: ({ id, reason = 'client' }) => ({ url: API_ROUTES.INSTANT.CANCEL(id), method: 'POST', body: { reason } }),
      invalidatesTags: (result, error, { id }) => ['instantBooking', { type: 'instantBooking', id }],
    }),

    reportInstantNoShow: builder.mutation({
      query: ({ id, reportedBy = 'client' }) => ({ url: API_ROUTES.INSTANT.NO_SHOW(id), method: 'POST', body: { reportedBy } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'instantBooking', id }],
    }),
  }),
});

export const {
  useGetInstantSlotsQuery,
  useGetInstantQuoteQuery,
  useCreateInstantBookingMutation,
  useGetInstantBookingsQuery,
  useGetInstantOffersQuery,
  useAcceptInstantOfferMutation,
  useDeclineInstantBookingMutation,
  useGetInstantBookingQuery,
  useStartInstantBookingMutation,
  useCustomerArrivedInstantBookingMutation,
  useArriveInstantBookingMutation,
  useCompleteInstantBookingMutation,
  useContestInstantNoShowMutation,
  useGetNextProvidersQuery,
  useSendInstantAgainMutation,
  useSendInstantNextMutation,
  useFixInstantPaymentMutation,
  useGetInstantCancelQuoteQuery,
  useProviderCancelInstantBookingMutation,
  useCancelInstantBookingMutation,
  useReportInstantNoShowMutation,
} = instantBookingsApi;
