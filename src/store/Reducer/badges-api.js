import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const badgesApi = createApi({
  reducerPath: 'badgesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['badge'],
  endpoints: (builder) => ({
    getBadges: builder.query({
      query: ({ scope, page, limit, search, status, date } = {}) => ({
        url: API_ROUTES.BADGES,
        method: 'GET',
        params: {
          // scope (and page/limit/search/status/date) are only sent when explicitly provided —
          // omit scope entirely to see the unfiltered list ("All"), and existing callers
          // (e.g. profile setup) that just pass `scope` keep getting the unpaginated list.
          ...(scope ? { scope } : {}),
          ...(page !== undefined ? { page: page + 1 } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(search ? { keyword: search } : {}),
          ...(status ? { status } : {}),
          ...(date ? { date } : {}),
        },
      }),
      transformResponse: (res) => ({ data: res.data, meta: res.meta }),
      providesTags: ['badge'],
    }),

    getAdminBadges: builder.query({
      query: ({ scope, page, limit, search, status, date } = {}) => ({
        url: API_ROUTES.ADMIN_BADGES,
        method: 'GET',
        params: {
          ...(scope ? { scope } : {}),
          ...(page !== undefined ? { page: page + 1 } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(search ? { keyword: search } : {}),
          ...(status ? { status } : {}),
          ...(date ? { date } : {}),
        },
      }),
      transformResponse: (res) => ({ data: res.data, meta: res.meta }),
      providesTags: ['badge'],
    }),

    getBadgeByName: builder.query({
      query: (name) => ({
        url: API_ROUTES.BADGE_BY_NAME(name),
        method: 'GET',
      }),
      providesTags: (result, error, name) => [{ type: 'badge', id: name }],
    }),

    addBadge: builder.mutation({
      query: (newBadge) => ({
        url: API_ROUTES.BADGES,
        method: 'POST',
        body: newBadge,
      }),
      invalidatesTags: ['badge'],
    }),

    updateBadge: builder.mutation({
      query: ({ id, ...updatedBadge }) => ({
        url: API_ROUTES.BADGE_BY_ID(id),
        method: 'PUT',
        body: updatedBadge,
      }),
      invalidatesTags: ['badge'],
    }),

    deleteBadge: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.BADGE_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['badge'],
    }),

    addBadgeOption: builder.mutation({
      query: ({ id, option }) => ({
        url: API_ROUTES.BADGE_OPTIONS(id),
        method: 'POST',
        body: { option },
      }),
      invalidatesTags: ['badge'],
    }),

    updateBadgeOption: builder.mutation({
      query: ({ id, optionId, optionName }) => ({
        url: API_ROUTES.BADGE_OPTION_BY_ID(id, optionId),
        method: 'PUT',
        body: { optionName },
      }),
      invalidatesTags: ['badge'],
    }),

    deleteBadgeOption: builder.mutation({
      query: ({ id, optionId }) => ({
        url: API_ROUTES.BADGE_OPTION_BY_ID(id, optionId),
        method: 'DELETE',
      }),
      invalidatesTags: ['badge'],
    }),
  }),
});

export const {
  useGetBadgesQuery,
  useGetAdminBadgesQuery,
  useGetBadgeByNameQuery,
  useAddBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
  useAddBadgeOptionMutation,
  useUpdateBadgeOptionMutation,
  useDeleteBadgeOptionMutation,
} = badgesApi;
