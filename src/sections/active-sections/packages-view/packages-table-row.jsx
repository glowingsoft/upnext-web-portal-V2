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

import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

const isUsableImage = (url) => Boolean(url && !String(url).toLowerCase().includes('noimg'));

function getRowImage(row) {
  if (isUsableImage(row.image)) return row.image;
  if (isUsableImage(row.coverImage)) return row.coverImage;
  return (row.photos || []).find(isUsableImage) || (row.packageMedia || []).find(isUsableImage);
}

export const PackagesTableRow = memo(
  ({ row, serialNumber, onViewRow, onEditRow, onDeleteRow }) => {
    const { t } = useTranslate();
    const savings = (row.actualPrice || 0) - (row.packagePrice || 0);
    const servicesCount = row.services?.length || 0;
    const imageUrl = getRowImage(row);

    const actions = [
      {
        key: 'view',
        icon: 'solar:eye-bold',
        tooltip: t('view'),
        onClick: onViewRow,
      },
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
    ];

    return (
      <TableRow hover tabIndex={-1}>
        {/* Sr */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

        {/* Package Name + Description */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              alt={row.name}
              src={imageUrl}
              variant="rounded"
              sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
            >
              {getInitial(row.name)}
            </Avatar>
            <Stack spacing={0.4} sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {row.name}
              </Typography>

              {row.description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    maxWidth: 280,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.description}
                </Typography>
              )}
            </Stack>
          </Stack>
        </TableCell>

        {/* Included Services */}
        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify
              icon="solar:layers-bold"
              width={15}
              sx={{
                color: 'text.disabled',
              }}
            />

            <Typography variant="body2">{servicesCount}</Typography>
          </Stack>
        </TableCell>

        {/* Actual Price */}
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {fCurrency(row.actualPrice || 0)}
          </Typography>
        </TableCell>

        {/* Package Price */}
        <TableCell>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: 'primary.main',
            }}
          >
            {fCurrency(row.packagePrice || 0)}
          </Typography>
        </TableCell>

        {/* Savings */}
        <TableCell>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              color: 'success.main',
            }}
          >
            {fCurrency(savings)}
          </Typography>
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

        {/* Created */}
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            {row.createdAt ? fDate(row.createdAt) : '—'}
          </Typography>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GenericTableRowActions actions={actions} />
          </Box>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.row._id === next.row._id &&
    prev.row.name === next.row.name &&
    prev.row.actualPrice === next.row.actualPrice &&
    prev.row.packagePrice === next.row.packagePrice &&
    prev.row.isAvailable === next.row.isAvailable &&
    prev.row.status === next.row.status &&
    prev.row.services === next.row.services &&
    prev.serialNumber === next.serialNumber
);

// ----------------------------------------------------------------------

PackagesTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onViewRow: PropTypes.func.isRequired,
  onEditRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
};

PackagesTableRow.displayName = 'PackagesTableRow';
