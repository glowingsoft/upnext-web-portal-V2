import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { API_ROUTES } from './apiRoutes';
import { handleApiError } from './handleApiError';
import { logout, setUser } from './slices/userSlice';


const rawBaseQuery = fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL });

let refreshPromise = null;

async function refreshAccessToken(api) {
  const currentUser = api.getState()?.user?.user;
  const currentRefreshToken = currentUser?.refreshToken;
  if (!currentRefreshToken) return null;

  // Deliberately no Authorization header here — this call only ever happens once the access
  // token has expired, so sending it would just get the refresh request itself rejected by any
  // backend middleware that verifies the Bearer token on every route. Auth is via the
  // refreshToken in the body instead.
  const result = await rawBaseQuery(
    {
      url: API_ROUTES.AUTH.REFRESH_TOKEN,
      method: 'POST',
      body: { refreshToken: currentRefreshToken },
    },
    api,
    {}
  );

  if (result?.error) {
    console.error('Refresh token failed:', result.error);
    return null;
  }

  return result?.data?.data || null;
}

function forceLogout(api) {
  api.dispatch(logout());
  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
}

export const createCustomFetchBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Skip custom headers for S3 upload — they cause CORS preflight failures
      if (endpoint === 'uploadS3') return headers;

      const state = getState();
      const token = state?.user?.user?.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  });

  return async (arg, api, extraOptions) => {
    let result = await baseQuery(arg, api, extraOptions);

    if (result.error?.status === 401) {
      const url = typeof arg === 'string' ? arg : arg?.url;
      const isAuthEndpoint =
        url === API_ROUTES.AUTH.REFRESH_TOKEN || url === API_ROUTES.AUTH.LOGIN || url === API_ROUTES.AUTH.LOGIN_VERIFY_OTP;

      if (!isAuthEndpoint) {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken(api).finally(() => {
            refreshPromise = null;
          });
        }

        const refreshed = await refreshPromise;

        if (refreshed?.token) {
          const currentUser = api.getState()?.user?.user;
          api.dispatch(setUser({ ...currentUser, token: refreshed.token, refreshToken: refreshed.refreshToken }));

          // Retry the original request now that we have a fresh token.
          result = await baseQuery(arg, api, extraOptions);
        } else {
          forceLogout(api);
          return result;
        }
      }
    }

    if (result.error) {
      const message = handleApiError(result.error);
      console.error('API Error:', message);

      if (result.error.status === 401) {
        const isBrowser = typeof window !== 'undefined';
        const isOnAuthPage =
          isBrowser &&
          (window.location.pathname === '/' ||
            window.location.pathname === '/login' ||
            window.location.pathname === '/admin/login' ||
            window.location.pathname.startsWith('/auth'));

        if (!isOnAuthPage) {
          forceLogout(api);
        }
      }
    }

    return result;
  };
};
