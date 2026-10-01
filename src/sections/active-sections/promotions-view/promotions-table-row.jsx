import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { useTranslate } from 'src/locales/use-locales';
import { fDate } from 'src/utils/format-time';

const STATUS_COLOR = { active: 'success', inactive: 'error', expired: 'warning', unavailable: 'error' };
const DISCOUNT_TYPE_COLOR = { percentage: 'info', fixed: 'warning' };

function getPromotionStatus(row) {
  if (row.isAvailable === false) return 'unavailable';
  if (row.status) return row.status;
  if (row.expiresAt && new Date(row.expiresAt) < new Date()) return 'expired';
  return 'active';
}

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

function getRowImage(row) {
  return (row.photos || []).find((photo) => photo && !photo.includes('noimg')) || row.image;
}

export const PromotionsTableRow = memo(({ row, serialNumber, onViewRow, onEditRow, onDeleteRow }) => {
  const { t } = useTranslate();
  const discountValue = row.discount ?? row.discountValue;
  const redemptions = row.redemptionsUsed ?? row.redemptions ?? row.usageCount ?? 0;
  const status = getPromotionStatus(row);
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
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

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
          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Typography fontWeight={600} noWrap>{row.name}</Typography>

            <Typography variant="caption" color="text.secondary">
              {row.promoCode}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={DISCOUNT_TYPE_COLOR[row.discountType] || 'default'} sx={{ textTransform: 'capitalize' }}>
          {row.discountType ? t(row.discountType) : ''}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
          {row.discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}
        </Typography>
      </TableCell>

      <TableCell>{redemptions}</TableCell>

      <TableCell>
        <Label color={STATUS_COLOR[status] || 'warning'} variant="soft">
          {t(status)}
        </Label>
      </TableCell>

      <TableCell>{fDate(row.expiresAt)}</TableCell>

      <TableCell align="center">
        <Box display="flex" justifyContent="center">
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
});

PromotionsTableRow.propTypes = {
  row: PropTypes.object,
};
