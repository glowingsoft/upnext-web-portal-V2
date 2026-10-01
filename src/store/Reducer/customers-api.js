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
  }),
});

export const { useGetCustomersQuery, useGetCustomerByIdQuery, useUpdateCustomerStatusMutation } = customersApi;
