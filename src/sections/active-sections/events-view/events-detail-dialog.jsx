import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function DetailField({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10, letterSpacing: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-all' }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function EventsDetailDialog({ open, onClose, event }) {
  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Event Details
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {/* Cover image */}
        <Box
          sx={{
            width: '100%',
            height: 200,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {event.image ? (
            <Box component="img" src={event.image} alt={event.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              No Photo
            </Typography>
          )}
        </Box>

        {/* Fields grid */}
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <DetailField label="Title" value={event.title} />
            <DetailField label="Category" value={event.category} />
          </Box>

          <Divider />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <DetailField label="Start Date" value={event.startDate} />
            <DetailField label="End Date" value={event.endDate} />
          </Box>

          <Divider />

          {event.createdAt && (
            <>
              <DetailField label="Created At" value={event.createdAt} />
              <Divider />
            </>
          )}

          <DetailField label="Link" value={event.link} />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
