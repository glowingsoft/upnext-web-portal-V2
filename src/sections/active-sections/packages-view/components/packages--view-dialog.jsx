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
import { varAlpha } from 'src/theme/styles';

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

export function PackageViewDialog({ open, onClose, service, onEdit }) {
  if (!service) return null;

  const isOnline = service.type === 'online';

  const daysAvailable = buildDaysAvailable(service.slots);
  const slotsRange = buildSlotsRange(service.slots);

  const savings = (service.actualPrice || 0) - (service.packagePrice || 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">View Package</Typography>

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        {/* Cover */}
        {service.coverImage && (
          <Box
            sx={{
              mb: 2.5,
              height: 220,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={service.coverImage}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 2 }}>
          {service.name}
        </Typography>

        {service.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2.5,
              textAlign: 'center',
            }}
          >
            {service.description}
          </Typography>
        )}

        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          <DetailRow
            label="Package Type"
            value={
              <Label variant="soft" color={isOnline ? 'success' : 'info'} sx={{ textTransform: 'capitalize' }}>
                {service.type}
              </Label>
            }
          />

          <DetailRow label="Included Services" value={`${service.services?.length || 0} Services`} />

          <DetailRow label="Actual Price" value={<Typography fontWeight={600}>{fCurrency(service.actualPrice)}</Typography>} />

          <DetailRow
            label="Package Price"
            value={
              <Typography fontWeight={700} sx={{ color: 'primary.main' }}>
                {fCurrency(service.packagePrice)}
              </Typography>
            }
          />

          <DetailRow
            label="You Save"
            value={
              <Typography fontWeight={700} sx={{ color: 'success.main' }}>
                {fCurrency(savings)}
              </Typography>
            }
          />

          {daysAvailable && <DetailRow label="Days Available" value={daysAvailable} />}

          {slotsRange && <DetailRow label="Slots Between" value={slotsRange} />}
        </Stack>

        {/* Included Services */}
        {service.services?.length > 0 && (
          <>
            <SectionDivider title="Included Services" />

            <Stack spacing={1.25}>
              {service.services.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    p: 2.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2.5,
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.28),
                      boxShadow: (theme) => `0 10px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={item.image || '/assets/images/about/what-small.webp'}
                    alt={item.name}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      objectFit: 'cover',
                      flexShrink: 0,
                      bgcolor: 'background.neutral',
                      border: '1px solid',
                      borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                    }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = '/assets/images/about/what-small.webp';
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }} noWrap>
                      {item.name}
                    </Typography>
                    {item.description ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }} noWrap>
                        {item.description}
                      </Typography>
                    ) : null}

                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
                      <Iconify icon="solar:star-bold" width={14} sx={{ color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={700}>
                        {item.rating ?? '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ({item.reviewCount ?? 0} reviews)
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack alignItems="flex-end" spacing={0.75} sx={{ flexShrink: 0 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
                        {fCurrency(item.price || 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        / {item.durationMins ?? 60} mins
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* Enrollment */}
        <SectionDivider title="Enrollment" />

        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          <DetailRow label="Clients Enrolled" value={service.clientCount || 0} />
        </Stack>

        {/* Booking Rules */}
        {(service.latestBookHours != null || service.latestCancelHours != null) && (
          <>
            <SectionDivider title="Booking Rules" />

            <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {service.latestBookHours != null && <DetailRow label="Latest Booking" value={`${service.latestBookHours}h ${service.latestBookMins || 0}m before`} />}

              {service.latestCancelHours != null && <DetailRow label="Latest Cancellation" value={`${service.latestCancelHours}h ${service.latestCancelMins || 0}m before`} />}

              {service.refundPercentage != null && <DetailRow label="Refund" value={`${service.refundPercentage}%`} />}

              {service.refundRules && <DetailRow label="Refund Rules" value={service.refundRules} />}
            </Stack>
          </>
        )}

        {/* Slots */}
        {service.slots?.operatingHours && (
          <>
            <SectionDivider title="Operating Hours" />

            <Stack spacing={1}>
              {Object.entries(service.slots.operatingHours)
                .filter(([, v]) => v.enabled)
                .map(([day, v]) => (
                  <Stack key={day} direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {day}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      {v.intervals.map((iv, i) => (
                        <Chip key={i} label={`${iv.start} - ${iv.end}`} size="small" />
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
            Edit Package
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
