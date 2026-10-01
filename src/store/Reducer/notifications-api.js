import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.NOTIFICATIONS,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['notification'],
    }),
    markNotificationsRead: builder.mutation({
      query: (ids) => ({
        url: API_ROUTES.NOTIFICATIONS_READ,
        method: 'PUT',
        body: ids?.length ? { ids } : {},
      }),
      invalidatesTags: ['notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} = notificationsApi;
