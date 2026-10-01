import { useMemo } from 'react';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector } from 'react-redux';

import { DashboardContent } from 'src/layouts/dashboard';

import { Box, Button, Skeleton, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { varAlpha } from 'src/theme/styles';
import { fCurrency } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { SCHEDULE_STATUS_ACCENTS, MONTH_LABELS, BOOKING_STATUS_LABEL_KEYS, formatSlotTime12h, getInitials } from 'src/utils/schedule-format';
import { useGetHomeQuery } from 'src/store/Reducer/auth';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { RecentReviewsCard } from '../provider-dashboard-panels';
import { EcommerceYearlySales } from '../../e-commerce/ecommerce-yearly-sales';
import { AppTodaysSchedule } from '../app-todays-schedule';
import { TopCustomers } from '../app-top-customers';
import { AppSessionStatus } from '../app-session-status';
import { ProviderDashboardSkeleton } from '../dashboard-skeleton';

// ----------------------------------------------------------------------

function FinanceStatCard({ icon, label, value, color = 'primary', onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': onClick
          ? {
              borderColor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.4),
              boxShadow: (theme) => `0 10px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
              transform: 'translateY(-1px)',
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
        }}
      >
        <Iconify icon={icon} width={22} sx={{ color: `${color}.main` }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" fontWeight={800} noWrap>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function normalizeTodaysSchedule(item) {
  const { time, meridiem } = formatSlotTime12h(item.slot?.open);
  const customerName = item.userInfo?.name || 'Customer';
  const statusKey = String(item.status || '').toLowerCase();

  return {
    id: item._id || item.bookingId,
    time,
    meridiem,
    title: item.name || item.target?.[0]?.name || 'Booking',
    location: customerName,
    price: fCurrency(item.price ?? item.target?.[0]?.price ?? 0),
    statusKey,
    accent: SCHEDULE_STATUS_ACCENTS[statusKey] || '#64748b',
    initials: getInitials(customerName),
    avatar: normalizeImageUrl(item.userInfo?.profileIcon),
  };
}

export function ProviderDashboardView() {
  const router = useRouter();
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.user);
  const { data: homeData, isLoading } = useGetHomeQuery(undefined, { skip: !user?.token });

  const summary = homeData?.data?.summary;
  const stats = homeData?.data?.stats;
  const stripe = homeData?.data?.stripe || user?.stripe;
  const needsStripeOnboarding = !(stripe?.chargesEnabled && stripe?.onboardingComplete && stripe?.payoutsEnabled);

  const handleCompleteOnboarding = () => {
    if (stripe?.onboardingUrl) {
      window.location.href = stripe.onboardingUrl;
      return;
    }
    handleNavigate(paths.dashboard.appSettings.connect);
  };

  const getGreeting = () => {
    const name = user?.basicInfo?.name || '';
    return `${t('hello')}${name ? ', ' + name : ''}!`;
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const getBookingsPath = (status) => `${paths.dashboard.bookings}?status=${status}`;

  const topCustomers = useMemo(
    () =>
      (homeData?.data?.topCustomers || []).map((item) => ({
        _id: item.customerId,
        name: item.name,
        email: item.email,
        avatar: normalizeImageUrl(item.profileImage),
        totalBookings: item.totalBookings,
      })),
    [homeData?.data?.topCustomers]
  );

  const recentReviews = useMemo(
    () =>
      (homeData?.data?.recentReviews || []).map((review) => ({
        id: review.reviewId,
        name: review.customer?.name || 'Customer',
        avatar: normalizeImageUrl(review.customer?.profileImage),
        rating: review.rating,
        text: review.comment,
        serviceTitle: review.service?.title,
      })),
    [homeData?.data?.recentReviews]
  );

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

  const todaysAppointments = useMemo(() => {
    const list = [...(homeData?.data?.todaysSchedules || [])];
    list.sort((a, b) => String(a.slot?.open || '').localeCompare(String(b.slot?.open || '')));
    return list.map(normalizeTodaysSchedule);
  }, [homeData?.data?.todaysSchedules]);

  const revenueGrowth = homeData?.data?.revenueGrowth;
  const revenueChart = useMemo(() => {
    const items = revenueGrowth?.items || [];
    const yearLabel = String(revenueGrowth?.year ?? new Date().getFullYear());
    const previousYearLabel = String(revenueGrowth?.previousYear ?? Number(yearLabel) - 1);

    return {
      categories: items.map((item) => MONTH_LABELS[item.monthKey] || item.monthKey),
      series: [
        {
          name: yearLabel,
          data: [
            { name: yearLabel, data: items.map((item) => (item.currentYearAmountMinor || 0) / 100) },
            { name: previousYearLabel, data: items.map((item) => (item.previousYearAmountMinor || 0) / 100) },
          ],
        },
      ],
    };
  }, [revenueGrowth]);
  const revenueGrowthSubheader = revenueGrowth
    ? t('revenueGrowthSubheader', { sign: revenueGrowth.growthPercentage >= 0 ? '+' : '', value: revenueGrowth.growthPercentage ?? 0 })
    : '';

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      {isLoading && (
        <Skeleton variant="rounded" sx={{ mb: 3, height: { xs: 132, sm: 100 }, borderRadius: 2.5 }} />
      )}

      {!isLoading && needsStripeOnboarding && (
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2.5,
            mb: 3,
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2.5, md: 3 },
            background: (theme) => `linear-gradient(135deg, ${theme.vars.palette.warning.dark} 0%, ${theme.vars.palette.warning.main} 100%)`,
            boxShadow: (theme) => `0 16px 32px -12px ${varAlpha(theme.vars.palette.warning.mainChannel, 0.4)}`,
          }}
        >
          <Box sx={{ position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
          <Box sx={{ position: 'absolute', bottom: -60, right: 120, width: 140, height: 140, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ position: 'relative' }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 1.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: varAlpha('255 255 255', 0.18),
                }}
              >
                <Iconify icon="solar:card-send-bold" width={26} sx={{ color: 'common.white' }} />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'common.white' }}>
                  {t('completeStripeOnboarding', { defaultValue: 'Complete your Stripe onboarding' })}
                </Typography>
                <Typography variant="body2" sx={{ color: varAlpha('255 255 255', 0.85), mt: 0.25 }}>
                  {t('stripeOnboardingBannerText', {
                    defaultValue:
                      'You need to finish onboarding to accept payments and create your first service, package, or promotion.',
                  })}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="medium"
              onClick={handleCompleteOnboarding}
              endIcon={<Iconify icon="solar:alt-arrow-right-bold" width={18} />}
              sx={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                bgcolor: 'common.white',
                color: 'warning.dark',
                '&:hover': { bgcolor: varAlpha('255 255 255', 0.88) },
              }}
            >
              {t('completeOnboarding', { defaultValue: 'Complete Onboarding' })}
            </Button>
          </Stack>
        </Box>
      )}

      <Typography variant="h4" sx={{ mb: 1 }}>
        {getGreeting()}
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {t('providerDashboardWelcome')}
      </Typography>

      {isLoading ? (
        <ProviderDashboardSkeleton />
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
              total={summary?.customers?.count ?? 0}
              color="info"
              helperText={t('newThisMonthCount', { count: summary?.customers?.newThisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clients.svg`}
            />

            <CourseWidgetSummary
              title={t('bookings')}
              total={summary?.bookings?.count ?? 0}
              color="warning"
              helperText={t('newThisMonthCount', { count: summary?.bookings?.newThisMonth ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-leads-2.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.dashboard.bookings)}
            />

            <CourseWidgetSummary
              title={t('conversionRate', { defaultValue: 'Conversion Rate' })}
              total={summary?.conversionRate?.percentage ?? 0}
              color="success"
              helperText={t('leadToClientPercent', { defaultValue: 'Lead to client (%)' })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-leads-2.svg`}
              // sx={{ cursor: 'pointer' }}
              // onClick={() => handleNavigate(paths.dashboard.chat)}
            />

            <CourseWidgetSummary
              title={t('unansweredMessages', { defaultValue: 'Unanswered Messages' })}
              total={summary?.unansweredMessages?.count ?? 0}
              color="secondary"
              helperText={t('needsFollowUpToday', { defaultValue: 'Needs follow-up today' })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-chat.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(paths.dashboard.chat)}
            />

            <CourseWidgetSummary
              title={t('bookingsThisWeek')}
              total={summary?.bookingsThisWeek?.count ?? 0}
              color="error"
              helperText={t('upcomingCount', { count: summary?.bookingsThisWeek?.upcomingCount ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('scheduled'))}
            />

            <CourseWidgetSummary
              title={t('bookingsCompleted')}
              total={summary?.completedBookings?.count ?? 0}
              color="success"
              helperText={t('completionRate', { value: summary?.completedBookings?.completionRate ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-session.svg`}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(getBookingsPath('completed'))}
            />

            <CourseWidgetSummary
              title={t('profileViews')}
              total={summary?.profileViews?.count ?? 0}
              color="primary"
              helperText={t('fromNewVisitors', { count: summary?.profileViews?.newVisitors ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-profile-searches.svg`}
            />

            <CourseWidgetSummary
              title={t('averageRating')}
              total={summary?.averageRating?.average ?? 0}
              color="warning"
              helperText={t('totalReviews', { count: summary?.averageRating?.reviewCount ?? 0 })}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rating-2.svg`}
            />
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
          <AppSessionStatus
            title={t('bookingStatus')}
            subheader={t('bookingStatusSubheader')}
            sx={{ flex: 1 }}
            chart={bookingStatusChart}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8} sx={{ display: 'flex' }}>
          <EcommerceYearlySales
            title={t('revenueGrowthTrend')}
            subheader={revenueGrowthSubheader}
            chart={revenueChart}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12}>
          <Box
            sx={{
              gap: 3,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' },
            }}
          >
            <FinanceStatCard
              icon="solar:graph-up-bold-duotone"
              label={t('grossRevenue')}
              value={fCurrency(stats?.grossRevenue ?? 0)}
              color="info"
              onClick={() => handleNavigate(paths.dashboard.revenue)}
            />

            <FinanceStatCard
              icon="solar:wallet-money-bold-duotone"
              label={t('netEarned')}
              value={fCurrency(stats?.netEarned ?? 0)}
              color="success"
              onClick={() => handleNavigate(paths.dashboard.revenue)}
            />

            <FinanceStatCard
              icon="solar:hourglass-bold-duotone"
              label={t('pendingPayout')}
              value={fCurrency(stats?.pendingBalance ?? 0)}
              color="warning"
              onClick={() => handleNavigate(paths.dashboard.revenue)}
            />
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
          <AppTodaysSchedule appointments={todaysAppointments} onViewCalendar={() => handleNavigate(paths.dashboard.calendar)} sx={{ flex: 1 }} />
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
          <TopCustomers
            title={t('topCustomers')}
            subheader={t('mostBookedCustomers')}
            customers={topCustomers}
            sx={{ flex: 1 }}
          />
        </Grid>

        <Grid xs={12} md={5} lg={4}>
          <RecentReviewsCard reviews={recentReviews} />
        </Grid>
      </Grid>
      )}
    </DashboardContent>
  );
}
