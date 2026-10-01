import PropTypes from 'prop-types';
import { memo } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import EllipsisCellWithTooltip from 'src/components/table/ellipsis-cell-with-tooltip';
import { useTranslate } from 'src/locales/use-locales';
import { fDate, formatStr } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export const ReviewTableRow = memo(
  ({ row, serialNumber, onViewBooking, onApprove, onReject, onDelete }) => {
    const { t } = useTranslate();
    const isPending = row.status === 'pending';

    const actions = [
      {
        key: 'approve',
        icon: 'solar:check-circle-bold',
        tooltip: t('approve'),
        color: 'success',
        onClick: onApprove,
        hidden: !isPending,
      },
      {
        key: 'reject',
        icon: 'solar:close-circle-bold',
        tooltip: t('reject'),
        color: 'error',
        onClick: onReject,
        hidden: !isPending,
      },
      {
        key: 'view',
        icon: 'solar:eye-bold',
        tooltip: t('viewBooking'),
        onClick: onViewBooking,
        hidden: !row.booking?._id,
      },
      {
        key: 'delete',
        icon: 'solar:trash-bin-trash-bold',
        tooltip: t('deleteAction'),
        color: 'error',
        onClick: onDelete,
      },
    ];

    return (
      <TableRow hover tabIndex={-1}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar src={row.reviewerAvatar} sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
              {row.customerInitial}
            </Avatar>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.reviewer || t('notAvailable')}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {row.businessName || t('notAvailable')}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {row.objectName || t('notAvailable')}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Rating value={Number(row.rating || 0)} precision={0.5} readOnly size="small" />
        </TableCell>

        <EllipsisCellWithTooltip maxWidth="220px">{row.comment || t('notAvailable')}</EllipsisCellWithTooltip>

        <TableCell>
          <Label variant="soft" color={STATUS_COLOR[row.status] ?? 'default'} sx={{ textTransform: 'capitalize' }}>
            {t(row.status)}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.createdAt ? fDate(row.createdAt, formatStr.date) : t('notAvailable')}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GenericTableRowActions actions={actions} />
          </Box>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.row === next.row && prev.serialNumber === next.serialNumber
);

ReviewTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onViewBooking: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

ReviewTableRow.displayName = 'ReviewTableRow';
