
import { Box, Button, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

const getServiceImage = (svc) => {
  const photo = (svc.photos || []).find((p) => p && !p.includes('noimg'));
  return photo || null;
};

export default function ServiceCard({ svc, onView, onBook, hideBook, hideDistance }) {

  const { t } = useTranslate();
  const imageUrl = getServiceImage(svc);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const isUnavailable = svc.isAvailable === false;

  return (
    <Box

      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.primary.light}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: "column",
      }}
      component={Card}
    >
      {isUnavailable ? (
        <Chip
          size="small"
          variant="soft"
          color="error"
          icon={<Iconify icon="solar:close-circle-bold" width={14} />}
          label={t('unavailable')}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            height: 20,
            fontSize: 10,
            fontWeight: 700,
          }}
        />
      ) : (
        svc.kind && (
          <Chip
            size="small"
            label={svc.kind === 'package' ? t('package') : t('service')}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'capitalize',
              bgcolor: '#e3f2fd',
              color: '#1565c0',
            }}
          />
        )
      )}

      <Box
        sx={{
          p: 2.25,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'start',
          gap: 2.5,
          ...(isUnavailable && { opacity: 0.6, filter: 'grayscale(0.4)' }),
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {imageUrl && !imageLoadFailed ? (
          <Box
            component="img"
            src={imageUrl}
            alt={svc.name}
            onError={() => setImageLoadFailed(true)}
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
          />
        ) : (
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              flexShrink: 0,
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
              border: '1px solid',
              borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:gallery-bold" width={28} sx={{ color: 'text.disabled' }} />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              pr: (svc.kind || isUnavailable) ? 6 : 0,
            }}
          >
            {svc.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {svc.description}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ width: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Box >
          <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
            ${svc.price}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            / {svc.duration || t('duration60Mins')}
          </Typography>
        </Box>

        <Button
          variant="text"
          size="small"
          onClick={onView}
          endIcon={<Iconify icon="eva:external-link-fill" width={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            color: 'primary.main',
            px: 0.75,
            minWidth: 'auto',
            borderRadius: 1.5,
            '& .MuiButton-endIcon': { ml: 0.5, transition: 'transform 0.18s ease' },
            '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) },
            '&:hover .MuiButton-endIcon': { transform: 'translateX(2px) translateY(-2px)' },
          }}
        >
          {t('details')}
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>

        <Box sx={{ flex: 1, minWidth: 0 }}>

          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>

            <Iconify icon="solar:star-bold" width={14} sx={{ color: 'warning.main' }} />

            <Typography variant="caption" fontWeight={700}>
              {svc.rating ?? '–'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({svc.reviewCount ?? 0} {t('reviews')})
            </Typography>
          </Stack>

        </Box>

        {!hideDistance && svc.distance != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Iconify icon="mingcute:location-fill" width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('kmAway', { distance: svc.distance })}
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
}
