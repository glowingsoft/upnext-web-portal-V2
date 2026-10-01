import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { useTranslate } from 'src/locales/use-locales';

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

function getRowImage(row) {
  return (row.photos || []).find((photo) => photo && !photo.includes('noimg')) || row.image;
}

export const ServiceTableRow = memo(
  ({ row, serialNumber, onViewRow, onEditRow, onDeleteRow, canManageServices }) => {
    const { t } = useTranslate();
    const displayPrice = row.type === 'subscription' ? row.pricePerSession : row.price;
    const priceLabel = row.type === 'subscription' ? '/session' : '';
    const imageUrl = getRowImage(row);

    const actions = [
      {
        key: 'view',
        icon: 'solar:eye-bold',
        tooltip: t('view'),
        onClick: onViewRow,
      },
      ...(canManageServices
        ? [
            {
              key: 'edit',
              icon: 'solar:pen-bold',
              tooltip: t('edit'),
              onClick: onEditRow,
            },
            {
              key: 'delete',
              icon: 'solar:trash-bin-trash-bold',
              tooltip: t('deleteAction'),
              color: 'error',
              onClick: onDeleteRow,
            },
          ]
        : []),
    ];

    return (
      <TableRow hover tabIndex={-1}>
        {/* Sr# */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

        {/* Service Name + Revenue */}
        <TableCell sx={{ width: 260, maxWidth: 260 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              alt={row.name}
              src={imageUrl}
              variant="rounded"
              sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
            >
              {getInitial(row.name)}
            </Avatar>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }} noWrap>
              {row.name}
            </Typography>
          </Stack>
        </TableCell>

        {/* Price */}
        <TableCell>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
            {displayPrice != null ? `${fCurrency(displayPrice)}${priceLabel}` : '—'}
          </Typography>
        </TableCell>

        {/* Clients */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:users-group-rounded-bold" width={15} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2">{row.clientCount ?? 0}</Typography>
          </Stack>
        </TableCell>

        {/* Availability */}
        <TableCell>
          <Label
            variant="soft"
            color={row.isAvailable === false ? 'error' : 'success'}
          >
            {row.isAvailable === false ? t('unavailable') : t('available')}
          </Label>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Label
            variant="soft"
            color={row.status === 'inactive' ? 'error' : 'success'}
          >
            {row.status === 'inactive' ? t('inactive') : t('active')}
          </Label>
        </TableCell>

        {/* Created At */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.createdAt ? fDate(row.createdAt) : '—'}
          </Typography>
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
    prev.row._id === next.row._id &&
    prev.row.name === next.row.name &&
    prev.row.clientCount === next.row.clientCount &&
    prev.row.isAvailable === next.row.isAvailable &&
    prev.row.status === next.row.status &&
    prev.serialNumber === next.serialNumber &&
    prev.canManageServices === next.canManageServices
);

ServiceTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onViewRow: PropTypes.func.isRequired,
  onEditRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  canManageServices: PropTypes.bool.isRequired,
};

ServiceTableRow.displayName = 'ServiceTableRow';
