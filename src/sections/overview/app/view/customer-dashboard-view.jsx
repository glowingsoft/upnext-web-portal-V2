import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';

import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { SCHEDULE_STATUS_ACCENTS, MONTH_LABELS, BOOKING_STATUS_LABEL_KEYS, formatSlotTime12h, getInitials } from 'src/utils/schedule-format';
import { useGetHomeQuery } from 'src/store/Reducer/auth';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { AppSessionStatus } from '../app-session-status';
import { AppSessionsOverTime } from '../app-sessions-over-time';
import { AppSuggestedEvents } from '../app-suggested-events';
import { AppSuggestedServices } from '../app-suggested-services';
import { AppTodaysSchedule } from '../app-todays-schedule';
import { TopRatedProviders } from '../app-top-rated-providers';
import { OutstandingDebtBanner } from '../outstanding-debt-banner';
import { CustomerDashboardSkeleton } from '../dashboard-skeleton';


const DASHBOARD_SUGGESTED_PROVIDERS_ROW_MIN_HEIGHT = 480;

// ----------------------------------------------------------------------

function formatUpcomingEventDate(event) {
  const date = new Date(`${event.date}T${event.time || '00:00:00'}`);

  if (Number.isNaN(date.getTime())) return event.date || '';

  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = event.time ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

  return [datePart, timePart].filter(Boolean).join(' - ');
}

function normalizeSuggestedService(item) {
  return {
    _id: item._id,
    name: item.name,
    photos: item.photos,
    durationMins: item.sessionSlotMins,
    averageRating: item.avgRating,
    providerName: item.business?.businessName,
    price: item.price,
    distanceKm: item.distance ?? item.distanceKm ?? item.business?.location?.distanceKm ?? item.business?.distanceKm,
  };
}

function normalizeCustomerTodaysSchedule(item) {
  const { time, meridiem } = formatSlotTime12h(item.slot?.open);
  const businessName = item.businessInfo?.businessName || 'Business';
  const statusKey = String(item.status || '').toLowerCase();

  return {
    id: item._id || item.bookingId,
    time,
    meridiem,
    title: item.name || item.target?.[0]?.name || 'Booking',
    location: businessName,
    price: fCurrency(item.price ?? item.target?.[0]?.price ?? 0),
    statusKey,
    accent: SCHEDULE_STATUS_ACCENTS[statusKey] || '#64748b',
    initials: getInitials(businessName),
    avatar: normalizeImageUrl(item.businessInfo?.image),
  };
}

function normalizeSuggestedBusiness(item) {
  return {
    _id: item._id,
    name: item.businessName,
    avatar: normalizeImageUrl(item.image) || normalizeImageUrl(item.user?.profileIcon),
    rating: item.rating?.avgRating ?? 0,
    reviewCount: item.rating?.totalReviews ?? 0,
    category: item.categories?.[0]?.name || '',
    isAvailable: item.isAvailable !== false,
    distance: item.distance ?? item.distanceKm ?? item.location?.distanceKm,
  };
}

function mapUpcomingEventToSuggestedItem(event) {
  const location = [event.city, event.state].filter(Boolean).join(', ');
  const subtitle = [[event.venue, location].filter(Boolean).join(', '), formatUpcomingEventDate(event)].filter(Boolean).join(' - ');

  return {
    id: event.id,
    title: event.name,
    subtitle,
    image: event.image,
    categories: event.genre || event.segment || '',
  };
}

export function CustomerDashboardView() {
  const router = useRouter();
  const { t } = useTranslate();

  const { user } = useSelector((state) => state.user);

  // Session location (set at login) — lets the backend compute real distance on this page's
  // suggestedServices/suggestedBusinesses, same as the marketplace and provider detail pages.
  const myLocation = getMyLocation();
  const hasRealMyLocation = isRealCoords(myLocation?.lat, myLocation?.lng);

  const { data: homeData, isLoading, refetch: refetchHome } = useGetHomeQuery(
    hasRealMyLocation ? { lat: myLocation.lat, lng: myLocation.lng } : undefined,
    { skip: !user?.token }
  );

  const summary = homeData?.data?.summary;
  const outstandingDebt = homeData?.data?.outstandingDebt;

  const topRatedProviders = useMemo(() => {
    const list = homeData?.data?.suggestedBusinesses || [];

    return [...list]
      .sort((a, b) => (b.rating?.avgRating ?? 0) - (a.rating?.avgRating ?? 0) || (b.rating?.totalReviews ?? 0) - (a.rating?.totalReviews ?? 0))
      .slice(0, 5)
      .map(normalizeSuggestedBusiness);
  }, [homeData?.data?.suggestedBusinesses]);

  const suggestedServices = useMemo(
    () =>
      (homeData?.data?.suggestedServices || [])
        .map(normalizeSuggestedService)
        .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
        .slice(0, 3),
    [homeData?.data?.suggestedServices]
  );

  const suggestedEvents = useMemo(
    () => (homeData?.data?.suggestedEvents || []).slice(0, 3).map(mapUpcomingEventToSuggestedItem),
    [homeData?.data?.suggestedEvents]
  );

  const todaysAppointments = useMemo(() => {
    const list = [...(homeData?.data?.todaysSchedules || [])];
    list.sort((a, b) => String(a.slot?.open || '').localeCompare(String(b.slot?.open || '')));
    return list.map(normalizeCustomerTodaysSchedule);
  }, [homeData?.data?.todaysSchedules]);

  const bookingStatus = homeData?.data?.bookingStatus;
  const bookingStatusChart = useMemo(() => {
    const rawItems = bookingStatus?.items || [];
    const items = rawItems.filter((item) => item.status !== 'all');
    const allItem = rawItems.find((item) => item.status === 'all');
    return {
      total: allItem?.count ?? bookingStatus?.total ?? 0,
      series: items.map((item) => ({
        label: t(BOOKING_STATUS_LABEL_KEYS[item.status] || item.status),
        value: item.count ?? 0,
      })),
      colors: items.map((item) => SCHEDULE_STATUS_ACCENTS[item.status] || '#64748b'),
    };
  }, [bookingStatus, t]);

  const bookingsOverTime = homeData?.data?.bookingsOverTime;
  const sessionsOverTimeChart = useMemo(() => {
    const items = bookingsOverTime?.items || [];
    const yearLabel = String(bookingsOverTime?.year ?? new Date().getFullYear());

    return {
      [yearLabel]: {
        categories: items.map((item) => MONTH_LABELS[item.monthKey] || item.monthKey),
        data: items.map((item) => item.count ?? 0),
      },
    };
  }, [bookingsOverTime]);

  const getGreeting = () => {
    const name = user?.basicInfo?.name || '';
    return name ? t('greetingWithName', { name }) : t('greeting');
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const getBookingsPath = (status) => `${paths.dashboard.bookings}?status=${status}`;

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {getGreeting()}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {t('welcomeMessage')}
      </Typography>

      <OutstandingDebtBanner debt={outstandingDebt} onPaymentSuccess={refetchHome} />

      {isLoading ? (
        <CustomerDashboardSkeleton />
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
              title={t('providers')}
              total={summary?.providers?.count ?? 0}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clients.svg`}
              color="info"
              helperText={t('newThisMonthCount', { count: summary?.providers?.change ?? 0 })}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.dashboard.providers)}
            />

            <CourseWidgetSummary
              title={t('amountSpent')}
              total={(summary?.amountSpent?.amountMinor ?? 0) / 100}
              currency="$"
              color="success"
              helperText={t('thisMonth')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-revenue.svg`}
            />

            <CourseWidgetSummary
              title={t('scheduledAppointments')}
              total={summary?.scheduledAppointments?.count ?? 0}
              color="secondary"
              helperText={t('thisMonth')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('scheduled'))}
            />
            <CourseWidgetSummary
              title={t('bookingsCompleted')}
              total={summary?.completedBookings?.count ?? 0}
              color="success"
              helperText={t('allTime')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('completed'))}
            />
          </Box>
        </Grid>

        <Grid xs={12} md={12}>
          <Box
            sx={{
              gap: 3,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            }}
          >
            <CourseWidgetSummary
              title={t('bookingsRequested')}
              total={summary?.requestedBookings?.count ?? 0}
              color="warning"
              helperText={t('awaitingApproval')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('requested'))}
            />

            <CourseWidgetSummary
              title={t('bookingsOngoing')}
              total={summary?.ongoingBookings?.count ?? 0}
              color="primary"
              helperText={t('currentlyActive')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('ongoing'))}
            />

            <CourseWidgetSummary
              title={t('bookingsScheduled')}
              total={summary?.scheduledBookings?.count ?? 0}
              color="info"
              helperText={t('upcomingBookings')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('scheduled'))}
            />

            <CourseWidgetSummary
              title={t('bookingsExpired')}
              total={summary?.expiredBookings?.count ?? 0}
              color="error"
              helperText={t('noLongerActive')}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('expired'))}
            />
          </Box>
        </Grid>

        <Grid xs={12} md={5} lg={4}>
          <AppSessionStatus
            title={t('bookingStatus')}
            sx={{ height: 1 }}
            chart={bookingStatusChart}
          />
        </Grid>

        <Grid xs={12} md={7} lg={8}>
          <AppSessionsOverTime
            title={t('bookingsOverTime')}
            subheader={t('monthlyBookings')}
            sx={{ height: 1 }}
            chart={sessionsOverTimeChart}
          />
        </Grid>

        <Grid xs={12} md={6} lg={6} sx={{ display: 'flex' }}>
          <AppSuggestedServices
            title={t('suggestedServices')}
            services={suggestedServices}
            onViewAll={() => handleNavigate(paths.dashboard.services)}
            onServiceClick={(id) => handleNavigate(paths.dashboard.serviceDetails(id))}
            sx={{ flex: 1, height: 440 }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={6} sx={{ display: 'flex' }}>
          <TopRatedProviders
            title={t('topRatedProviders')}
            // subheader="Highest rated businesses"
            providers={topRatedProviders}
            onViewAll={() => handleNavigate(paths.dashboard.providers)}
            onRowClick={(id) => handleNavigate(paths.dashboard.providerDetails(id))}
            sx={{ flex: 1, height: 440 }}
          />
        </Grid>

        <Grid xs={12} md={7} lg={8} sx={{ display: 'flex', alignItems: 'stretch' }}>
          <AppTodaysSchedule appointments={todaysAppointments} sx={{ flex: 1, width: 1, height: 440 }} onViewCalendar={() => handleNavigate(paths.dashboard.calendar)} />
        </Grid>

        <Grid xs={12} md={5} lg={4} sx={{ display: 'flex', alignItems: 'stretch' }}>
          <AppSuggestedEvents
            title={t('suggestedEvents')}
            events={suggestedEvents}
            onViewAll={() => handleNavigate(paths.dashboard.events)}
            onEventClick={(id) => handleNavigate(paths.dashboard.eventDetails(id))}
            sx={{ flex: 1, width: 1, height: 440 }}
          />
        </Grid>
      </Grid>
      )}
    </DashboardContent>
  );
}
