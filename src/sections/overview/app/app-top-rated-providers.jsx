import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function TopRatedProviders({ title, subheader, providers, onViewAll, onRowClick, sx, ...other }) {
  const { t } = useTranslate();

  return (
    <Card {...other} sx={[{ display: 'flex', flexDirection: 'column', minHeight: 0, width: 1 }, ...(sx ? [sx] : [])]}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            size="small"
            variant="outlined"
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{
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
            }}
          >
            {t('viewAll')}
          </Button>
        }
      />

      {!providers?.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 6, textAlign: 'center' }}>
          <Iconify icon="solar:buildings-3-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {t('noProvidersToShowYet')}
          </Typography>
        </Box>
      ) : (
      <Stack spacing={1} sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: 'auto', mt: 3 }}>
        {providers?.map((p, idx) => (
          <Stack
            key={p._id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => onRowClick?.(p._id)}
            sx={{
              px: 1,
              py: 1,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: (t) => t.transitions.create(['background-color', 'transform'], { duration: 120 }),
              '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
            }}
          >
            <Typography variant="caption" sx={{ width: 22, textAlign: 'center', color: 'text.disabled' }}>
              {idx + 1}
            </Typography>

            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar alt={p.name} src={p.avatar} sx={{ bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}>
                {p?.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
              {typeof p.isAvailable === 'boolean' && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: -1,
                    bottom: -1,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: p.isAvailable ? 'success.main' : 'text.disabled',
                    border: (t) => `solid 2px ${t.palette.background.paper}`,
                  }}
                />
              )}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {p.name}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                <Rating readOnly size="small" precision={0.1} max={1} value={1} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                  {typeof p.rating === 'number' ? p.rating.toFixed(1) : '-'} - {p.reviewCount ?? 0} {t('reviews')}
                </Typography>
              </Stack>

              {p.distance != null && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                  <Iconify icon="mingcute:location-fill" width={12} sx={{ color: '#a58b67', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {t('kmAway', { distance: p.distance })}
                  </Typography>
                </Stack>
              )}
            </Box>

            <Chip size="small" label={p.category || '-'} variant="outlined" sx={{ bgcolor: '#fff2d0', color: '#7a5a2b', borderColor: 'rgba(122, 90, 43, 0.25)' }} />
          </Stack>
        ))}
      </Stack>
      )}
    </Card>
  );
}
