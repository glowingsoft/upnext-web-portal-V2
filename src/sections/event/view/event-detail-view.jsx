import { useParams } from 'react-router-dom';

import { Box, Button, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { useGetEventByIdQuery } from 'src/store/Reducer/ticketmaster-api';

import SurfaceCard from 'src/sections/home/landing/SurfaceCard';
import { brand } from 'src/sections/home/landing/theme';
import { formatEventDate, formatEventDateTime, formatEventPrice, formatEventVenue } from 'src/sections/active-sections/events-view/events-data';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

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

function getClassificationChips(event) {
  const categories = event?.categories || {};
  const chips = [categories.segment, categories.genre, categories.subGenre].filter((item) => item && item !== 'Undefined');
  return [...new Set(chips)];
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
            bgcolor: alpha(brand.green[400], 0.12),
            color: brand.green[800],
            fontWeight: 700,
            '& .MuiChip-label': { px: 1 },
            '&:hover': { bgcolor: alpha(brand.green[400], 0.12) },
          }}
        />
      ))}
    </Stack>
  );
}

function EventOverviewSection({ event }) {
  return (
    <SurfaceCard sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {event.description}
          </Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <DetailField label="Event" value={event.title} />
          <DetailField label="Date" value={formatEventDate(event)} />
          <DetailField label="Venue" value={formatEventVenue(event)} />
          <DetailField
            label="Address"
            value={[event.venue?.address, event.venue?.city, event.venue?.stateCode, event.venue?.postalCode].filter(Boolean).join(', ')}
          />
          <Stack spacing={0.75}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11, letterSpacing: 1.2 }}>
              Classifications
            </Typography>
            <ClassificationChips event={event} />
          </Stack>
          <DetailField label="Price" value={formatEventPrice(event)} />
        </Box>

        {event.importantNote && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <DetailField label="Important Note" value={event.importantNote} />
          </>
        )}
      </Stack>
    </SurfaceCard>
  );
}

function EventTicketsSection({ event }) {
  const presale = event.sales?.presales?.[0];

  return (
    <SurfaceCard sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Ticket Information
        </Typography>

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
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <DetailField label="Presale" value={presale.name} />
              <DetailField
                label="Presale Window"
                value={[formatEventDateTime(presale.startDateTime), formatEventDateTime(presale.endDateTime)].filter(Boolean).join(' - ')}
              />
            </Box>
            <DetailField label="Presale Description" value={presale.description} />
          </>
        )}
      </Stack>
    </SurfaceCard>
  );
}

function EventVenueSection({ event }) {
  const venue = event.venue;
  const boxOffice = venue?.boxOfficeInfo;
  const hasBoxOfficeInfo = boxOffice && (boxOffice.phone || boxOffice.hours || boxOffice.acceptedPayment || boxOffice.willCall);
  const hasVenueExtras = venue && (hasBoxOfficeInfo || venue.parkingDetail || venue.accessibleSeatingDetail || venue.generalRule || venue.childRule);

  if (!hasVenueExtras) return null;

  return (
    <SurfaceCard sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Venue Information
        </Typography>

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
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <DetailField label="Parking" value={venue.parkingDetail} />
              <DetailField label="Accessible Seating" value={venue.accessibleSeatingDetail} />
            </Box>
          </>
        )}

        {(venue.generalRule || venue.childRule) && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <DetailField label="Venue Policy" value={venue.generalRule} />
            <DetailField label="Child Policy" value={venue.childRule} />
          </>
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
    <SurfaceCard sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={2.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Performer
        </Typography>

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
                sx={{ alignSelf: 'flex-start', px: 0, minWidth: 'auto', color: brand.green[600] }}
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
                  '&:hover': { color: brand.green[600], borderColor: brand.green[400] },
                }}
              >
                <Iconify icon={SOCIAL_ICONS[platform] || 'solar:global-bold'} width={18} />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </SurfaceCard>
  );
}

function EventDetailSkeleton() {
  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: 99 }} />
        </Stack>

        <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={280} sx={{ transform: 'none' }} />
        </SurfaceCard>

        <SurfaceCard sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Skeleton variant="text" width={140} height={32} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Stack key={i} spacing={0.75}>
                  <Skeleton variant="text" width={80} height={16} />
                  <Skeleton variant="text" width="60%" height={22} />
                </Stack>
              ))}
            </Box>
          </Stack>
        </SurfaceCard>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function EventDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const { data: event, isLoading } = useGetEventByIdQuery(id, { skip: !id });

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
        <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          <SurfaceCard sx={{ py: 7, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Event not found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This event may no longer be available.
            </Typography>
          </SurfaceCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Button
            startIcon={<Iconify width={16} height={16} icon="solar:alt-arrow-left-linear" />}
            onClick={() => router.back()}
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            Back
          </Button>

          {event.ticketUrl && (
            <Button
              variant="contained"
              href={event.ticketUrl}
              target="_blank"
              rel="noopener"
              startIcon={<Iconify width={18} height={18} icon="solar:ticket-bold" />}
              sx={{ bgcolor: brand.green[600], '&:hover': { bgcolor: brand.green[700] } }}
            >
              Get Tickets
            </Button>
          )}
        </Stack>

        <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', height: 280, bgcolor: alpha(brand.green[400], 0.12) }}>
            {event.image && (
              <Box component="img" src={event.image} alt={event.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(11,18,32,0.88), transparent)',
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

                {event.venue?.name && (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Iconify icon="solar:map-point-bold" width={20} sx={{ color: 'common.white' }} />
                    <Typography variant="body1" sx={{ color: 'common.white' }}>
                      {event.venue.name}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Box>
        </SurfaceCard>

        <EventOverviewSection event={event} />
        <EventTicketsSection event={event} />
        <EventVenueSection event={event} />
        <EventPerformerSection event={event} />
      </Box>
    </Box>
  );
}
