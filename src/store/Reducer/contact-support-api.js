import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const contactSupportApi = createApi({
  reducerPath: 'contactSupportApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['supportRequest'],
  endpoints: (builder) => ({
    // Public — no auth required, used on the marketing /contact-us page.
    submitContactUs: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.CONTACT_US,
        method: 'POST',
        body: data,
      }),
    }),

    // Logged-in users (business or customer) — email is derived server-side from the auth token.
    submitSupportRequest: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.SUPPORT,
        method: 'POST',
        body: data,
      }),
    }),

    // Admin — list of submitted contact-us/support requests.
    getSupportRequests: builder.query({
      query: (params) => ({
        url: API_ROUTES.SUPPORT_REQUESTS,
        method: 'GET',
        params,
      }),
      providesTags: ['supportRequest'],
    }),

    getSupportRequestById: builder.query({
      query: (id) => ({
        url: API_ROUTES.SUPPORT_REQUEST_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'supportRequest', id }],
    }),

    updateSupportRequestStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: API_ROUTES.SUPPORT_REQUEST_STATUS(id),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => ['supportRequest', { type: 'supportRequest', id }],
    }),
  }),
});

export const {
  useSubmitContactUsMutation,
  useSubmitSupportRequestMutation,
  useGetSupportRequestsQuery,
  useGetSupportRequestByIdQuery,
  useLazyGetSupportRequestByIdQuery,
  useUpdateSupportRequestStatusMutation,
} = contactSupportApi;
