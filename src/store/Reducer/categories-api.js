import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['category'],

  endpoints: (builder) => ({
    getCategoriesForSignup: builder.query({
      query: ({ page = 1, limit = 10, search = '', scope = '', tags } = {}) => ({
        url: API_ROUTES.CATEGORIES,
        method: 'GET',
        params: { page, limit, ...(search && { keyword: search }), ...(scope && { scope }), ...(tags ? { tags: true } : {}) },
      }),
    }),

    // Public marketplace/homepage — no auth required.
    getPublicCategories: builder.query({
      query: ({ page = 1, limit = 100, search = '' } = {}) => ({
        url: API_ROUTES.PUBLIC_CATEGORIES,
        method: 'GET',
        params: { page, limit, ...(search && { keyword: search }) },
      }),
    }),

    getCategories: builder.query({
      query: ({ search, page, status, date, limit, scope = '' } = {}) => {
        const params = {
          page: (page ?? 0) + 1,
          limit,
          ...(search && { keyword: search }),
          ...(status && { status }),
          ...(date && { date }),
          ...(scope && { scope }),
        };
        return {
          url: API_ROUTES.CATEGORIES,
          method: 'GET',
          params,
        };
      },
      transformResponse: (res) => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: ['category'],
    }),

    getSingleCategory: builder.query({
      query: (id) => ({
        url: API_ROUTES.CATEGORIES_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'category', id }],
    }),

    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: API_ROUTES.CATEGORIES,
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['category'],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...updatedCategory }) => ({
        url: API_ROUTES.CATEGORIES_BY_ID(id),
        method: 'PUT',
        body: updatedCategory,
      }),
      invalidatesTags: ['category'],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.CATEGORIES_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['category'],
    }),
  }),
});

export const { useGetCategoriesForSignupQuery, useGetPublicCategoriesQuery, useGetCategoriesQuery, useGetSingleCategoryQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } =
  categoriesApi;
