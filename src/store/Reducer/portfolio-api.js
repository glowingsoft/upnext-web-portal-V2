import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['portfolio'],
  endpoints: (builder) => ({
    getPortfolios: builder.query({
      query: ({ page = 1, limit = 100 } = {}) => ({
        url: API_ROUTES.PORTFOLIOS,
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: (res) => ({ data: res.data, meta: res.meta }),
      providesTags: ['portfolio'],
    }),

    getPortfolioById: builder.query({
      query: (id) => ({ url: API_ROUTES.PORTFOLIO_BY_ID(id), method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'portfolio', id }],
    }),

    createPortfolio: builder.mutation({
      query: (body) => ({ url: API_ROUTES.PORTFOLIOS, method: 'POST', body }),
      invalidatesTags: ['portfolio'],
    }),

    updatePortfolio: builder.mutation({
      query: ({ id, ...body }) => ({ url: API_ROUTES.PORTFOLIO_BY_ID(id), method: 'PUT', body }),
      invalidatesTags: ['portfolio'],
    }),

    deletePortfolio: builder.mutation({
      query: (id) => ({ url: API_ROUTES.PORTFOLIO_BY_ID(id), method: 'DELETE' }),
      invalidatesTags: ['portfolio'],
    }),
  }),
});

export const {
  useGetPortfoliosQuery,
  useGetPortfolioByIdQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} = portfolioApi;
