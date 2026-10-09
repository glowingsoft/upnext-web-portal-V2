import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const ADMIN_ACCESS_TOKEN = import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

export const authApi = createApi({
  reducerPath: 'auth',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['profile', 'notificationPreferences', 'revenue'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body: login,
      }),
    }),

    socialAuth: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.SOCIAL_AUTH,
        method: 'POST',
        body,
      }),
    }),

    adminLogin: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body: login,
        headers: {
          'x-admin-access-token': ADMIN_ACCESS_TOKEN,
        },
      }),
    }),

    // Login when the account has 2FA enabled returns { requiresTwoFactor: true, email, otp }
    // instead of the user — this completes the login by verifying that OTP.
    verifyLoginOtp: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.LOGIN_VERIFY_OTP,
        method: 'POST',
        body: data,
      }),
    }),

    signup: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.SIGNUP,
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtpEmail: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP_EMAIL,
        method: 'POST',
        body: data,
      }),
    }),

    resendOtpEmail: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.RESEND_OTP_EMAIL,
        method: 'POST',
        body: data,
      }),
    }),

    completeUserProfile: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.COMPLETE_USER_PROFILE,
        method: 'POST',
        body: data,
      }),
    }),

    setBusinessProfile: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.BUSINESS_PROFILE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['profile'],
    }),

    suggestBusinessDescription: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.SUGGEST_BUSINESS_DESCRIPTION,
        method: 'POST',
        body: data,
      }),
    }),

    updateBusinessCertifications: builder.mutation({
      query: ({ files, badgeId, optionId }) => ({
        url: API_ROUTES.AUTH.BUSINESS_PROFILE_CERTIFICATIONS,
        method: 'PATCH',
        body: {
          files,
          ...(badgeId ? { badgeId } : {}),
          ...(optionId ? { optionId } : {}),
        },
      }),
      invalidatesTags: ['profile'],
    }),

    updateBusinessOperatingHours: builder.mutation({
      query: ({ operatingHours }) => ({
        url: API_ROUTES.AUTH.BUSINESS_PROFILE_OPERATING_HOURS,
        method: 'PATCH',
        body: { operatingHours },
      }),
      invalidatesTags: ['profile'],
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.USER_PROFILE,
        method: 'GET',
      }),
      providesTags: ['profile'],
    }),
    // Called once the user lands on the dashboard post-login; response shape/mapping into the
    // dashboard widgets is TBD — for now this just wires up the fetch.
    getHome: builder.query({
      query: (arg) => ({
        url: API_ROUTES.HOME,
        method: 'GET',
        params: {
          ...(arg?.lat != null && arg?.lng != null ? { lat: arg.lat, lng: arg.lng } : {}),
        },
      }),
    }),

    uploadS3: builder.mutation({
      query: (formData) => ({
        url: API_ROUTES.UPLOAD_S3,
        method: 'POST',
        body: formData,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: API_ROUTES.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    }),

    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: API_ROUTES.AUTH.REFRESH_TOKEN,
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    switchAccount: builder.mutation({
      query: () => ({
        url: API_ROUTES.AUTH.SWITCH_ACCOUNT,
        method: 'PATCH',
      }),
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: API_ROUTES.AUTH.DELETE_ACCOUNT,
        method: 'DELETE',
      }),
    }),

    logoutUser: builder.mutation({
      query: ({ deviceId }) => ({
        url: API_ROUTES.AUTH.LOGOUT,
        method: 'POST',
        body: { deviceId },
      }),
    }),

    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.USER_PROFILE,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['profile'],
    }),

    getAdminProfile: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.ADMIN_PROFILE,
        method: 'GET',
      }),
      providesTags: ['profile'],
    }),

    updateAdminProfile: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.ADMIN_PROFILE,
        method: 'PUT',
        body: { language: 'en', ...data },
      }),
      invalidatesTags: ['profile'],
    }),

    getNotificationPreferences: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.NOTIFICATION_PREFERENCES,
        method: 'GET',
      }),
      providesTags: ['notificationPreferences'],
    }),

    updateNotificationPreferences: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.NOTIFICATION_PREFERENCES,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['notificationPreferences'],
    }),

    toggleTwoFactor: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.TWO_FACTOR,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['profile'],
    }),

    getPayoutMethods: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.PAYOUT_METHODS,
        method: 'GET',
      }),
    }),

    getBusinessAnalytics: builder.query({
      query: (range) => ({
        url: API_ROUTES.AUTH.ANALYTICS,
        method: 'GET',
        params: { range },
      }),
    }),

    getBusinessRevenue: builder.query({
      query: (range) => ({
        url: API_ROUTES.AUTH.REVENUE,
        method: 'GET',
        params: { range },
      }),
      providesTags: ['revenue'],
    }),

    withdrawFunds: builder.mutation({
      query: (data) => ({
        url: API_ROUTES.AUTH.WITHDRAW,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['revenue'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSocialAuthMutation,
  useVerifyLoginOtpMutation,
  useAdminLoginMutation,
  useSignupMutation,
  useVerifyOtpEmailMutation,
  useResendOtpEmailMutation,
  useCompleteUserProfileMutation,
  useSetBusinessProfileMutation,
  useSuggestBusinessDescriptionMutation,
  useUpdateBusinessCertificationsMutation,
  useUpdateBusinessOperatingHoursMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useGetHomeQuery,
  useUploadS3Mutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateUserProfileMutation,
  useRefreshTokenMutation,
  useSwitchAccountMutation,
  useDeleteAccountMutation,
  useLogoutUserMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetAdminProfileQuery,
  useLazyGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useToggleTwoFactorMutation,
  useGetPayoutMethodsQuery,
  useGetBusinessAnalyticsQuery,
  useGetBusinessRevenueQuery,
  useWithdrawFundsMutation,
} = authApi;
