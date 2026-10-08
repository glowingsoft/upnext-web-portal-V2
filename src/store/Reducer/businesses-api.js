import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const businessesApi = createApi({
  reducerPath: 'businessesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['business', 'reviews'],
  endpoints: (builder) => ({
    getBusinesses: builder.query({
      query: ({ page = 1, limit = 10, keyword, businessType, categoryId, isAvailable, minExperience, badges } = {}) => ({
        url: API_ROUTES.BUSINESSES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(businessType && businessType !== 'all' ? { businessType } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(minExperience !== undefined && minExperience !== '' ? { minExperience } : {}),
          ...(badges ? { badges } : {}),
        },
      }),
      providesTags: ['business'],
    }),

    getAdminBusinesses: builder.query({
      query: ({ page = 1, limit = 10, keyword, location, businessType, categoryId, minExperience, badges, date, sortBy, isAvailable, status } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESSES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(keyword ? { keyword } : {}),
          ...(location ? { location } : {}),
          ...(businessType && businessType !== 'all' ? { businessType } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(minExperience !== undefined && minExperience !== '' ? { minExperience } : {}),
          ...(badges ? { badges } : {}),
          ...(date ? { date } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
      }),
      providesTags: ['business'],
    }),

  getPublicBusinesses: builder.query({
      query: ({ page = 1, limit = 10, keyword, location, lat, lng, businessType, categoryId, minExperience, badges, date, sortBy, isAvailable } = {}) => ({
        url: API_ROUTES.PUBLIC_BUSINESSES,
        method: 'GET',
        params: {
          page,
          limit,
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(keyword ? { keyword } : {}),
          ...(location ? { location } : {}),
          ...(lat != null && lng != null ? { lat, lng } : {}),
          ...(businessType && businessType !== 'all' ? { businessType } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(minExperience !== undefined && minExperience !== '' ? { minExperience } : {}),
          ...(badges ? { badges } : {}),
          ...(date ? { date } : {}),
          ...(sortBy ? { sortBy } : {}),
        },
      }),
      // AI search returns several result types side by side; `data` stays the business list for older callers.
      transformResponse: (response) => {
        const { businesses, services, packages, portfolios, ...rest } = response?.data || {};
        return {
          ...response,
          data: businesses || [],
          businesses: businesses || [],
          services: services || [],
          packages: packages || [],
          portfolios: portfolios || [],
          meta: { ...rest, ...response?.meta },
        };
      },
      providesTags: ['business'],
    }),

    searchByImage: builder.mutation({
      query: (image) => {
        if (typeof image === 'string') {
          return { url: API_ROUTES.IMAGE_SEARCH, method: 'POST', body: { imageUrl: image } };
        }
        const body = new FormData();
        body.append('image', image);
        return { url: API_ROUTES.IMAGE_SEARCH, method: 'POST', body };
      },
      transformResponse: (response) => {
        const { businesses, services, packages, portfolios, imageAnalysis } = response?.data || {};
        return {
          ...response,
          data: businesses || [],
          businesses: businesses || [],
          services: services || [],
          packages: packages || [],
          portfolios: portfolios || [],
          imageAnalysis: imageAnalysis || null,
          meta: response?.meta || {},
        };
      },
    }),

    // Public marketplace/homepage — a single business's detail page (services, ratings, reviews, etc.) for customers to browse.
    getPublicBusinessById: builder.query({
      query: (businessId) => ({
        url: API_ROUTES.PUBLIC_BUSINESS_BY_ID(businessId),
        method: 'GET',
      }),
      providesTags: (result, error, businessId) => [{ type: 'business', id: businessId }],
    }),

    // Admin — set a provider's account status (pending/active/inactive/suspended).
    updateProviderStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: API_ROUTES.ADMIN_USERS.UPDATE_PROFILE_STATUS(userId),
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['business'],
    }),

    // Admin — approve/reject a licensed professional's submitted certification documents.
    updateProviderCertification: builder.mutation({
      query: ({ userId, action, rejectionReason }) => ({
        url: API_ROUTES.ADMIN_USERS.UPDATE_CERTIFICATIONS(userId),
        method: 'PATCH',
        body: { action, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
      invalidatesTags: ['business'],
    }),

    // Admin — full business overview for the provider detail page.
    getBusinessOverview: builder.query({
      query: (businessId) => ({
        url: API_ROUTES.ADMIN_BUSINESS_OVERVIEW(businessId),
        method: 'GET',
      }),
      providesTags: (result, error, businessId) => [{ type: 'business', id: businessId }],
    }),

    getBusinessOverviewPublic: builder.query({
      query: (arg) => {
        const { businessId, lat, lng } = typeof arg === 'object' && arg !== null ? arg : { businessId: arg };
        return {
          url: API_ROUTES.BUSINESS_OVERVIEW(businessId),
          method: 'GET',
          params: {
            ...(lat != null && lng != null ? { lat, lng } : {}),
          },
        };
      },
      providesTags: (result, error, arg) => [
        { type: 'business', id: typeof arg === 'object' && arg !== null ? arg.businessId : arg },
      ],
    }),

    // Admin — a specific business's services, for the provider detail page's Services tab.
    getBusinessServices: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword, serviceType } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESS_SERVICES(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(serviceType && serviceType !== 'all' ? { serviceType } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-services` }],
    }),

    // Customer — a specific business's services, for the provider detail page's Services tab.
    getBusinessServicesPublic: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword, serviceType, lat, lng } = {}) => ({
        url: API_ROUTES.BUSINESS_SERVICES(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(serviceType && serviceType !== 'all' ? { serviceType } : {}),
          ...(lat != null && lng != null ? { lat, lng } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-services` }],
    }),

    // Admin — a specific business's packages, for the provider detail page's Packages tab.
    getBusinessPackages: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESS_PACKAGES(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-packages` }],
    }),

    // Customer — a specific business's packages, for the provider detail page's Packages tab.
    getBusinessPackagesPublic: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword, lat, lng } = {}) => ({
        url: API_ROUTES.BUSINESS_PACKAGES(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
          ...(lat != null && lng != null ? { lat, lng } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-packages` }],
    }),

    // Admin — a specific business's promotions, for the provider detail page's Promotions tab.
    getBusinessPromotions: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESS_PROMOTIONS(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-promotions` }],
    }),

    getBusinessPromotionsPublic: builder.query({
      query: ({ businessId, page = 1, limit = 10, keyword, lat, lng } = {}) => ({
        url: API_ROUTES.BUSINESS_PROMOTIONS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(businessId ? { businessId } : {}),
          ...(keyword ? { keyword } : {}),
          ...(lat != null && lng != null ? { lat, lng } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId || 'all'}-promotions` }],
    }),

    // Admin — a specific business's operating hours, for the provider detail page's Operating Hours tab.
    getBusinessOperatingHours: builder.query({
      query: (businessId) => ({
        url: API_ROUTES.ADMIN_BUSINESS_OPERATING_HOURS(businessId),
        method: 'GET',
      }),
      providesTags: (result, error, businessId) => [{ type: 'business', id: `${businessId}-operating-hours` }],
    }),

    // Customer — a specific business's operating hours, for the provider detail page's Operating Hours tab.
    getBusinessOperatingHoursPublic: builder.query({
      query: (businessId) => ({
        url: API_ROUTES.BUSINESS_OPERATING_HOURS(businessId),
        method: 'GET',
      }),
      providesTags: (result, error, businessId) => [{ type: 'business', id: `${businessId}-operating-hours` }],
    }),

    // Admin — update a specific business's operating hours.
    updateBusinessOperatingHours: builder.mutation({
      query: ({ businessId, operatingHours }) => ({
        url: API_ROUTES.ADMIN_BUSINESS_OPERATING_HOURS(businessId),
        method: 'PUT',
        body: { operatingHours },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-operating-hours` }],
    }),

    // Admin — a specific business's bookings, for the provider detail page's Bookings tab.
    getBusinessBookingsByAdmin: builder.query({
      query: ({ businessId, page = 1, limit = 10, status, scope, date, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESS_BOOKINGS(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-bookings` }],
    }),

    // Customer — a specific business's bookings, for the provider detail page's Bookings tab.
    getBusinessBookingsPublic: builder.query({
      query: ({ businessId, page = 1, limit = 10, status, scope, date, keyword } = {}) => ({
        url: API_ROUTES.APP_BUSINESS_BOOKINGS(businessId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...(date ? { date } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-bookings` }],
    }),

    // Admin — a specific business's reviews, for the provider detail page's Reviews tab.
    getBusinessReviews: builder.query({
      query: ({ businessId, page = 1, limit = 10, rating } = {}) => ({
        url: API_ROUTES.ADMIN_BUSINESS_REVIEWS(businessId),
        method: 'GET',
        params: { page, limit, ...(rating ? { rating } : {}) },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-reviews` }],
    }),

    // Customer — a specific business's reviews, for the provider detail page's Reviews tab.
    getBusinessReviewsPublic: builder.query({
      query: ({ businessId, page = 1, limit = 10, rating } = {}) => ({
        url: API_ROUTES.BUSINESS_REVIEWS(businessId),
        method: 'GET',
        params: { page, limit, ...(rating ? { rating } : {}) },
      }),
      providesTags: (result, error, arg) => [{ type: 'business', id: `${arg?.businessId}-reviews` }],
    }),

    // Admin — global cross-business reviews list (moderation), for the admin Reviews page.
    getAdminReviews: builder.query({
      query: ({ scope, targetId, page = 1, limit = 10, rating, status, keyword } = {}) => ({
        url: API_ROUTES.ADMIN_REVIEWS,
        method: 'GET',
        params: {
          page,
          limit,
          ...(scope ? { scope } : {}),
          ...(targetId ? { targetId } : {}),
          ...(rating ? { rating } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      transformResponse: (response) => ({
        data: response?.data?.reviews || [],
        meta: {
          page: response?.meta?.page,
          limit: response?.meta?.limit,
          total: response?.meta?.total,
          stats: response?.data?.stats || {},
          statusCounts: response?.data?.statusCounts || {},
        },
      }),
      providesTags: ['reviews'],
    }),

    // Admin — moderate a review (approve, or reject with an optional reason).
    updateReviewStatus: builder.mutation({
      query: ({ businessId, reviewId, status, reason }) => ({
        url: API_ROUTES.ADMIN_REVIEW_STATUS(businessId, reviewId),
        method: 'PATCH',
        body: { status, ...(reason ? { reason } : {}) },
      }),
      invalidatesTags: (result, error, { businessId }) => [
        'reviews',
        { type: 'business', id: businessId },
        { type: 'business', id: `${businessId}-reviews` },
      ],
    }),

    // Admin — permanently delete a review.
    deleteReview: builder.mutation({
      query: ({ businessId, reviewId }) => ({
        url: API_ROUTES.ADMIN_REVIEW_BY_ID(businessId, reviewId),
        method: 'DELETE',
      }),
      invalidatesTags: ['reviews'],
    }),
  }),
});

export const {
  useGetBusinessesQuery,
  useGetAdminBusinessesQuery,
  useGetPublicBusinessesQuery,
  useSearchByImageMutation,
  useGetPublicBusinessByIdQuery,
  useUpdateProviderStatusMutation,
  useUpdateProviderCertificationMutation,
  useGetBusinessOverviewQuery,
  useGetBusinessOverviewPublicQuery,
  useGetBusinessServicesQuery,
  useGetBusinessServicesPublicQuery,
  useGetBusinessPackagesQuery,
  useGetBusinessPackagesPublicQuery,
  useGetBusinessPromotionsQuery,
  useGetBusinessPromotionsPublicQuery,
  useGetBusinessOperatingHoursQuery,
  useGetBusinessOperatingHoursPublicQuery,
  useUpdateBusinessOperatingHoursMutation,
  useGetBusinessBookingsByAdminQuery,
  useGetBusinessBookingsPublicQuery,
  useGetBusinessReviewsQuery,
  useGetBusinessReviewsPublicQuery,
  useGetAdminReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} = businessesApi;
