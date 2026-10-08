import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { GuestGuard } from 'src/auth/guard';
import { AuthSplitLayout } from 'src/layouts/auth-split';
import { SplashScreen } from 'src/components/loading-screen';
import { CONFIG } from 'src/config-global';
import { hasComingSoonAccess } from 'src/utils/coming-soon-access';
import { adminDashboardRoutes } from './admin-dashboard';
import { authRoutes } from './auth';
// import { authDemoRoutes } from './auth-demo';
// import { componentsRoutes } from './components';
import { dashboardRoutes } from './dashboard';
import { mainRoutes } from './main';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/home'));
const ComingSoonPage = lazy(() => import('src/pages/coming-soon'));
const ContactPage = lazy(() => import('src/pages/contact-us'));

const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  AdminLoginPage: lazy(() => import('src/pages/auth/jwt/admin-login')),
};

export function Router() {
  if (CONFIG.site.comingSoon && !hasComingSoonAccess()) {
    return useRoutes([
      {
        path: '/contact-us',
        element: (
          <Suspense fallback={<SplashScreen />}>
            <ContactPage />
          </Suspense>
        ),
      },
      { path: '*', element: <ComingSoonPage /> },
    ]);
  }

  return useRoutes([
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <GuestGuard>
            <AuthSplitLayout>
              <Jwt.SignInPage />
            </AuthSplitLayout>
          </GuestGuard>
        </Suspense>
      ),
    },
    {
      path: '/admin/login',
      /**
       * Skip home page
       * element: <Navigate to={CONFIG.auth.redirectPath} replace />,
       */
      element: (
        // <Suspense fallback={<SplashScreen />}>
        //   <MainLayout>
        //     <HomePage />
        //   </MainLayout>
        // </Suspense>
        <GuestGuard>
          <AuthSplitLayout section={{ title: 'UpNext' }}>
            <Jwt.AdminLoginPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },

    // Auth
    ...authRoutes,
    // ...authDemoRoutes,

    // Dashboard
    ...dashboardRoutes,

    // Admin Dashboard
    ...adminDashboardRoutes,

    // Main
    ...mainRoutes,

    // Components
    // ...componentsRoutes,

    // No match
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
