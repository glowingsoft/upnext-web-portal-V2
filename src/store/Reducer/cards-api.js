import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const cardsApi = createApi({
  reducerPath: 'cardsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['card'],
  endpoints: (builder) => ({
    getCards: builder.query({
      query: () => ({
        url: API_ROUTES.CARDS,
        method: 'GET',
      }),
      providesTags: ['card'],
    }),

    // paymentMethodId comes from stripe.createPaymentMethod() on the client — raw card details
    // never reach this endpoint, only the resulting Stripe token.
    addCard: builder.mutation({
      query: ({ paymentMethodId, cardHolderName, setDefault }) => ({
        url: API_ROUTES.CARDS,
        method: 'POST',
        body: { paymentMethodId, cardHolderName, setDefault },
      }),
      invalidatesTags: ['card'],
    }),

    // Only metadata is editable (name, expiry on file, default flag) — the underlying card
    // number is immutable once tokenized by Stripe.
    updateCard: builder.mutation({
      query: ({ id, cardHolderName, expMonth, expYear, isDefault }) => ({
        url: API_ROUTES.CARD_BY_ID(id),
        method: 'PATCH',
        body: { cardHolderName, expMonth, expYear, isDefault },
      }),
      invalidatesTags: ['card'],
    }),

    deleteCard: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.CARD_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['card'],
    }),
  }),
});

export const { useGetCardsQuery, useAddCardMutation, useUpdateCardMutation, useDeleteCardMutation } = cardsApi;
