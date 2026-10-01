import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslate } from 'src/locales/use-locales';

const FALLBACK_IMAGE = '/assets/images/about/hero.webp';

const VIEW_ALL_BUTTON_SX = {
  px: 1.25,
  height: 34,
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 700,
  color: '#a58b67',
  borderColor: 'rgba(165, 139, 103, 0.35)',
  bgcolor: 'background.paper',
  '&:hover': {
    borderColor: 'rgba(165, 139, 103, 0.55)',
    bgcolor: 'rgba(165, 139, 103, 0.06)',
  },
};

// ----------------------------------------------------------------------

export function AppSuggestedEvents({ title, events = [], onViewAll, onEventClick, sx, ...other }) {
  const { t } = useTranslate();
  const list = Array.isArray(events) ? events : [];

  return (
    <Card {...other} sx={[{ height: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: 1 }, ...(sx ? [sx] : [])]}>
      <CardHeader
        title={title || t('suggestedEvents')}
        titleTypographyProps={{ variant: 'h6' }}
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          alignItems: 'flex-start',
          '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' },
        }}
        action={
          onViewAll ? (
            <Button size="small" variant="outlined" onClick={onViewAll} endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />} sx={VIEW_ALL_BUTTON_SX}>
              {t('viewAll')}
            </Button>
          ) : null
        }
      />

      <Scrollbar
        sx={{ flex: 1, minHeight: 0 }}
        slotProps={{
          content: { paddingBottom: '16px' },
        }}
      >
        <Stack spacing={2} sx={{ px: 3, pb: 3, pt: 0.5 }}>
          {list.length === 0 ? (
            <Box
              sx={{
                py: 6,
                px: 2,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Iconify icon="solar:calendar-minimalistic-bold" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('noUpcomingEvents')}
              </Typography>
            </Box>
          ) : (
            list.map((event) => <EventCard key={event.id} event={event} onClick={() => onEventClick?.(event.id)} />)
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

AppSuggestedEvents.propTypes = {
  title: PropTypes.string,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      image: PropTypes.string,
      price: PropTypes.string,
      categories: PropTypes.string,
    })
  ),
  onViewAll: PropTypes.func,
  onEventClick: PropTypes.func,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

function EventCard({ event, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 1,
        height: { xs: 148, sm: 168 },
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 8px 24px rgba(145, 158, 171, 0.16)',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: (theme) => theme.transitions.create(['box-shadow', 'transform'], { duration: 140 }),
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 28px rgba(145, 158, 171, 0.24)',
          },
        }),
      }}
    >
      <Box
        component="img"
        src={event.image}
        alt=""
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.98) 100%)',
        }}
      />

      <Stack
        spacing={0.5}
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          maxWidth: '100%',
          p: 1.5,
          pt: 2,
          zIndex: 1,
          alignItems: 'flex-start',
          textAlign: 'left',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, width: 1 }}>
          {event.title}
        </Typography>
        {event.subtitle && (
          <Typography variant="body2" noWrap sx={{ width: 1, color: 'text.secondary', fontWeight: 500 }}>
            {event.subtitle}
          </Typography>
        )}
        {event.price && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {event.price}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
