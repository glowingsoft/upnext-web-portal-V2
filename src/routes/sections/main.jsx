import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { MainLayout } from 'src/layouts/main';
import { LandingLayout } from 'src/layouts/landing';
import { SimpleLayout } from 'src/layouts/simple';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const FaqsPage = lazy(() => import('src/pages/faqs'));
const StylistDetailsPage = lazy(() => import('src/pages/stylist/details'));
const EventDetailsPublicPage = lazy(() => import('src/pages/event/details'));
const AboutPage = lazy(() => import('src/pages/about-us'));
const ContactPage = lazy(() => import('src/pages/contact-us'));
const PrivacyPolicyPage = lazy(() => import('src/pages/privacy-policy'));
const TermsAndConditionsPage = lazy(() => import('src/pages/terms-and-conditions'));
const PricingPage = lazy(() => import('src/pages/pricing'));
const PaymentPage = lazy(() => import('src/pages/payment'));
const ComingSoonPage = lazy(() => import('src/pages/coming-soon'));
const MaintenancePage = lazy(() => import('src/pages/maintenance'));
const LandingSectionPage = lazy(() => import('src/pages/home/landing-section'));
// Product
const ProductListPage = lazy(() => import('src/pages/product/list'));
const ProductDetailsPage = lazy(() => import('src/pages/product/details'));
const ProductCheckoutPage = lazy(() => import('src/pages/product/checkout'));
// Blog
const PostListPage = lazy(() => import('src/pages/post/list'));
const PostDetailsPage = lazy(() => import('src/pages/post/details'));
// Error
const Page500 = lazy(() => import('src/pages/error/500'));
const Page403 = lazy(() => import('src/pages/error/403'));
const Page404 = lazy(() => import('src/pages/error/404'));
// Blank
const BlankPage = lazy(() => import('src/pages/blank'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        element: (
          <MainLayout>
            <Outlet />
          </MainLayout>
        ),
        children: [
          {
            path: 'blank',
            element: <BlankPage />,
          },
          {
            path: 'product',
            children: [
              { element: <ProductListPage />, index: true },
              { path: 'list', element: <ProductListPage /> },
              { path: ':id', element: <ProductDetailsPage /> },
              { path: 'checkout', element: <ProductCheckoutPage /> },
            ],
          },
          {
            path: 'post',
            children: [
              { element: <PostListPage />, index: true },
              { path: 'list', element: <PostListPage /> },
              { path: ':title', element: <PostDetailsPage /> },
            ],
          },
        ],
      },
      {
        path: 'stylist/:id',
        element: (
          <LandingLayout>
            <StylistDetailsPage />
          </LandingLayout>
        ),
      },
      {
        path: 'event/:id',
        element: (
          <LandingLayout>
            <EventDetailsPublicPage />
          </LandingLayout>
        ),
      },
      {
        path: 'how-it-works',
        element: <Navigate to="/" replace state={{ scrollTo: 'how-it-works' }} />,
      },
      {
        path: 'reviews',
        element: <LandingSectionPage section="reviews" />,
      },
      {
        path: 'events',
        element: <LandingSectionPage section="events" />,
      },
      {
        path: 'services',
        element: <LandingSectionPage section="services" />,
      },
      {
        path: 'about-us',
        element: (
          <LandingLayout>
            <AboutPage />
          </LandingLayout>
        ),
      },
      {
        path: 'contact-us',
        element: (
          <LandingLayout>
            <ContactPage />
          </LandingLayout>
        ),
      },
      {
        path: 'faq',
        element: <Navigate to="/faqs" replace />,
      },
      {
        path: 'faqs',
        element: (
          <LandingLayout>
            <FaqsPage />
          </LandingLayout>
        ),
      },
      {
        path: 'privacy-policy',
        element: (
          <LandingLayout>
            <PrivacyPolicyPage />
          </LandingLayout>
        ),
      },
      {
        path: 'terms-and-conditions',
        element: (
          <LandingLayout>
            <TermsAndConditionsPage />
          </LandingLayout>
        ),
      },
      {
        path: 'pricing',
        element: (
          <SimpleLayout>
            <PricingPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'payment',
        element: (
          <SimpleLayout>
            <PaymentPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'coming-soon',
        element: (
          <SimpleLayout content={{ compact: true }}>
            <ComingSoonPage />
          </SimpleLayout>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <SimpleLayout content={{ compact: true }}>
            <MaintenancePage />
          </SimpleLayout>
        ),
      },
      { path: '500', element: <Page500 /> },
      { path: '404', element: <Page404 /> },
      { path: '403', element: <Page403 /> },
    ],
  },
];
