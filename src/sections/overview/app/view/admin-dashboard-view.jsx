import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector } from 'react-redux';
import { DashboardContent } from 'src/layouts/dashboard';
import { Box } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { useGetAdminHomeQuery } from 'src/store/Reducer/admin-dashboard-api';
import { EcommerceSaleByGender } from '../../e-commerce/ecommerce-sale-by-gender';
import { EcommerceYearlySales } from '../../e-commerce/ecommerce-yearly-sales';
import { CourseProgress } from '../../course/course-progress';
import { BookingStatistics } from '../../booking/booking-statistics';
import { TopRatedProviders } from '../app-top-rated-providers';
import { TopCustomers } from '../app-top-customers';
import { AdminDashboardSkeleton } from '../dashboard-skeleton';
import { useMemo, useState } from 'react';
import { useTranslate } from 'src/locales/use-locales';

export function AdminDashboardView() {
  const router = useRouter();
  const { t } = useTranslate();

  const ACTIVE_COLOR = '#31c466';
  const INACTIVE_COLOR = '#db4b4b';
  const SUSPENDED_COLOR = '#f59e0b';
  const PENDING_COLOR = '#3b82f6';
  const DELETED_COLOR = '#6b7280';

  const [usersYear, setUsersYear] = useState(new Date().getFullYear());
  const [comparisonYear, setComparisonYear] = useState(new Date().getFullYear());

  const { user } = useSelector((state) => state.user);

  const getGreeting = () => {
    const name = user?.basicInfo?.name || '';
    if (!user || !name) return t('greeting');
    return t('greetingWithName', { name });
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const getBookingsPath = (status) => `${paths.adminDashboard.bookings}?status=${status}`;

  const { data: adminHomeData, isLoading } = useGetAdminHomeQuery({ usersYear, comparisonYear });
  const home = adminHomeData?.data;
  const cards = home?.cards;

  const customersActive = home?.customers?.active ?? 0;
  const customersInactive = home?.customers?.inactive ?? 0;
  const customersSuspended = home?.customers?.suspended ?? 0;
  const customersPending = home?.customers?.pending ?? 0;
  const customersDeleted = home?.customers?.deleted ?? 0;
  const providersActive = home?.providers?.active ?? 0;
  const providersInactive = home?.providers?.inactive ?? 0;
  const providersSuspended = home?.providers?.suspended ?? 0;
  const providersPending = home?.providers?.pending ?? 0;
  const providersDeleted = home?.providers?.deleted ?? 0;

  const usersChartMonths = home?.usersChart?.months || [];
  const comparisonChartMonths = home?.comparisonChart?.months || [];
  const comparisonYearValue = home?.comparisonChart?.year ?? comparisonYear;

  const topRatedProviders = useMemo(
    () =>
      (home?.topRatedProviders || []).map((p) => ({
        _id: p._id,
        name: p.businessName,
        avatar: p.image,
        rating: p.avgRating,
        reviewCount: p.totalReviews,
        category: p.category,
      })),
    [home]
  );

  const topCustomers = useMemo(
    () =>
      (home?.topCustomers || []).map((c) => ({
        _id: c._id,
        name: c.name,
        avatar: c.profileIcon,
        email: c.email,
        totalBookings: c.bookingsCount,
      })),
    [home]
  );

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {getGreeting()}
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {t('welcomeMessage')}
      </Typography>

      {isLoading ? (
        <AdminDashboardSkeleton />
      ) : (
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Box
            sx={{
              gap: 3,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' },
            }}
          >
            <CourseWidgetSummary
              title={t('customers')}
              total={cards?.customers?.total ?? 0}
              color="warning"
              helperText={t('newThisMonthCount', { count: cards?.customers?.thisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clients.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.adminDashboard.customers)}
            />

            <CourseWidgetSummary
              title={t('providers')}
              total={cards?.providers?.total ?? 0}
              color="primary"
              helperText={t('newThisMonthCount', { count: cards?.providers?.thisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-leads-2.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.adminDashboard.providers)}
            />

            <CourseWidgetSummary
              title={t('bookings')}
              total={cards?.bookings?.total ?? 0}
              color="success"
              helperText={t('newThisMonthCount', { count: cards?.bookings?.thisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.adminDashboard.bookings)}
            />

            <CourseWidgetSummary
              title={t('contactSupport')}
              total={cards?.contactSupport?.total ?? 0}
              color="secondary"
              helperText={t('newThisMonthCount', { count: cards?.contactSupport?.thisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-chat.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.adminDashboard.content.support)}
            />

            <CourseWidgetSummary
              title={t('bookingsCompleted')}
              total={cards?.completedBookings?.total ?? 0}
              color="success"
              helperText={t('allTime')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('completed'))}
            />

            <CourseWidgetSummary
              title={t('bookingsRequested')}
              total={cards?.requestedBookings?.total ?? 0}
              color="warning"
              helperText={t('awaitingApproval')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('requested'))}
            />

            <CourseWidgetSummary
              title={t('bookingsOngoing')}
              total={cards?.ongoingBookings?.total ?? 0}
              color="primary"
              helperText={t('currentlyActive')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('ongoing'))}
            />

            <CourseWidgetSummary
              title={t('bookingsExpired')}
              total={cards?.expiredBookings?.total ?? 0}
              color="error"
              helperText={t('noLongerActive')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('expired'))}
            />
          </Box>
        </Grid>

        <Grid xs={12} md={12} lg={8} sx={{ display: 'flex' }}>
          <BookingStatistics
            title={t('users')}
            currentYear={usersYear}
            onYearChange={(year) => setUsersYear(year)}
            chart={{
              options: {
                colors: [ACTIVE_COLOR, INACTIVE_COLOR, SUSPENDED_COLOR, PENDING_COLOR],
              },
              series: [
                {
                  name: t('monthly'),
                  categories: usersChartMonths.map((m) => m.label),
                  data: [
                    { name: t('active'), data: usersChartMonths.map((m) => m.active) },
                    { name: t('inactive'), data: usersChartMonths.map((m) => m.inactive) },
                    { name: t('suspended'), data: usersChartMonths.map((m) => m.suspended) },
                    { name: t('pending'), data: usersChartMonths.map((m) => m.pending) },
                  ],
                },
              ],
            }}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
          <EcommerceSaleByGender
            title={t('devicePlatform')}
            subheader={t('activeUserDevices')}
            total={home?.devicePlatform?.total ?? 0}
            chart={{
              colors: [
                ['#ffcdd2', '#c62828'],
                ['#bbdefb', '#1565c0'],
                ['#c8e6c9', '#2e7d32'],
              ],
              series: [
                { label: 'iOS', value: home?.devicePlatform?.ios ?? 0 },
                { label: 'Android', value: home?.devicePlatform?.android ?? 0 },
                { label: 'Web', value: home?.devicePlatform?.web ?? 0 },
              ],
            }}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
          <CourseProgress
            title={t('customers')}
            chart={{
              colors: [ACTIVE_COLOR, INACTIVE_COLOR, SUSPENDED_COLOR, PENDING_COLOR, DELETED_COLOR],
              series: [
                { label: t('active'), value: customersActive },
                { label: t('inactive'), value: customersInactive },
                { label: t('suspended'), value: customersSuspended },
                { label: t('pending'), value: customersPending },
                { label: t('deleted'), value: customersDeleted },
              ],
            }}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
          <CourseProgress
            title={t('providers')}
            chart={{
              colors: [ACTIVE_COLOR, INACTIVE_COLOR, SUSPENDED_COLOR, PENDING_COLOR, DELETED_COLOR],
              series: [
                { label: t('active'), value: providersActive },
                { label: t('inactive'), value: providersInactive },
                { label: t('suspended'), value: providersSuspended },
                { label: t('pending'), value: providersPending },
                { label: t('deleted'), value: providersDeleted },
              ],
            }}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
          <TopRatedProviders
            title={t('topRatedProviders')}
            subheader={t('highestRatedBusinesses')}
            providers={topRatedProviders}
            onViewAll={() => handleNavigate(`${paths.adminDashboard.providers}?sortBy=rating_high_low`)}
            onRowClick={(id) => handleNavigate(paths.adminDashboard.providerDetails(id))}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
          <TopCustomers
            title={t('topCustomers')}
            subheader={t('mostBookedCustomers')}
            customers={topCustomers}
            onViewAll={() => handleNavigate(`${paths.adminDashboard.customers}?sortBy=totalBookings`)}
            onRowClick={(id) => handleNavigate(paths.adminDashboard.customerDetails(id))}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={8} sx={{ display: 'flex' }}>
          <EcommerceYearlySales
            title={t('users')}
            subheader={String(comparisonYearValue)}
            currentYear={comparisonYear}
            onYearChange={(year) => setComparisonYear(year)}
            chart={{
              colors: ['#a58b67', '#e8d2a6'],
              categories: comparisonChartMonths.map((m) => m.label),
              series: [
                {
                  name: comparisonYearValue,
                  data: [
                    { name: t('customers'), data: comparisonChartMonths.map((m) => m.customers) },
                    { name: t('providers'), data: comparisonChartMonths.map((m) => m.providers) },
                  ],
                },
              ],
            }}
            sx={{ flex: 1 }}
          />
        </Grid>
      </Grid>
      )}
    </DashboardContent>
  );
}
