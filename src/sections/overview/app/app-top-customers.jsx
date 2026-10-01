import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function TopCustomers({ title, subheader, customers, onViewAll, onRowClick, sx, ...other }) {
  const { t } = useTranslate();

  return (
    <Card {...other} sx={[{ p: 3, display: 'flex', flexDirection: 'column', minHeight: 0, width: 1 }, ...(sx ? [sx] : [])]}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          {subheader && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subheader}
            </Typography>
          )}
        </Box>

        {onViewAll && (
          <Button
            size="small"
            variant="outlined"
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{
              px: { xs: 1, sm: 1.25 },
              height: 34,
              minWidth: { xs: 64, sm: 84 },
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              color: '#a58b67',
              borderColor: 'rgba(165, 139, 103, 0.35)',
              bgcolor: 'background.paper',
              '& .MuiButton-endIcon': { display: { xs: 'none', sm: 'inherit' } },
              '&:hover': {
                borderColor: 'rgba(165, 139, 103, 0.55)',
                bgcolor: 'rgba(165, 139, 103, 0.06)',
              },
            }}
          >
            {t('viewAll')}
          </Button>
        )}
      </Stack>

      {!customers?.length ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noCustomersYet', { defaultValue: 'No customers yet.' })}
          </Typography>
        </Box>
      ) : (
      <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {customers.map((c, idx) => (
          <Stack
            key={c._id}
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 1.5 }}
            onClick={onRowClick ? () => onRowClick(c._id) : undefined}
            sx={{
              px: { xs: 0.75, sm: 1 },
              py: 1,
              borderRadius: 1.5,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: (t) => t.transitions.create(['background-color', 'transform'], { duration: 120 }),
              ...(onRowClick && {
                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
                '&:hover .booking-chip': {
                  bgcolor: 'rgba(165, 139, 103, 0.16)',
                  borderColor: 'rgba(165, 139, 103, 0.32)',
                },
              }),
            }}
          >
            <Typography variant="caption" sx={{ width: { xs: 18, sm: 22 }, flexShrink: 0, textAlign: 'center', color: 'text.disabled' }}>
              {idx + 1}
            </Typography>

            <Avatar
              alt={c.name}
              src={c.avatar}
              sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
            >
              {c?.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>

            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 0.75, sm: 1 }} sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ minWidth: 0, flex: 1, width: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {c.name}
                </Typography>

                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }} noWrap>
                  {c.email || '-'}
                </Typography>
              </Box>

              <Chip
                size="small"
                label={t('bookingsCount', { count: c.totalBookings ?? 0 })}
                variant="outlined"
                sx={{
                  maxWidth: { xs: 112, sm: 128 },
                  flexShrink: 0,
                  bgcolor: '#fff2d0',
                  color: '#7a5a2b',
                  borderColor: 'rgba(122, 90, 43, 0.25)',
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </Stack>
      )}
    </Card>
  );
}
