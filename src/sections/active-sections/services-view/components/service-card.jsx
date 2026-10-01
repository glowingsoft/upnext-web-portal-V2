import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import ProviderImage from 'src/assets/images/trainer.jpg';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

export default function ServiceCard({ svc, onView, onBook, hideBook }) {
  const { t } = useTranslate();
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: 2.25,
        borderRadius: 2,
        border: (theme)=>`1px solid ${theme.palette.primary.light}`,
        // borderColor: (theme) => (hovered ? varAlpha(theme.vars.palette.primary.mainChannel, 0.35) : theme.vars.palette.divider),
        bgcolor: 'background.paper',
        boxShadow: hovered ? (theme) => `0 10px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}` : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2.5,
      }}
    >
      <Box
        component="img"
        src={svc.image || ProviderImage}
        alt={svc.name}
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

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {svc.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }} noWrap>
          {svc.description?.length > 20 ? `${svc.description.slice(0, 20)}...` : svc.description}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
          <Iconify icon="solar:star-bold" width={14} sx={{ color: 'warning.main' }} />
          <Typography variant="caption" fontWeight={700}>
            {svc.rating ?? '–'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ({svc.reviewCount ?? 0} {t('reviews')})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('kmAway', { distance: svc.distance ?? '–' })}
          </Typography>
        </Stack>
      </Box>

      <Stack alignItems="flex-end" spacing={0.75} sx={{ flexShrink: 0 }}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
            ${svc.price}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            / {svc.duration || t('duration60Mins')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="text"
            size="small"
            onClick={onView}
            endIcon={<Iconify icon="solar:arrow-right-up-linear" width={16} />}
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

          {!hideBook && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:calendar-add-bold" width={16} />}
              onClick={onBook}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 999,
                px: 1.75,
                boxShadow: 'none',
                transition: 'all 0.18s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => `0 10px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.25)}`,
                },
                '&:active': { transform: 'translateY(0px)' },
              }}
            >
              {t('book')}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
