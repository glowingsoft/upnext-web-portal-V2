import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

const STATUS_COLOR_MAP = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'info',
  released: 'primary',
  partially_captured: 'warning',
  expired: 'default',
};

const ACCENT = '#a68e6b';

export const BillingHistoryTableRow = memo(
  ({ row, serialNumber, onViewRow }) => {
    const { t } = useTranslate();

    return (
    <TableRow hover tabIndex={-1} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.disabled', fontWeight: 600 }}>{serialNumber}</TableCell>

      <TableCell>
        <Stack spacing={1.5} direction="row" alignItems="center">
          <Avatar
            alt={row.customerName}
            src={row.customerAvatar}
            sx={{
              width: 40,
              height: 40,
              border: (theme) => `2px solid ${theme.palette.background.paper}`,
              boxShadow: `0 0 0 1px ${ACCENT}33`,
              bgcolor: ACCENT,
              color: 'common.white',
            }}
          >
            {row.customerInitial}
          </Avatar>

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start', minWidth: 0 }}>
            <Box component="span" sx={{ fontWeight: 600, display: 'block', width: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.customerName || '—'}
            </Box>

            <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.78rem', display: 'block', width: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.customerEmail}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            alt={row.serviceName}
            src={row.serviceImage}
            variant="rounded"
            sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: 'background.neutral' }}
          >
            <Iconify icon="solar:widget-2-bold-duotone" width={18} sx={{ color: 'text.disabled' }} />
          </Avatar>

          <Stack sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }} noWrap>
              {row.serviceName || '—'}
            </Typography>
            {row.preferredServiceType && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                {row.preferredServiceType}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{row.billingDate ? fDate(row.billingDate) : '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:card-bold-duotone" width={16} sx={{ color: ACCENT }} />
          <Typography variant="body2">{row.paymentMethod || '—'}</Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.transactionId ? (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.375,
              borderRadius: 1,
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: 'text.secondary',
              bgcolor: 'background.neutral',
            }}
          >
            {row.transactionId}
          </Box>
        ) : (
          '—'
        )}
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: ACCENT }}>
        {fCurrency(row.amount)}
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR_MAP[row.status] || 'default'} sx={{ textTransform: 'capitalize' }}>
          {row.status ? t(row.status) : '—'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Tooltip title={t('viewDetails')}>
          <IconButton onClick={() => onViewRow(row)} sx={{ color: 'text.secondary', '&:hover': { color: ACCENT, bgcolor: `${ACCENT}14` } }}>
            <Iconify icon="solar:eye-bold" width={20} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.row._id === nextProps.row._id &&
      prevProps.row.serviceName === nextProps.row.serviceName &&
      prevProps.row.serviceImage === nextProps.row.serviceImage &&
      prevProps.row.customerName === nextProps.row.customerName &&
      prevProps.row.amount === nextProps.row.amount &&
      prevProps.row.status === nextProps.row.status &&
      prevProps.row.billingDate === nextProps.row.billingDate &&
      prevProps.row.paymentMethod === nextProps.row.paymentMethod &&
      prevProps.row.transactionId === nextProps.row.transactionId &&
      prevProps.serialNumber === nextProps.serialNumber
    );
  }
);

BillingHistoryTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onViewRow: PropTypes.func.isRequired,
};

BillingHistoryTableRow.displayName = 'BillingHistoryTableRow';
