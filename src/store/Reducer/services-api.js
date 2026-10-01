import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['service', 'package', 'promotion', 'reviews', 'category'],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: ({ page = 1, limit = 10, keyword, serviceType, categoryId, isAvailable, status, lat, lng } = {}) => ({
        url: API_ROUTES.SERVICES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(serviceType && serviceType !== 'all' ? { serviceType } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(status ? { status } : {}),
          // Customer's live browser location, when granted — lets the backend compute real
          // distance for this request instead of falling back to their saved profile address.
          ...(lat != null && lng != null ? { lat, lng } : {}),
        },
      }),
      providesTags: ['service'],
    }),
    getPublicServices: builder.query({
      query: ({ page = 1, limit = 10, keyword } = {}) => ({
        url: API_ROUTES.PUBLIC_SERVICES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['service'],
    }),

    getServiceCategories: builder.query({
      query: ({ page = 1, limit = 100, keyword } = {}) => ({
        url: API_ROUTES.SERVICE_CATEGORIES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['category'],
    }),
    createServiceCategory: builder.mutation({
      query: (payload) => {
        const { name, description } = typeof payload === 'string' ? { name: payload } : payload;
        return {
          url: API_ROUTES.SERVICE_CATEGORIES,
          method: 'POST',
          body: { name, ...(description ? { description } : {}) },
        };
      },
      invalidatesTags: ['category'],
    }),
    updateServiceCategory: builder.mutation({
      query: ({ id, name, status }) => ({
        url: API_ROUTES.SERVICE_CATEGORY_BY_ID(id),
        method: 'PUT',
        body: { name, status },
      }),
      invalidatesTags: ['category'],
    }),
    suggestServiceCategory: builder.mutation({
      query: ({ name, description, selectedCategoryId }) => ({
        url: API_ROUTES.SUGGEST_SERVICE_CATEGORY,
        method: 'POST',
        body: { name, description, ...(selectedCategoryId ? { selectedCategoryId } : {}) },
      }),
    }),
    getServiceById: builder.query({
      // Accepts either a plain id, or { id, lat, lng } — sending the customer's location gets
      // real per-item distance back on this service's suggestedServices, same as the
      // marketplace list.
      query: (arg) => {
        const { id, lat, lng } = typeof arg === 'object' && arg !== null ? arg : { id: arg };
        return {
          url: API_ROUTES.SERVICE_BY_ID(id),
          method: 'GET',
          params: {
            ...(lat != null && lng != null ? { lat, lng } : {}),
          },
        };
      },
      providesTags: (result, error, arg) => [{ type: 'service', id: typeof arg === 'object' && arg !== null ? arg.id : arg }],
    }),
    createService: builder.mutation({
      query: (service) => ({
        url: API_ROUTES.SERVICES,
        method: 'POST',
        body: service,
      }),
      invalidatesTags: ['service'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...service }) => ({
        url: API_ROUTES.SERVICE_BY_ID(id),
        method: 'PUT',
        body: service,
      }),
      invalidatesTags: (result, error, { id }) => ['service', { type: 'service', id }],
    }),
    getPackages: builder.query({
      query: ({ page = 1, limit = 10, keyword, serviceType, categoryId, isAvailable, status, lat, lng } = {}) => ({
        url: API_ROUTES.PACKAGES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(serviceType && serviceType !== 'all' ? { serviceType } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(status ? { status } : {}),
          ...(lat != null && lng != null ? { lat, lng } : {}),
        },
      }),
      providesTags: ['package'],
    }),
    getPublicPackages: builder.query({
      query: ({ page = 1, limit = 10, keyword } = {}) => ({
        url: API_ROUTES.PUBLIC_PACKAGES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: ['package'],
    }),
    getPackageById: builder.query({
      // Accepts either a plain id, or { id, lat, lng } — see getServiceById above.
      query: (arg) => {
        const { id, lat, lng } = typeof arg === 'object' && arg !== null ? arg : { id: arg };
        return {
          url: API_ROUTES.PACKAGE_BY_ID(id),
          method: 'GET',
          params: {
            ...(lat != null && lng != null ? { lat, lng } : {}),
          },
        };
      },
      providesTags: (result, error, arg) => [{ type: 'package', id: typeof arg === 'object' && arg !== null ? arg.id : arg }],
    }),
    createPackage: builder.mutation({
      query: (packageData) => ({
        url: API_ROUTES.PACKAGES,
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['package'],
    }),
    updatePackage: builder.mutation({
      query: ({ id, ...packageData }) => ({
        url: API_ROUTES.PACKAGE_BY_ID(id),
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: (result, error, { id }) => ['package', { type: 'package', id }],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.SERVICE_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['service'],
    }),
    deletePackage: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.PACKAGE_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['package'],
    }),
    getPromotions: builder.query({
      query: (params) => ({
        url: API_ROUTES.PROMOTIONS,
        method: 'GET',
        params,
      }),
      providesTags: ['promotion'],
    }),
    getPromotionById: builder.query({
      query: (id) => ({
        url: API_ROUTES.PROMOTION_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'promotion', id }],
    }),
    createPromotion: builder.mutation({
      query: (promotionData) => ({
        url: API_ROUTES.PROMOTIONS,
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['promotion'],
    }),
    updatePromotion: builder.mutation({
      query: ({ id, ...promotionData }) => ({
        url: API_ROUTES.PROMOTION_BY_ID(id),
        method: 'PUT',
        body: promotionData,
      }),
      invalidatesTags: (result, error, { id }) => ['promotion', { type: 'promotion', id }],
    }),
    deletePromotion: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.PROMOTION_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['promotion'],
    }),
    checkPromoCode: builder.mutation({
      query: ({ promoCode, scope, targetId }) => ({
        url: API_ROUTES.PROMOTIONS_CHECK_PROMO_CODE,
        method: 'POST',
        body: { promoCode, scope, targetId },
      }),
    }),
    getReviews: builder.query({
      query: ({ scope, targetId, page = 1, limit = 10, rating } = {}) => ({
        url: API_ROUTES.REVIEWS,
        method: 'GET',
        params: {
          scope,
          targetId,
          page,
          limit,
          ...(rating ? { rating } : {}),
        },
      }),
      providesTags: (result, error, arg) => [
        { type: 'reviews', id: `${arg?.scope || 'unknown'}-${arg?.targetId || 'unknown'}` },
      ],
    }),
    createReview: builder.mutation({
      query: ({ bookingId, rating, comment }) => ({
        url: API_ROUTES.REVIEWS,
        method: 'POST',
        body: { bookingId, rating, comment },
      }),
      invalidatesTags: ['reviews'],
    }),
    updateReview: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: API_ROUTES.REVIEW_BY_ID(id),
        method: 'PUT',
        body: { rating, comment },
      }),
      invalidatesTags: ['reviews'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceCategoriesQuery,
  useLazyGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useSuggestServiceCategoryMutation,
  useGetPublicServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetPackagesQuery,
  useGetPublicPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useGetPromotionsQuery,
  useGetPromotionByIdQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useCheckPromoCodeMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} = servicesApi;
