import i18next from 'i18next';
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';
import { getApiLanguage } from 'src/utils/multi-lang-content';

const getCurrentApiLanguage = () => getApiLanguage(i18next.language || 'en');

export const helpCenterApi = createApi({
  reducerPath: 'helpCenterApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['helpCenter'],
  endpoints: (builder) => ({
    getHelpCenterArticles: builder.query({
      query: ({ page = 1, limit = 10, status, keyword } = {}) => ({
        url: API_ROUTES.HELP_CENTER,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['helpCenter'],
    }),

    getHelpCenterArticleById: builder.query({
      query: (id) => ({
        url: API_ROUTES.HELP_CENTER_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'helpCenter', id }],
    }),

    getAppHelpCenterArticles: builder.query({
      query: ({ page = 1, limit = 10, status, keyword } = {}) => ({
        url: API_ROUTES.APP_HELP_CENTER,
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
        },
        headers: { 'x-language': getCurrentApiLanguage() },
      }),
      providesTags: ['helpCenter'],
    }),

    getAppHelpCenterArticleById: builder.query({
      query: (id) => ({
        url: API_ROUTES.APP_HELP_CENTER_BY_ID(id),
        method: 'GET',
        headers: { 'x-language': getCurrentApiLanguage() },
      }),
      providesTags: (result, error, id) => [{ type: 'helpCenter', id }],
    }),

    createHelpCenterArticle: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.HELP_CENTER,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['helpCenter'],
    }),

    updateHelpCenterArticle: builder.mutation({
      query: ({ id, ...data }) => ({
        url: API_ROUTES.HELP_CENTER_BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['helpCenter', { type: 'helpCenter', id }],
    }),
  }),
});

export const {
  useGetHelpCenterArticlesQuery,
  useGetHelpCenterArticleByIdQuery,
  useGetAppHelpCenterArticlesQuery,
  useGetAppHelpCenterArticleByIdQuery,
  useCreateHelpCenterArticleMutation,
  useUpdateHelpCenterArticleMutation,
} = helpCenterApi;
