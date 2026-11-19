import i18next from 'i18next';
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// The app's own i18n language code for Mandarin is 'cn' (see src/locales/all-langs.js), but the
// backend's multi-language content maps key Mandarin as 'zh' — translate before sending the header.
const LANG_TO_API_LANG = { cn: 'zh' };
const getApiLanguage = () => {
  const lng = i18next.language || 'en';
  return LANG_TO_API_LANG[lng] || lng;
};

const LEGAL_TYPE_TO_ADMIN_URL = {
  terms: API_ROUTES.ADMIN_SETTINGS.TERMS,
  about: API_ROUTES.ADMIN_SETTINGS.ABOUT,
  privacy: API_ROUTES.ADMIN_SETTINGS.PRIVACY,
};

const LEGAL_TYPE_TO_URL = {
  terms: API_ROUTES.SETTINGS.TERMS,
  about: API_ROUTES.SETTINGS.ABOUT,
  privacy: API_ROUTES.SETTINGS.PRIVACY,
};

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['legalContent', 'faq', 'instantSettings'],
  endpoints: (builder) => ({
    getInstantSettings: builder.query({
      query: () => ({ url: API_ROUTES.ADMIN_INSTANT_SETTINGS, method: 'GET' }),
      providesTags: ['instantSettings'],
    }),

    updateInstantSettings: builder.mutation({
      query: (body) => ({ url: API_ROUTES.ADMIN_INSTANT_SETTINGS, method: 'PUT', body }),
      invalidatesTags: ['instantSettings'],
    }),

    getAdminLegalContent: builder.query({
      query: (type) => ({
        url: LEGAL_TYPE_TO_ADMIN_URL[type] || LEGAL_TYPE_TO_ADMIN_URL.about,
        method: 'GET',
        headers: { 'Accept-Language': '' },
      }),
      providesTags: ['legalContent'],
    }),

    createSettings: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.ADMIN_SETTINGS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['legalContent'],
    }),

    updateSettings: builder.mutation({
      query: ({ id, ...data }) => ({
        url: API_ROUTES.ADMIN_SETTINGS.UPDATE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['legalContent'],
    }),

    // ---- Admin: FAQs CRUD ----
    getAdminFaqs: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.ADMIN_SETTINGS.FAQS,
        method: 'GET',
        params: { page, limit },
        headers: { 'Accept-Language': '' },
      }),
      providesTags: ['faq'],
    }),

    addFaq: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.ADMIN_SETTINGS.FAQS,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['faq'],
    }),

    updateFaq: builder.mutation({
      query: ({ id, ...data }) => ({
        url: API_ROUTES.ADMIN_SETTINGS.FAQ_BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['faq'],
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ADMIN_SETTINGS.FAQ_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['faq'],
    }),

    // ---- User/business: read-only ----
    getLegalContent: builder.query({
      query: (type) => ({
        url: LEGAL_TYPE_TO_URL[type] || LEGAL_TYPE_TO_URL.about,
        method: 'GET',
        headers: { 'x-language': getApiLanguage() },
      }),
      providesTags: ['legalContent'],
    }),

    getFaqs: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.SETTINGS.FAQS,
        method: 'GET',
        params: { page, limit },
        headers: { 'x-language': getApiLanguage() },
      }),
      providesTags: ['faq'],
    }),
  }),
});

export const {
  useGetInstantSettingsQuery,
  useUpdateInstantSettingsMutation,
  useGetAdminLegalContentQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useGetAdminFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetLegalContentQuery,
  useGetFaqsQuery,
} = settingsApi;
