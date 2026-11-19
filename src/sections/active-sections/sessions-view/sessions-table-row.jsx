import PropTypes from 'prop-types';
import { memo } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { fDate, formatStr } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { formatPaymentStatusLabel, getPaymentStatusColor } from './utils/booking-normalizer';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  requested: 'warning',
  scheduled: 'info',
  ongoing: 'primary',
  completed: 'success',
  expired: 'default',
  canceled: 'error',
};

import { getInstantStatusMeta } from 'src/utils/instant-booking-status';

export const SessionTableRow = memo(
  ({ row, serialNumber, onViewRow, onAcceptRow, onRejectRow, readOnly = false, showClientColumn = true, showProviderColumn = true }) => {
    const { t } = useTranslate();
    const isSubscription = row.serviceType === 'subscription' || !!row.daysCombination;

    // Normalise day/slot across one-time and subscription shapes
    const displayDay = row.day || row.upcomingDay || row.currentDay || null;
    const displaySlot = row.slot || row.upcomingSlots || row.currentSlots || null;

    const actions = [
      {
        key: 'view',
        icon: 'solar:eye-bold',
        tooltip: t('view'),
        onClick: onViewRow,
      },
    ];

    return (
      <TableRow hover tabIndex={-1}>
        {/* Sr# */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

        {showClientColumn && (
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar src={row.client?.profileIcon} sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                {row.client?.initials}
              </Avatar>
              <Typography variant="body2" fontWeight={600} noWrap>
                {row.client?.name || t('notAvailable')}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {showProviderColumn && (
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar src={row.business?.image} variant="rounded" sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'grey.200' }}>
                <Iconify icon="solar:shop-bold" width={16} />
              </Avatar>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {row.providerName ?? t('notAvailable')}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {/* Service Name */}
        <TableCell>
          <Typography variant="body2" noWrap>
            {row.serviceName}
          </Typography>
        </TableCell>

        {/* Price */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
            {row.price != null ? fCurrency(row.price) : t('notAvailable')}
          </Typography>
        </TableCell>

        {/* Requested At */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.requestedAt ? fDate(row.requestedAt, formatStr.date) : t('notAvailable')}
          </Typography>
        </TableCell>

        {/* Day / Slot */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:calendar-bold" width={16} sx={{ color: 'primary.main' }} />
            </Box>
            <Stack spacing={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {isSubscription && row.daysCombination ? row.daysCombination.join(' + ') : displayDay || t('notAvailable')}
              </Typography>
              {displaySlot && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                  {displaySlot}
                </Typography>
              )}
            </Stack>
          </Stack>
        </TableCell>

        {/* Status */}
        <TableCell>
          {row.mode === 'instant' ? (
            <Label variant="soft" color={getInstantStatusMeta(row.status).color} sx={{ whiteSpace: 'nowrap' }}>
              {getInstantStatusMeta(row.status).label}
            </Label>
          ) : (
            <Label variant="soft" color={STATUS_COLOR[row.status] ?? 'default'} sx={{ textTransform: 'capitalize' }}>
              {row.status === 'ongoing' ? getInstantStatusMeta('ongoing').label : t(row.status)}
            </Label>
          )}
        </TableCell>

        {/* Payment Status */}
        <TableCell>
          <Label variant="soft" color={getPaymentStatusColor(row.paymentStatus)} sx={{ textTransform: 'none' }}>
            {row.paymentStatus ? t(row.paymentStatus, { defaultValue: formatPaymentStatusLabel(row.paymentStatus) }) : t('notAvailable')}
          </Label>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GenericTableRowActions actions={actions} />
          </Box>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.row === next.row &&
    prev.serialNumber === next.serialNumber &&
    prev.readOnly === next.readOnly &&
    prev.showClientColumn === next.showClientColumn &&
    prev.showProviderColumn === next.showProviderColumn
);

SessionTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onViewRow: PropTypes.func.isRequired,
  onAcceptRow: PropTypes.func.isRequired,
  onRejectRow: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  showClientColumn: PropTypes.bool,
  showProviderColumn: PropTypes.bool,
};
