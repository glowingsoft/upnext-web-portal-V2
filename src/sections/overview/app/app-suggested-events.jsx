import PropTypes from 'prop-types';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function AppSuggestedEvents({ title, events = [], onViewAll, onEventClick, sx, ...other }) {
  const { t } = useTranslate();
  const list = Array.isArray(events) ? events : [];

  return (
    <Card {...other} sx={[{ height: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: 1 }, ...(sx ? [sx] : [])]}>
      <CardHeader
        title={title || t('suggestedEvents')}
        titleTypographyProps={{ variant: 'h6' }}
        sx={{ px: 3, pt: 3, pb: 1, alignItems: 'flex-start', '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' } }}
        action={
          onViewAll ? (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={onViewAll}
              endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
              sx={{ px: 1.25, height: 34, borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
            >
              {t('viewAll')}
            </Button>
          ) : null
        }
      />

      <Stack spacing={1.2} sx={{ px: 3, pb: 3, pt: 1.5, flex: 1 }}>
        {list.length === 0 ? (
          <Box sx={{ py: 6, px: 2, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Iconify icon="solar:calendar-minimalistic-bold" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('noUpcomingEvents')}
            </Typography>
          </Box>
        ) : (
          list.map((event) => <EventRow key={event.id} event={event} onClick={() => onEventClick?.(event.id)} />)
        )}
      </Stack>
    </Card>
  );
}

AppSuggestedEvents.propTypes = {
  title: PropTypes.string,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      dateLabel: PropTypes.string,
      venueLabel: PropTypes.string,
      image: PropTypes.string,
      categories: PropTypes.string,
    })
  ),
  onViewAll: PropTypes.func,
  onEventClick: PropTypes.func,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

// ----------------------------------------------------------------------

function EventRow({ event, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(event.image) && !imageFailed;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          onClick?.();
        }
      }}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color'], { duration: 180 }),
        '&:hover': { borderColor: 'primary.main', bgcolor: 'background.neutral' },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          flexShrink: 0,
          overflow: 'hidden',
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.dark',
          fontWeight: 800,
          fontSize: 22,
        }}
      >
        {showImage ? (
          <Box
            component="img"
            src={event.image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          String(event.title || '?').trim().charAt(0).toUpperCase()
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {event.title}
        </Typography>

        {event.dateLabel && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.4 }}>
            <Iconify icon="solar:calendar-mark-bold" width={13} sx={{ color: 'primary.main', flexShrink: 0 }} />
            <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
              {event.dateLabel}
            </Typography>
          </Stack>
        )}

        {event.venueLabel && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.15 }}>
            <Iconify icon="solar:map-point-bold" width={13} sx={{ color: 'text.disabled', flexShrink: 0 }} />
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
              {event.venueLabel}
            </Typography>
          </Stack>
        )}

        {event.categories && (
          <Label variant="soft" color="primary" sx={{ mt: 0.6 }}>
            {event.categories}
          </Label>
        )}
      </Box>
    </Stack>
  );
}

EventRow.propTypes = {
  event: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
