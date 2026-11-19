import { useEffect } from 'react';
import { keyframes } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { useLiveOffers, useNow } from '../live-offers-context';
import { OfferCard } from '../offer-card';
import { LiveDot } from '../incoming-offer-notification';

const radar = keyframes`
  0% { transform: scale(0.6); opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0; }
`;

const OFFER_TABS = [
  { value: 'pending', label: 'Incoming', countKey: 'incoming' },
  { value: 'accepted', label: 'Accepted', countKey: 'accepted' },
  { value: 'declined', label: 'Declined', countKey: 'declined' },
  { value: 'expired', label: 'Expired', countKey: 'expired' },
  { value: 'closed', label: 'Closed', countKey: 'closed' },
];

const EMPTY_COPY = {
  pending: { title: 'No incoming offers right now', text: 'New booking requests will appear here automatically.' },
  accepted: { title: 'No accepted offers found', text: 'Accepted offers will appear here.' },
  declined: { title: 'No declined offers found', text: 'Declined offers will appear here.' },
  expired: { title: 'No expired offers found', text: 'Expired offers will appear here.' },
  closed: { title: 'No closed offers found', text: 'Closed offers will appear here.' },
};

function EmptyState({ status, acceptedCount = 0, onViewBookings }) {
  const copy = EMPTY_COPY[status] || EMPTY_COPY.pending;
  const showAcceptedBookings = acceptedCount > 0 && (status === 'pending' || status === 'accepted');

  return (
    <Card sx={{ py: { xs: 6, md: 8 }, px: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', boxShadow: 'none' }}>
      <Box sx={{ position: 'relative', width: 96, height: 96, mx: 'auto', mb: 3 }}>
        {[0, 0.8].map((delay) => (
          <Box
            key={delay}
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              animation: `${radar} 2.4s ease-out ${delay}s infinite`,
            }}
          />
        ))}
        <Box
          sx={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          }}
        >
          <Iconify icon="solar:bell-bing-bold-duotone" width={36} />
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {copy.title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto' }}>
        {showAcceptedBookings
          ? `You have ${acceptedCount} accepted ${acceptedCount === 1 ? 'booking' : 'bookings'}. Follow ${acceptedCount === 1 ? 'it' : 'them'} in Bookings.`
          : copy.text}
      </Typography>
      {showAcceptedBookings && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={onViewBookings}>
          View bookings
        </Button>
      )}
    </Card>
  );
}

function OfferListLoading() {
  return (
    <Stack spacing={2} aria-label="Loading offers">
      {[0, 1].map((item) => (
        <Card key={item} sx={{ p: { xs: 2, md: 2.5 }, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rounded" width={112} height={112} sx={{ flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={72} height={22} />
              <Skeleton width="42%" height={28} />
              <Skeleton width="64%" height={24} />
              <Skeleton width="82%" height={24} />
            </Box>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

export function LiveOffersView() {
  const live = useLiveOffers();
  const router = useRouter();

  const offers = live?.offers || [];
  const counts = live?.counts || { all: 0, incoming: 0, accepted: 0, declined: 0, expired: 0, closed: 0 };
  const selectedStatus = live?.status || 'pending';
  const activateAllTabs = live?.activateAllTabs;

  useEffect(() => {
    activateAllTabs?.();
  }, [activateAllTabs]);

  const list = [...offers].sort((a, b) => {
    if (a.status === 'incoming' && b.status !== 'incoming') return -1;
    if (b.status === 'incoming' && a.status !== 'incoming') return 1;
    return a.status === 'incoming' ? a.expiresAt - b.expiresAt : 0;
  });
  const now = useNow(list.some((offer) => offer.status === 'incoming'));
  const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1.5} component="span">
            <span>Live Booking Offers</span>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: 99,
                typography: 'caption',
                fontWeight: 800,
                letterSpacing: 1,
                color: 'error.main',
                bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12),
              }}
            >
              <LiveDot size={7} />
              LIVE
            </Box>
          </Stack>
        }
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Live Booking Offers' }]}
        sx={{ mb: 1 }}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Booking requests arrive in real time. Respond before each offer expires.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <CourseWidgetSummary onClick={() => live?.setStatus('pending')} role="button" title="Incoming offers" total={counts.incoming} color="warning" icon={icon('ic-booking')} helperText={counts.incoming ? 'Waiting for your answer' : 'None waiting'} sx={{ cursor: 'pointer', ...(selectedStatus === 'pending' && { outline: (theme) => `2px solid ${theme.vars.palette.primary.main}` }) }} />
        <CourseWidgetSummary onClick={() => live?.setStatus('accepted')} role="button" title="Accepted" total={counts.accepted} color="success" icon={icon('ic-booking')} helperText="Accepted bookings" sx={{ cursor: 'pointer', ...(selectedStatus === 'accepted' && { outline: (theme) => `2px solid ${theme.vars.palette.primary.main}` }) }} />
        <CourseWidgetSummary onClick={() => live?.setStatus('declined')} role="button" title="Declined" total={counts.declined} color="error" icon={icon('ic-booking')} helperText="Offers declined" sx={{ cursor: 'pointer', ...(selectedStatus === 'declined' && { outline: (theme) => `2px solid ${theme.vars.palette.primary.main}` }) }} />
        <CourseWidgetSummary onClick={() => live?.setStatus('expired')} role="button" title="Expired" total={counts.expired} color="warning" icon={icon('ic-booking')} helperText="Offers expired" sx={{ cursor: 'pointer', ...(selectedStatus === 'expired' && { outline: (theme) => `2px solid ${theme.vars.palette.primary.main}` }) }} />
        <CourseWidgetSummary onClick={() => live?.setStatus('closed')} role="button" title="Closed" total={counts.closed} color="info" icon={icon('ic-booking')} helperText="Offers closed" sx={{ cursor: 'pointer', ...(selectedStatus === 'closed' && { outline: (theme) => `2px solid ${theme.vars.palette.primary.main}` }) }} />
      </Box>

      {live?.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {live.error?.data?.message || live.error?.error || 'Could not load live booking offers.'}
        </Alert>
      )}

      <Tabs
        value={selectedStatus}
        onChange={(_, value) => live?.setStatus(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Offer status"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {OFFER_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={`${tab.label} (${counts[tab.countKey] ?? 0})`} />
        ))}
      </Tabs>


      {live?.isFetching && !live?.hasCurrentData ? (
        <OfferListLoading />
      ) : list.length === 0 ? (
        <EmptyState
          status={selectedStatus}
          acceptedCount={counts.accepted}
          onViewBookings={() => router.push(paths.dashboard.bookings)}
        />
      ) : (
        <Stack spacing={2}>
          {list.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              now={now}
              onAccept={live.acceptOffer}
              onDecline={live.declineOffer}
              isResponding={live.isResponding}
            />
          ))}
        </Stack>
      )}
    </DashboardContent>
  );
}
