import { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { brand } from './theme';
import { getInitial, previewArrowSx, previewBadgeSx, previewCardSx, previewFooterSx, previewLinkSx } from './previewCardStyles';

// ----------------------------------------------------------------------

function formatCardDate(event) {
  const isPlainDate = typeof event?.date === 'string';
  const localDate = isPlainDate ? event.date : event?.date?.localDate;
  const localTime = isPlainDate ? event.time : event?.date?.localTime;

  if (!localDate) return '';

  const date = new Date(`${localDate}T${localTime || '00:00:00'}`);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!localTime) return datePart;

  return `${datePart} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export default function EventPreviewCard({ event, onSelect }) {
  const { t } = useTranslate();

  const title = event?.title || event?.name;
  const segment = event?.categories?.segment || event?.segment;
  const genre = event?.categories?.genre || event?.categories?.subGenre || event?.genre;
  const venueName = event?.venue?.name || (typeof event?.venue === 'string' ? event.venue : '');
  const location = [event?.venue?.city || event?.city, event?.venue?.stateCode || event?.venue?.state || event?.state].filter(Boolean).join(', ');
  const venueLabel = [venueName, location].filter(Boolean).join(', ');
  const dateLabel = formatCardDate(event);

  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(event?.image) && !imageFailed;

  return (
    <Box
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          onSelect?.();
        }
      }}
      sx={previewCardSx}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          aspectRatio: '16 / 10',
          bgcolor: brand.green[100],
          ...(!showImage && { display: 'flex', alignItems: 'center', justifyContent: 'center' }),
        }}
      >
        {showImage ? (
          <Box
            component="img"
            className="preview-card-image"
            loading="lazy"
            decoding="async"
            src={event.image}
            alt={title}
            onError={() => setImageFailed(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          />
        ) : (
          <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '3.5rem', sm: '3.5rem', md: '3.5rem', lg: '3.5rem' }, color: brand.green[600], opacity: 0.55 }}>
            {getInitial(title)}
          </Typography>
        )}

        {segment && <Box sx={{ ...previewBadgeSx, left: 12 }}>{segment}</Box>}
        {genre && genre !== segment && <Box sx={{ ...previewBadgeSx, right: 12 }}>{genre}</Box>}
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            fontSize: { xs: '1.15rem', sm: '1.15rem', md: '1.15rem', lg: '1.2rem' },
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>

        {dateLabel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Iconify icon="mingcute:calendar-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{dateLabel}</Typography>
          </Box>
        )}

        {venueLabel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Iconify icon="mingcute:location-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {venueLabel}
            </Typography>
          </Box>
        )}

        {event?.distance != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Iconify icon="mingcute:route-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {`${Number(event.distance).toFixed(1)} ${event.units || 'miles'} away`}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 16 }} />

        <Box sx={previewFooterSx}>
          {event?.ticketUrl ? (
            <Box
              component="a"
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(clickEvent) => clickEvent.stopPropagation()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.8rem',
                fontWeight: 700,
                color: brand.green[600],
                textDecoration: 'none',
                '&:hover': { color: brand.green[800], textDecoration: 'underline', textUnderlineOffset: 3 },
              }}
            >
              {t('getTickets')}
              <Iconify icon="mingcute:external-link-line" width={14} />
            </Box>
          ) : (
            <Box />
          )}

          <Box
            component="button"
            type="button"
            aria-label={title}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onSelect?.();
            }}
            sx={previewLinkSx}
          >
            {t('details')}
            <Box className="preview-card-arrow" sx={previewArrowSx}>
              <Iconify icon="mingcute:arrow-right-line" width={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
