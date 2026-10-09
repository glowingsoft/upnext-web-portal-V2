import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';

const MAX_CUSTOMERS = 5;

// ----------------------------------------------------------------------

export function TopCustomers({ title, subheader, customers, onViewAll, onRowClick, sx, ...other }) {
  const { t } = useTranslate();
  const list = (customers || []).slice(0, MAX_CUSTOMERS);

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
            color="primary"
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{ px: 1.25, height: 34, flexShrink: 0, borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
          >
            {t('viewAll')}
          </Button>
        )}
      </Stack>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noCustomersYet', { defaultValue: 'No customers yet.' })}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.2}>
          {list.map((customer, index) => (
            <Stack
              key={customer._id}
              direction="row"
              alignItems="center"
              spacing={1.5}
              onClick={onRowClick ? () => onRowClick(customer._id) : undefined}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: (theme) => theme.transitions.create(['border-color', 'background-color'], { duration: 180 }),
                ...(onRowClick && { '&:hover': { borderColor: 'primary.main', bgcolor: 'background.neutral' } }),
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: index === 0 ? 'primary.contrastText' : 'text.secondary',
                  bgcolor: index === 0 ? 'primary.main' : 'background.neutral',
                }}
              >
                {index + 1}
              </Box>

              <Avatar
                alt={customer.name}
                src={customer.avatar}
                sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
              >
                {customer?.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {customer.name}
                </Typography>
                <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary' }}>
                  {customer.email || '-'}
                </Typography>
                <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 0.5, columnGap: 1, rowGap: 0.25 }}>
                  <Label variant="soft" color="primary">
                    {t('bookingsCount', { count: customer.totalBookings ?? 0 })}
                  </Label>
                  {customer.totalSpent > 0 && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {fCurrency(customer.totalSpent)}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
