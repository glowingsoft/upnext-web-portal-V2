import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fCurrency } from 'src/utils/format-number';
import { getCancellationPolicy } from 'src/utils/cancellation-policy';

// ----------------------------------------------------------------------

const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

// ----------------------------------------------------------------------

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', flex: '0 0 45%' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', flex: '1 1 55%' }}>
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}

function SectionDivider({ title }) {
  return (
    <Box sx={{ mt: 1.5, mb: 0.5 }}>
      {title && (
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
          {title}
        </Typography>
      )}
      <Divider sx={{ mt: title ? 0.5 : 0 }} />
    </Box>
  );
}

// Build readable days-available string from slots operating hours
function buildDaysAvailable(slots) {
  if (!slots?.operatingHours) return null;
  return Object.entries(slots.operatingHours)
    .filter(([, v]) => v.enabled)
    .map(([day]) => DAY_LABELS[day])
    .join('-');
}

// Get the earliest start and latest end across all enabled days
function buildSlotsRange(slots) {
  if (!slots?.operatingHours) return null;
  const allIntervals = Object.values(slots.operatingHours)
    .filter((v) => v.enabled)
    .flatMap((v) => v.intervals);
  if (!allIntervals.length) return null;
  const starts = allIntervals.map((iv) => iv.start).sort();
  const ends = allIntervals.map((iv) => iv.end).sort();
  return `${starts[0]} - ${ends[ends.length - 1]}`;
}

// ----------------------------------------------------------------------

export function ServiceViewDialog({ open, onClose, service, onEdit }) {
  if (!service) return null;

  const isOnline = service.type === 'online';
  const isOnsite = service.type === 'onsite';
  const displayPrice = isOnline ? service.pricePerSession : service.price;

  const daysAvailable = buildDaysAvailable(service.slots);
  const slotsRange = buildSlotsRange(service.slots);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">View Service</Typography>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        {/* Cover Photos */}
        {service.photos && service.photos.length > 0 && (
          <Box
            sx={{
              mb: 2.5,
              borderRadius: 1.5,
              overflow: 'hidden',
              height: 200,
              bgcolor: 'background.neutral',
            }}
          >
            <Box
              component="img"
              src={typeof service.photos[0] === 'string' ? service.photos[0] : URL.createObjectURL(service.photos[0])}
              alt={service.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* Service Name */}
        <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 2.5 }}>
          {service.name}
        </Typography>

        {/* Core details */}
        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          <DetailRow
            label="Service Type"
            value={
              <Label variant="soft" color={isOnline ? 'success' : 'info'} sx={{ textTransform: 'capitalize' }}>
                {isOnline ? 'Online' : 'Onsite'}
              </Label>
            }
          />

          {isOnline && (
            <>
              <DetailRow label="Tenure (In Weeks)" value={service.tenureWeeks} />
              <DetailRow label="Max Days (Per Week)" value={service.maxDaysPerWeek} />
            </>
          )}

          {daysAvailable && <DetailRow label="Days Available" value={daysAvailable} />}
          {slotsRange && <DetailRow label="Slots between" value={slotsRange} />}

          {isOnsite && (
            <>
              <DetailRow label="Venue Title" value={service.venueTitle} />
              <DetailRow label="Venue Location" value={service.venueLocation} />
            </>
          )}

          <DetailRow
            label="Price"
            value={
              <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
                {displayPrice != null ? fCurrency(displayPrice) : '—'}
              </Typography>
            }
          />
        </Stack>

        {/* What's Included */}
        {/* {whatsIncluded.length > 0 && (
          <>
            <SectionDivider />
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                What&apos;s Included
              </Typography>
              <Stack spacing={0.5} sx={{ pl: 1 }}>
                {whatsIncluded.map((item) => (
                  <Stack key={item} direction="row" alignItems="center" spacing={0.75}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.secondary',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{WHATS_INCLUDED_LABELS[item] ?? item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </>
        )} */}

        {/* Clients + Slots info */}
        <SectionDivider title="Enrollment" />
        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          <DetailRow label="Clients Enrolled" value={service.clientCount ?? 0} />
          <DetailRow label="Concurrent Clients" value={service.concurrentClients} />
        </Stack>

        {/* Booking / Cancellation rules */}
        <SectionDivider title="Cancellation Policy" />
        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          <DetailRow label="Policy" value={getCancellationPolicy(service.cancellationPolicy).label} />
        </Stack>

        {/* Operating hours detail (slots) */}
        {service.slots?.operatingHours && (
          <>
            <SectionDivider title="Operating Hours" />
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {Object.entries(service.slots.operatingHours)
                .filter(([, v]) => v.enabled)
                .map(([day, v]) => (
                  <Stack key={day} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', color: 'text.secondary', flex: '0 0 80px' }}>
                      {day}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                      {v.intervals.map((iv, i) => (
                        <Chip key={i} label={`${iv.start} – ${iv.end}`} size="small" variant="soft" sx={{ fontSize: 11 }} />
                      ))}
                    </Stack>
                  </Stack>
                ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              onEdit(service);
            }}
          >
            Edit Service
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
