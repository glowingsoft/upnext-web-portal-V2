import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { ChatSocketProvider } from 'src/sections/chat/chat-socket-provider';

import ProtectedRoute from 'src/auth/guard/custom-auth-guard';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/active-routes/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
const OverviewSamplePage = lazy(() => import('src/pages/dashboard/sample'));

const WalletsPage = lazy(() => import('src/pages/dashboard/active-routes/wallets'));
const SamplePage = lazy(() => import('src/pages/dashboard/active-routes/sample'));
const LeadsPage = lazy(() => import('src/pages/dashboard/active-routes/leads'));
const CalendarActivePage = lazy(() => import('src/pages/dashboard/active-routes/calendar'));
const TasksPage = lazy(() => import('src/pages/dashboard/active-routes/tasks'));
const ChatActivePage = lazy(() => import('src/pages/dashboard/active-routes/chat'));
// const ResourcesPage = lazy(() => import('src/pages/dashboard/active-routes/resources'));
// const PlansPage = lazy(() => import('src/pages/dashboard/active-routes/plans'));
const TransactionsPage = lazy(() => import('src/pages/dashboard/active-routes/transactions'));
const OverviewIncomeCategoryPage = lazy(() => import('src/pages/dashboard/active-routes/income'));
const OverviewExpenseCategoryPage = lazy(() => import('src/pages/dashboard/active-routes/expense'));
const UserTermsPage = lazy(() => import('src/pages/dashboard/active-routes/user-terms'));
const UserPrivacyPage = lazy(() => import('src/pages/dashboard/active-routes/user-privacy'));
const UserAboutUsPage = lazy(() => import('src/pages/dashboard/active-routes/user-about-us'));
const UserFaqsPage = lazy(() => import('src/pages/dashboard/active-routes/user-faqs'));
const UserContactUsPage = lazy(() => import('src/pages/dashboard/active-routes/user-contact-us'));
const UserNotificationsPage = lazy(() => import('src/pages/dashboard/active-routes/user-notification'));
const AnalyticsPage = lazy(() => import('src/pages/dashboard/active-routes/analytics'));
const UserHelpCenterPage = lazy(() => import('src/pages/dashboard/active-routes/user-help-center'));
const UserSubscriptionPage = lazy(() => import('src/pages/dashboard/active-routes/user-subscription'));
const UserBillingHistoryPage = lazy(() => import('src/pages/dashboard/active-routes/user-billing-history'));
const UserConnectPage = lazy(() => import('src/pages/dashboard/active-routes/user-connet'));
const UserManageCardsPage = lazy(() => import('src/pages/dashboard/active-routes/user-connet/manage-cards'));
const UserPayoutMethodPage = lazy(() => import('src/pages/dashboard/active-routes/user-connet/payout-method'));
const PlanPage = lazy(() => import('src/pages/dashboard/active-routes/resources/plans'));
const CheckInsPage = lazy(() => import('src/pages/dashboard/active-routes/resources/check-ins'));
const DocumentsPage = lazy(() => import('src/pages/dashboard/active-routes/resources/documents'));
const ProfilePage = lazy(() => import('src/pages/dashboard/active-routes/profile/account-profile'));
const SevicePage = lazy(() => import('src/pages/dashboard/active-routes/services'));
const ServiceFormPage = lazy(() => import('src/pages/dashboard/active-routes/services/form'));
const ServiceDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/service-details'));
const PackageDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/package-details'));
const RevenuePage = lazy(() => import('src/pages/dashboard/active-routes/revenue'));
const BoostVisibilityPage = lazy(() => import('src/pages/dashboard/active-routes/boost-visibility'));
const BookingsPage = lazy(() => import('src/pages/dashboard/active-routes/bookings'));
const BookingDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/booking-details'));
const BookingSuccessPage = lazy(() => import('src/pages/dashboard/active-routes/booking-success'));
const EventsPage = lazy(() => import('src/pages/dashboard/active-routes/events'));
const EventDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/event-details'));
const ProvidersPage = lazy(() => import('src/pages/dashboard/active-routes/providers'));
const ProviderDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/provider-details'));
const BusinessProfilePage = lazy(() => import('src/pages/dashboard/active-routes/business-profile'));
const BusinessProfileFormPage = lazy(() => import('src/pages/dashboard/active-routes/business-profile/form'));
const OperatingHoursEditPage = lazy(() => import('src/pages/dashboard/active-routes/business-profile/operating-hours'));

// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// Packages
const PackagesListPage = lazy(() => import('src/pages/dashboard/active-routes/packages'));
const PackageFormPage = lazy(() => import('src/pages/dashboard/active-routes/packages/form'));

// Promotions
const PromotionsListPage = lazy(() => import('src/pages/dashboard/active-routes/promotions'));
const PromotionFormPage = lazy(() => import('src/pages/dashboard/active-routes/promotions/form'));
const PromotionDetailsPage = lazy(() => import('src/pages/dashboard/active-routes/promotion-details'));

// ----------------------------------------------------------------------

const layoutContent = (
  <ChatSocketProvider>
    <DashboardLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  </ChatSocketProvider>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    // element: CONFIG.auth.skip ? <>{layoutContent}</> : <>{layoutContent}</>,
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <ProtectedRoute requiredPermission={[2]}>{layoutContent}</ProtectedRoute>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'course', element: <OverviewCoursePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'business-profile', element: <BusinessProfilePage /> },
      { path: 'business-profile/:id/edit', element: <BusinessProfileFormPage /> },
      { path: 'business-profile/operating-hours/edit', element: <OperatingHoursEditPage /> },
      { path: 'sample', element: <SamplePage /> },

      { path: 'leads', element: <LeadsPage /> },
      // { path: 'clients', element: <ClientsPage /> },

      // { path: 'clients/:id', element: <ClientsDetailsPage /> },
      { path: 'calendar', element: <CalendarActivePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'chat', element: <ChatActivePage /> },
      { path: 'services', element: <SevicePage /> },
      { path: 'services/new', element: <ServiceFormPage /> },
      { path: 'services/:id/edit', element: <ServiceFormPage /> },
      { path: 'services/:id', element: <ServiceDetailsPage /> },
      // { path: 'sessions', element: <SessionsPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'bookings/success/:id', element: <BookingSuccessPage /> },
      { path: 'bookings/:id', element: <BookingDetailsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailsPage /> },
      { path: 'providers', element: <ProvidersPage /> },
      { path: 'providers/:id', element: <ProviderDetailsPage /> },
      { path: 'packages', element: <PackagesListPage /> },
      { path: 'packages/new', element: <PackageFormPage /> },
      { path: 'packages/:id/edit', element: <PackageFormPage /> },
      { path: 'packages/:id/*', element: <PackageDetailsPage /> },
      { path: 'packages/:id', element: <PackageDetailsPage /> },
      { path: 'promotions', element: <PromotionsListPage /> },
      { path: 'promotions/new', element: <PromotionFormPage /> },
      { path: 'promotions/:id/edit', element: <PromotionFormPage /> },
      { path: 'promotions/:id/*', element: <PromotionDetailsPage /> },
      { path: 'promotions/:id', element: <PromotionDetailsPage /> },

      {
        path: 'resources',
        children: [
          { element: <PlanPage />, index: true },
          { path: 'plans', element: <PlanPage /> },
          { path: 'check-ins', element: <CheckInsPage /> },
          { path: 'documents', element: <DocumentsPage /> },
        ],
      },

      {
        path: 'settings',
        children: [
          { element: <UserTermsPage />, index: true },
          { path: 'terms-&-conditions', element: <UserTermsPage /> },
          { path: 'privacy-policy', element: <UserPrivacyPage /> },
          { path: 'about-us', element: <UserAboutUsPage /> },
          { path: 'faqs', element: <UserFaqsPage /> },
          { path: 'contact-us', element: <UserContactUsPage /> },
          { path: 'help-center', element: <UserHelpCenterPage /> },
          { path: 'help-center/:id', element: <UserHelpCenterPage /> },
          { path: 'subscription', element: <UserSubscriptionPage /> },
          { path: 'notifications', element: <UserNotificationsPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'analytics/revenue', element: <RevenuePage /> },
          { path: 'revenue/boost', element: <BoostVisibilityPage /> },
          { path: 'billing-history', element: <UserBillingHistoryPage /> },
          { path: 'connect/manage-cards', element: <UserManageCardsPage /> },
          { path: 'connect/payout-method', element: <UserPayoutMethodPage /> },
          { path: 'connect', element: <UserConnectPage /> },
          // { path: 'support', element: <ClientsPage /> },
        ],
      },

      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'pending-users', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
