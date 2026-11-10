import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['customers'],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, status, keyword, sortBy } = {}) => ({
        url: API_ROUTES.ADMIN_CUSTOMERS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
          ...(sortBy ? { sortBy } : {}),
        },
      }),
      providesTags: ['customers'],
    }),

    getCustomerById: builder.query({
      query: (id) => ({
        url: API_ROUTES.ADMIN_CUSTOMER_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'customers', id }],
    }),

    updateCustomerStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: API_ROUTES.ADMIN_USERS.UPDATE_PROFILE_STATUS(userId),
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['customers'],
    }),

    checkUserDeletionEligibility: builder.mutation({
      query: (userId) => ({
        url: API_ROUTES.ADMIN_USER_DELETION_ELIGIBILITY(userId),
        method: 'GET',
      }),
    }),

    deleteCustomer: builder.mutation({
      query: (userId) => ({
        url: API_ROUTES.ADMIN_USER_PROFILE_BY_ID(userId),
        method: 'DELETE',
      }),
      invalidatesTags: ['customers'],
    }),

    hardDeleteCustomer: builder.mutation({
      query: (userId) => ({
        url: API_ROUTES.ADMIN_USER_HARD_DELETE(userId),
        method: 'DELETE',
      }),
      invalidatesTags: ['customers'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
  useCheckUserDeletionEligibilityMutation,
  useDeleteCustomerMutation,
  useHardDeleteCustomerMutation,
} = customersApi;
