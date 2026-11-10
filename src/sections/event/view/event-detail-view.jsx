import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { useGetEventByIdQuery } from 'src/store/Reducer/ticketmaster-api';

import SurfaceCard from 'src/sections/home/landing/SurfaceCard';
import { brand } from 'src/sections/home/landing/theme';
import { formatEventDate, formatEventDateTime, formatEventPrice } from 'src/sections/active-sections/events-view/events-data';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

const pageSx = { pt: { xs: 9, md: 11 }, pb: { xs: 6, md: 8 }, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' };

const hairline = `1px solid ${alpha(brand.green[400], 0.18)}`;

const cardSx = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: 3,
  border: `1px solid ${alpha(brand.green[400], 0.2)}`,
};

const headingSx = {
  fontWeight: 700,
  fontSize: { xs: '1.4rem', sm: '1.4rem', md: '1.6rem', lg: '1.6rem' },
};

const overlineSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'text.secondary',
};

const STATUS_LABELS = {
  onsale: 'On sale',
  offsale: 'Off sale',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  postponed: 'Postponed',
  rescheduled: 'Rescheduled',
};

// ----------------------------------------------------------------------

function formatPrettyEventDate(event) {
  const { localDate, localTime } = event?.date || {};
  if (!localDate) return '';

  const date = new Date(`${localDate}T${localTime || '00:00:00'}`);
  if (Number.isNaN(date.getTime())) return formatEventDate(event);

  const datePart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  if (!localTime) return datePart;

  return `${datePart} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function formatPrettyDateTime(value, timeZone) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatEventDateTime(value);

  const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
  try {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timeZone || undefined, timeZoneName: 'short' }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

function formatStatus(status) {
  if (!status) return '';
  const key = String(status).toLowerCase();
  return STATUS_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function getClassifications(event) {
  const categories = event?.categories || {};
  const chips = [categories.segment, categories.genre, categories.subGenre].filter((item) => item && item !== 'Undefined');
  return [...new Set(chips)];
}

function getMapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// ----------------------------------------------------------------------

function DetailField({ label, value }) {
  if (!value) return null;

  return (
    <Box>
      <Typography sx={{ ...overlineSx, mb: 0.75 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'text.primary', wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
  );
}

function InfoRow({ icon, label, children }) {
  if (!children) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.75, borderTop: hairline }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: brand.green[600],
          bgcolor: alpha(brand.green[400], 0.12),
        }}
      >
        <Iconify icon={icon} width={18} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ ...overlineSx, mb: 0.25 }}>{label}</Typography>
        <Box sx={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'text.primary', wordBreak: 'break-word' }}>{children}</Box>
      </Box>
    </Box>
  );
}

function getNearParams(event) {
  const lat = Number(event.venue?.latitude);
  const lng = Number(event.venue?.longitude);
  if (!event.venue?.latitude || !event.venue?.longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  const near = [event.venue?.name, event.venue?.city].filter(Boolean).join(', ');
  if (near) params.set('near', near);
  return params.toString();
}

function BookProviderButton({ event }) {
  const router = useRouter();
  const user = useSelector((state) => state.user?.user);
  const userType = user?.accountState?.userType;
  const isCustomer = userType === 'user' || userType === 'customer';
  const nearParams = getNearParams(event);

  if (!nearParams || (user?.token && !isCustomer)) return null;

  const handleClick = () => {
    router.push(user?.token ? `${paths.dashboard.providers}?${nearParams}` : `/?${nearParams}`);
  };

  return (
    <Box
      component="button"
      type="button"
      onClick={handleClick}
      sx={{
        mb: 2.5,
        width: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: 3.5,
        py: 1.5,
        borderRadius: 99,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: brand.green[600],
        bgcolor: 'transparent',
        border: `1.5px solid ${brand.green[400]}`,
        transition: 'background-color 0.18s ease',
        '&:hover': { bgcolor: alpha(brand.green[400], 0.08) },
      }}
    >
      <Iconify icon="solar:user-hand-up-bold" width={18} />
      Book a Provider
    </Box>
  );
}

function EventTicketCard({ event }) {
  const timezone = event.date?.timezone;
  const price = formatEventPrice(event);
  const status = formatStatus(event.date?.status);
  const isOnSale = String(event.date?.status || '').toLowerCase() === 'onsale';
  const presale = event.sales?.presales?.[0];

  const address = [event.venue?.address, event.venue?.city, event.venue?.stateCode, event.venue?.postalCode].filter(Boolean).join(', ');
  const saleWindow = [formatPrettyDateTime(event.sales?.publicStart, timezone), formatPrettyDateTime(event.sales?.publicEnd, timezone)]
    .filter(Boolean)
    .join(' – ');
  const presaleWindow = presale
    ? [formatPrettyDateTime(presale.startDateTime, timezone), formatPrettyDateTime(presale.endDateTime, timezone)].filter(Boolean).join(' – ')
    : '';

  return (
    <SurfaceCard sx={cardSx}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...overlineSx, mb: 0.5 }}>{price ? 'Tickets from' : 'Tickets'}</Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontVariantNumeric: 'lining-nums', fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.6rem', lg: '1.75rem' } }}
          >
            {price || 'See ticket site'}
          </Typography>
        </Box>

        {status && (
          <Box
            sx={{
              mt: 0.5,
              px: 1.25,
              py: 0.4,
              flexShrink: 0,
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: isOnSale ? 'success.dark' : 'text.secondary',
              bgcolor: (theme) => (isOnSale ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.text.primary, 0.06)),
              border: (theme) => `1px solid ${isOnSale ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.text.primary, 0.12)}`,
            }}
          >
            {status}
          </Box>
        )}
      </Box>

      {event.ticketUrl && (
        <Box
          component="a"
          href={event.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            mb: 2.5,
            width: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 3.5,
            py: 1.6,
            borderRadius: 99,
            textDecoration: 'none',
            backgroundColor: brand.green[400],
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: `0 8px 20px ${alpha(brand.green[400], 0.35)}`,
            transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
            '&:hover': { backgroundColor: brand.green[600], boxShadow: `0 10px 24px ${alpha(brand.green[600], 0.35)}` },
          }}
        >
          <Iconify icon="solar:ticket-bold" width={18} />
          Get Tickets
          <Iconify icon="mingcute:external-link-line" width={15} />
        </Box>
      )}

      <BookProviderButton event={event} />

      <InfoRow icon="solar:calendar-bold" label="Date & time">
        {formatPrettyEventDate(event)}
      </InfoRow>

      <InfoRow icon="solar:map-point-bold" label="Venue">
        {(event.venue?.name || address) && (
          <>
            {event.venue?.name && <Box sx={{ fontWeight: 600 }}>{event.venue.name}</Box>}
            {address && (
              <Box
                component="a"
                href={getMapsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { color: brand.green[600], textDecoration: 'underline', textUnderlineOffset: 3 },
                }}
              >
                {address}
              </Box>
            )}
          </>
        )}
      </InfoRow>

      <InfoRow icon="solar:clock-circle-bold" label="Public sale">
        {saleWindow}
      </InfoRow>

      <InfoRow icon="solar:star-bold" label={presale?.name || 'Presale'}>
        {presaleWindow && (
          <>
            {presaleWindow}
            {presale.description && <Box sx={{ mt: 0.5, color: 'text.secondary' }}>{presale.description}</Box>}
          </>
        )}
      </InfoRow>

      <InfoRow icon="solar:users-group-rounded-bold" label="Ticket limit">
        {event.ticketLimit?.info}
      </InfoRow>

      <InfoRow icon="solar:shield-check-bold" label="Age restriction">
        {event.ageRestrictions?.legalAgeEnforced ? 'Legal age enforced for this event' : ''}
      </InfoRow>

      <InfoRow icon="solar:accessibility-bold" label="Accessibility">
        {event.accessibility?.info}
      </InfoRow>

      <InfoRow icon="solar:microphone-3-bold" label="Promoter">
        {event.promoter?.name}
      </InfoRow>
    </SurfaceCard>
  );
}

function EventAboutSection({ event }) {
  const chips = getClassifications(event);
  const note = event.importantNote && event.importantNote.trim() !== (event.description || '').trim() ? event.importantNote : '';

  if (!event.description && !note && !chips.length) return null;

  return (
    <SurfaceCard sx={cardSx}>
      <Typography variant="h4" sx={{ ...headingSx, mb: 2 }}>
        About this event
      </Typography>

      {chips.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: event.description || note ? 2.5 : 0 }}>
          {chips.map((chip) => (
            <Box
              key={chip}
              sx={{
                px: 1.25,
                py: 0.4,
                borderRadius: 99,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: brand.green[800],
                bgcolor: alpha(brand.green[400], 0.06),
                border: `1px solid ${alpha(brand.green[400], 0.35)}`,
              }}
            >
              {chip}
            </Box>
          ))}
        </Box>
      )}

      {event.description && (
        <Typography sx={{ fontSize: '1rem', lineHeight: 1.85, color: 'text.secondary', whiteSpace: 'pre-line' }}>{event.description}</Typography>
      )}

      {note && (
        <Box sx={{ mt: 3, pt: 3, borderTop: hairline }}>
          <DetailField label="Important note" value={note} />
        </Box>
      )}
    </SurfaceCard>
  );
}

function EventVenueSection({ event }) {
  const venue = event.venue;
  const boxOffice = venue?.boxOfficeInfo;
  const hasBoxOfficeInfo = boxOffice && (boxOffice.phone || boxOffice.hours || boxOffice.acceptedPayment || boxOffice.willCall);
  const hasVenueExtras = venue && (hasBoxOfficeInfo || venue.parkingDetail || venue.accessibleSeatingDetail || venue.generalRule || venue.childRule);

  if (!hasVenueExtras) return null;

  const gridSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 };

  return (
    <SurfaceCard sx={cardSx}>
      <Typography variant="h4" sx={{ ...headingSx, mb: 2.5 }}>
        Venue information
      </Typography>

      <Stack spacing={3} divider={<Box sx={{ borderTop: hairline }} />}>
        {hasBoxOfficeInfo && (
          <Box sx={gridSx}>
            <DetailField label="Box office phone" value={boxOffice.phone} />
            <DetailField label="Box office hours" value={boxOffice.hours} />
            <DetailField label="Accepted payment" value={boxOffice.acceptedPayment} />
            <DetailField label="Will call" value={boxOffice.willCall} />
          </Box>
        )}

        {(venue.parkingDetail || venue.accessibleSeatingDetail) && (
          <Box sx={gridSx}>
            <DetailField label="Parking" value={venue.parkingDetail} />
            <DetailField label="Accessible seating" value={venue.accessibleSeatingDetail} />
          </Box>
        )}

        {(venue.generalRule || venue.childRule) && (
          <Stack spacing={3}>
            <DetailField label="Venue policy" value={venue.generalRule} />
            <DetailField label="Child policy" value={venue.childRule} />
          </Stack>
        )}
      </Stack>
    </SurfaceCard>
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
    <SurfaceCard sx={cardSx}>
      <Typography variant="h4" sx={{ ...headingSx, mb: 2.5 }}>
        Performer
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {performer.image && (
          <Box
            component="img"
            src={performer.image}
            alt={performer.name}
            sx={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${alpha(brand.green[400], 0.3)}` }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.4 }}>{performer.name}</Typography>
          {performer.url && (
            <Box
              component="a"
              href={performer.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                fontWeight: 700,
                color: brand.green[600],
                textDecoration: 'none',
                '&:hover': { color: brand.green[800], textDecoration: 'underline', textUnderlineOffset: 3 },
              }}
            >
              View artist page
              <Iconify icon="mingcute:external-link-line" width={14} />
            </Box>
          )}
        </Box>

        {socialLinks.length > 0 && (
          <Stack direction="row" spacing={1}>
            {socialLinks.map(([platform, url]) => (
              <Box
                key={platform}
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: brand.green[600],
                  border: `1px solid ${alpha(brand.green[400], 0.5)}`,
                  transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                  '&:hover': { color: '#fff', bgcolor: brand.green[400], borderColor: brand.green[400] },
                }}
              >
                <Iconify icon={SOCIAL_ICONS[platform] || 'solar:global-bold'} width={18} />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </SurfaceCard>
  );
}

function BackLink({ onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        mb: 2.5,
        p: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'text.secondary',
        '&:hover': { color: brand.green[600] },
      }}
    >
      <Iconify icon="mingcute:arrow-left-line" width={18} />
      Back
    </Box>
  );
}

export function EventDetailSkeletonContent() {
  return (
    <>
      <Skeleton variant="text" width={70} height={32} sx={{ mb: 2.5 }} />

      <Skeleton variant="rounded" sx={{ mb: 3, borderRadius: 3, height: { xs: 240, md: 380 } }} />

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
          <SurfaceCard sx={cardSx}>
            <Skeleton variant="text" width={200} height={36} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }}>
              {[64, 58, 52].map((width, index) => (
                <Skeleton key={index} variant="rounded" width={width} height={26} sx={{ borderRadius: 99 }} />
              ))}
            </Box>
            <Skeleton variant="text" width="100%" height={22} />
            <Skeleton variant="text" width="96%" height={22} />
            <Skeleton variant="text" width="92%" height={22} />
            <Skeleton variant="text" width="60%" height={22} />
          </SurfaceCard>
        </Grid>

        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
          <SurfaceCard sx={cardSx}>
            <Skeleton variant="text" width={90} height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={150} height={36} sx={{ mb: 2.5 }} />
            <Skeleton variant="rounded" height={50} sx={{ mb: 2.5, borderRadius: 99 }} />
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.75, borderTop: hairline }}>
                <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={14} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Box>
              </Box>
            ))}
          </SurfaceCard>
        </Grid>
      </Grid>
    </>
  );
}

export function EventNotFoundContent({ onBack }) {
  return (
    <>
      <BackLink onClick={onBack} />
      <SurfaceCard sx={{ ...cardSx, py: 7, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ ...headingSx, mb: 1 }}>
          Event not found
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>This event may no longer be available.</Typography>
      </SurfaceCard>
    </>
  );
}

export function EventDetailContent({ event, onBack, stickyTop = 88 }) {
  const prettyDate = formatPrettyEventDate(event);

  return (
    <>
      <BackLink onClick={onBack} />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
          borderRadius: 3,
          height: { xs: 240, md: 380 },
          bgcolor: brand.green[100],
          border: `1px solid ${alpha(brand.green[400], 0.2)}`,
        }}
      >
        {event.image && (
          <Box component="img" src={event.image} alt={event.title} sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }} />
        )}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: { xs: 2.5, md: 5 },
            background: 'linear-gradient(to top, rgba(11,18,32,0.9) 0%, rgba(11,18,32,0.35) 45%, transparent 75%)',
          }}
        >
          <Typography
            component="h1"
            variant="h1"
            sx={{
              maxWidth: 880,
              color: 'common.white',
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
            }}
          >
            {event.title}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 0.75, mt: { xs: 1.25, md: 2 } }}>
            {prettyDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'common.white', fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 500 }}>
                <Iconify icon="solar:calendar-bold" width={18} />
                {prettyDate}
              </Box>
            )}

            {event.venue?.name && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'common.white', fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 500 }}>
                <Iconify icon="solar:map-point-bold" width={18} />
                {[event.venue.name, event.venue.city].filter(Boolean).join(', ')}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
          <Stack spacing={3}>
            <EventAboutSection event={event} />
            <EventVenueSection event={event} />
            <EventPerformerSection event={event} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 }, position: { md: 'sticky' }, top: { md: stickyTop } }}>
          <EventTicketCard event={event} />
        </Grid>
      </Grid>
    </>
  );
}

// ----------------------------------------------------------------------

function PublicPage({ children }) {
  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={pageSx}>{children}</Box>
    </Box>
  );
}

export function EventDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const { data: event, isLoading } = useGetEventByIdQuery(id, { skip: !id });
  const handleBack = () => router.back();

  if (isLoading) {
    return (
      <PublicPage>
        <EventDetailSkeletonContent />
      </PublicPage>
    );
  }

  return <PublicPage>{event ? <EventDetailContent event={event} onBack={handleBack} /> : <EventNotFoundContent onBack={handleBack} />}</PublicPage>;
}
