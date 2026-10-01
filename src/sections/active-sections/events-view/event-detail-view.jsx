import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useGetEventByIdQuery } from 'src/store/Reducer/ticketmaster-api';
import { varAlpha } from 'src/theme/styles';

import { formatEventDate, formatEventDateTime, formatEventPrice, formatEventVenue, INITIAL_EVENTS } from './events-data';

// ----------------------------------------------------------------------

function DetailField({ label, value }) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11, letterSpacing: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function getClassificationChips(event) {
  const categories = event?.categories || {};

  return [categories.segment, categories.genre, categories.subGenre].filter((item) => item && item !== 'Undefined');
}

function ClassificationChips({ event }) {
  const chips = getClassificationChips(event);

  if (!chips.length) return '-';

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
      {chips.map((chip) => (
        <Chip
          key={chip}
          size="small"
          label={chip}
          sx={{
            height: 24,
            borderRadius: 1,
            bgcolor: '#FFF0CC',
            color: '#6B3F00',
            fontWeight: 700,
            '& .MuiChip-label': { px: 1 },
            '&:hover': { bgcolor: '#FFF0CC' },
          }}
        />
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function EventOverviewSection({ event }) {
  return (
    <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5">Overview</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {event.description}
          </Typography>
        </Stack>

        <Divider />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <DetailField label="Event" value={event.title} />
          <DetailField label="Date" value={formatEventDate(event)} />
          <DetailField label="Venue" value={formatEventVenue(event)} />
          <DetailField label="Address" value={[event.venue?.address, event.venue?.city, event.venue?.stateCode, event.venue?.postalCode].filter(Boolean).join(', ')} />
          <Stack spacing={0.75}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11, letterSpacing: 1.2 }}>
              Classifications
            </Typography>
            <ClassificationChips event={event} />
          </Stack>
          <DetailField label="Price" value={formatEventPrice(event)} />
        </Box>

        <Divider />

        <DetailField label="Important Note" value={event.importantNote} />
      </Stack>
    </Card>
  );
}

function EventTicketsSection({ event }) {
  const presale = event.sales?.presales?.[0];

  return (
    <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h5">Ticket Information</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <DetailField label="Status" value={event.date?.status} />
          <DetailField label="Timezone" value={event.date?.timezone} />
          <DetailField label="Public Sale Starts" value={formatEventDateTime(event.sales?.publicStart)} />
          <DetailField label="Public Sale Ends" value={formatEventDateTime(event.sales?.publicEnd)} />
          <DetailField label="Ticket Limit" value={event.ticketLimit?.info} />
          <DetailField label="Accessibility" value={event.accessibility?.info} />
          {event.promoter?.name && <DetailField label="Promoter" value={event.promoter.name} />}
          {event.ageRestrictions?.legalAgeEnforced && <DetailField label="Age Restriction" value="Legal age enforced for this event" />}
        </Box>

        {presale && (
          <>
            <Divider />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <DetailField label="Presale" value={presale.name} />
              <DetailField label="Presale Window" value={[formatEventDateTime(presale.startDateTime), formatEventDateTime(presale.endDateTime)].filter(Boolean).join(' - ')} />
            </Box>
            <DetailField label="Presale Description" value={presale.description} />
          </>
        )}
      </Stack>
    </Card>
  );
}

function EventVenueSection({ event }) {
  const venue = event.venue;
  const boxOffice = venue?.boxOfficeInfo;
  const hasBoxOfficeInfo = boxOffice && (boxOffice.phone || boxOffice.hours || boxOffice.acceptedPayment || boxOffice.willCall);
  const hasVenueExtras = venue && (hasBoxOfficeInfo || venue.parkingDetail || venue.accessibleSeatingDetail || venue.generalRule || venue.childRule);

  if (!hasVenueExtras) return null;

  return (
    <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h5">Venue Information</Typography>

        {hasBoxOfficeInfo && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <DetailField label="Box Office Phone" value={boxOffice.phone} />
            <DetailField label="Box Office Hours" value={boxOffice.hours} />
            <DetailField label="Accepted Payment" value={boxOffice.acceptedPayment} />
            <DetailField label="Will Call" value={boxOffice.willCall} />
          </Box>
        )}

        {(venue.parkingDetail || venue.accessibleSeatingDetail) && (
          <>
            <Divider />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <DetailField label="Parking" value={venue.parkingDetail} />
              <DetailField label="Accessible Seating" value={venue.accessibleSeatingDetail} />
            </Box>
          </>
        )}

        {(venue.generalRule || venue.childRule) && (
          <>
            <Divider />
            <DetailField label="Venue Policy" value={venue.generalRule} />
            <DetailField label="Child Policy" value={venue.childRule} />
          </>
        )}
      </Stack>
    </Card>
  );
}

const SOCIAL_ICONS = {
  instagram: 'mdi:instagram',
  facebook: 'mdi:facebook',
  twitter: 'mdi:twitter',
  youtube: 'mdi:youtube',
  homepage: 'solar:global-bold',
};

function EventPerformerSection({ event }) {
  const performer = event.attractions?.[0];

  if (!performer?.name) return null;

  const socialLinks = Object.entries(performer.socials || {}).filter(([, url]) => Boolean(url));

  return (
    <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={2.5}>
        <Typography variant="h5">Performer</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {performer.image && (
            <Box
              component="img"
              src={performer.image}
              alt={performer.name}
              sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {performer.name}
            </Typography>
            {performer.url && (
              <Button
                size="small"
                href={performer.url}
                target="_blank"
                rel="noopener"
                sx={{ alignSelf: 'flex-start', px: 0, minWidth: 'auto' }}
              >
                View Artist Page
              </Button>
            )}
          </Stack>
        </Stack>

        {socialLinks.length > 0 && (
          <Stack direction="row" spacing={1}>
            {socialLinks.map(([platform, url]) => (
              <Box
                key={platform}
                component="a"
                href={url}
                target="_blank"
                rel="noopener"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                }}
              >
                <Iconify icon={SOCIAL_ICONS[platform] || 'solar:global-bold'} width={18} />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

function EventDetailSkeleton() {
  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: 1 }} />
      </Stack>

      <Card>
        <Skeleton variant="rectangular" height={280} />
      </Card>

      <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Skeleton variant="text" width={140} height={32} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
          </Stack>

          <Divider />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Stack key={i} spacing={0.75}>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width="60%" height={22} />
              </Stack>
            ))}
          </Box>
        </Stack>
      </Card>

      <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={180} height={32} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Stack key={i} spacing={0.75}>
                <Skeleton variant="text" width={100} height={16} />
                <Skeleton variant="text" width="70%" height={22} />
              </Stack>
            ))}
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

export function EventDetailView() {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname.includes('/admin-dashboard');

  const adminEvent = useMemo(() => (isAdmin ? INITIAL_EVENTS.find((item) => item.id === id) || null : null), [id, isAdmin]);

  const { data: customerEvent, isLoading: customerEventLoading } = useGetEventByIdQuery(id, { skip: isAdmin || !id });

  const event = isAdmin ? adminEvent : customerEvent;
  const eventsPath = isAdmin ? paths.adminDashboard.events : paths.dashboard.events;

  if (!isAdmin && customerEventLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
        <Alert severity="warning">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button
          startIcon={<Iconify width={16} height={16} sx={{ fontWeight: 800 }} icon="solar:alt-arrow-left-linear" />}
          onClick={() => router.back()}
          sx={{ color: 'text.primary', fontWeight: 800 }}
        >
          Back
        </Button>

        {event.ticketUrl && (
          <Button
            variant="contained"
            color="primary"
            href={event.ticketUrl}
            target="_blank"
            rel="noopener"
            startIcon={<Iconify width={18} height={18} icon="solar:ticket-bold" />}
          >
            Get Tickets
          </Button>
        )}
      </Stack>

      <Card>
        <Box
          sx={{
            position: 'relative',
            height: 280,
            bgcolor: 'background.neutral',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={event.image}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
            <Label variant="filled" color={event.date?.status === 'onsale' ? 'success' : 'warning'} sx={{ textTransform: 'capitalize', fontSize: '0.875rem', py: 1, px: 2 }}>
              {event.date?.status || 'Event'}
            </Label>
          </Box> */}

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: (theme) => `linear-gradient(to top, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.9)}, transparent)`,
              p: 4,
              pt: 8,
            }}
          >
            <Typography variant="h3" sx={{ color: 'common.white', fontWeight: 700 }}>
              {event.title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="solar:calendar-bold" width={20} sx={{ color: 'common.white' }} />
                <Typography variant="body1" sx={{ color: 'common.white' }}>
                  {formatEventDate(event)}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="solar:map-point-bold" width={20} sx={{ color: 'common.white' }} />
                <Typography variant="body1" sx={{ color: 'common.white' }}>
                  {event.venue?.name}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Card>

      <EventOverviewSection event={event} />
      <EventTicketsSection event={event} />
      <EventVenueSection event={event} />
      <EventPerformerSection event={event} />
    </Container>
  );
}
