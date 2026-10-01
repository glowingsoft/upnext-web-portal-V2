import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const tagsApi = createApi({
  reducerPath: 'tagsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['tag'],
  endpoints: (builder) => ({
    getAdminTags: builder.query({
      query: ({ page, limit, search, category } = {}) => ({
        url: API_ROUTES.ADMIN_TAGS,
        method: 'GET',
        params: {
          ...(page !== undefined ? { page: page + 1 } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(search ? { keyword: search } : {}),
          ...(category ? { category } : {}),
        },
      }),
      transformResponse: (res) => ({ data: res.data, meta: res.meta }),
      providesTags: ['tag'],
    }),

    getTags: builder.query({
      query: ({ categoryIds, search, page, limit } = {}) => ({
        url: API_ROUTES.TAGS,
        method: 'GET',
        params: {
          ...(page !== undefined ? { page: page + 1 } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(search ? { keyword: search } : {}),
          ...(categoryIds?.length ? { category: categoryIds.join(',') } : {}),
        },
      }),
      transformResponse: (res) => ({ data: res.data, meta: res.meta }),
      providesTags: ['tag'],
    }),

    getAdminTagById: builder.query({
      query: (id) => ({
        url: API_ROUTES.ADMIN_TAG_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'tag', id }],
    }),

    addTag: builder.mutation({
      query: (newTag) => ({
        url: API_ROUTES.ADMIN_TAGS,
        method: 'POST',
        body: newTag,
      }),
      invalidatesTags: ['tag'],
    }),

    updateTag: builder.mutation({
      query: ({ id, ...updatedTag }) => ({
        url: API_ROUTES.ADMIN_TAG_BY_ID(id),
        method: 'PUT',
        body: updatedTag,
      }),
      invalidatesTags: ['tag'],
    }),

    deleteTag: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ADMIN_TAG_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['tag'],
    }),
  }),
});

export const {
  useGetAdminTagsQuery,
  useGetTagsQuery,
  useLazyGetTagsQuery,
  useGetAdminTagByIdQuery,
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;
