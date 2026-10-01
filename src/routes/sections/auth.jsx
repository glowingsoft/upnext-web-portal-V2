import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
  SignUpCompletePage: lazy(() => import('src/pages/auth/jwt/sign-up-complete')),
  ForgetPasswordPage: lazy(() => import('src/pages/auth/jwt/forget-password')),
  VerifyPasswordPage: lazy(() => import('src/pages/auth/jwt/verify-password')),
  VerifyAccountPage: lazy(() => import('src/pages/auth/jwt/verify-account')),
  VerifyLoginOtpPage: lazy(() => import('src/pages/auth/jwt/verify-login-otp')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/jwt/reset-password')),
};

const authJwt = {
  path: '',
  children: [
    {
      path: 'sign-in',
      element: <Navigate to={paths.auth.jwt.signIn} replace />,
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up/complete-profile',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.SignUpCompletePage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'forget-password',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.ForgetPasswordPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify-otp',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.VerifyPasswordPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify-account',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.VerifyAccountPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify-login-otp',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.VerifyLoginOtpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.ResetPasswordPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
  ],
};

/** **************************************
 * Auth0
 *************************************** */
const Auth0 = {
  SignInPage: lazy(() => import('src/pages/auth/auth0/sign-in')),
  CallbackPage: lazy(() => import('src/pages/auth/auth0/callback')),
};

const authAuth0 = {
  path: 'auth0',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthSplitLayout section={{ title: 'Hi, Welcome back' }}>
            <Auth0.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'callback',
      element: (
        <GuestGuard>
          <Auth0.CallbackPage />
        </GuestGuard>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt, authAuth0],
  },
];
