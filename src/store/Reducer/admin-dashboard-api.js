import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const adminDashboardApi = createApi({
  reducerPath: 'adminDashboardApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['adminHome'],
  endpoints: (builder) => ({
    getAdminHome: builder.query({
      query: ({ usersYear, comparisonYear } = {}) => ({
        url: API_ROUTES.ADMIN_HOME,
        method: 'GET',
        params: { usersYear, comparisonYear },
      }),
      providesTags: ['adminHome'],
    }),
  }),
});

export const { useGetAdminHomeQuery } = adminDashboardApi;
