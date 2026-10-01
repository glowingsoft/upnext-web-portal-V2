import { Avatar, Box, Chip, IconButton, Link, Stack, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';
import { useUpdateCustomerStatusMutation } from 'src/store/Reducer/customers-api';
import { ClientQuickEditDialog } from './client-quick-edit-dialog';

function normalizeClientStatus(row) {
  const s = (row?.status || 'active').toString().toLowerCase();
  if (s === 'inactive') return 'inactive';
  if (s === 'pending') return 'pending';
  if (s === 'suspended') return 'suspended';
  if (s === 'deleted') return 'deleted';
  return 'active';
}

function getAvatarSrc(url) {
  if (!url || typeof url !== 'string') return undefined;
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  const secondHttpIndex = trimmed.indexOf('http', trimmed.indexOf('http') + 1);
  if (secondHttpIndex > 0) {
    trimmed = trimmed.slice(secondHttpIndex);
  }

  if (/\/$/.test(trimmed) || /noimg/i.test(trimmed)) return undefined;
  return trimmed;
}

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

export const SupportTableRow = memo(
  ({ row, serialNumber }) => {
    const router = useRouter();
    const { t } = useTranslate();
    const { user } = useSelector((state) => state.user);
    const isAdmin = user?.accountState?.userType === 'admin';

    const initialStatus = normalizeClientStatus(row);
    const [statusValue, setStatusValue] = useState(initialStatus);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [updateCustomerStatus] = useUpdateCustomerStatusMutation();
    const isActive = statusValue === 'active';
    const isPending = statusValue === 'pending';
    const isSuspended = statusValue === 'suspended';
    const isDeleted = statusValue === 'deleted';

    const detailsPath = user?.accountState?.userType === 'admin' ? paths?.adminDashboard?.customerDetails(row._id) : paths?.dashboard?.customerDetails(row._id);
    const avatarSrc = getAvatarSrc(row.profileIcon || row.avatar);

    useEffect(() => {
      setStatusValue(normalizeClientStatus(row));
    }, [row._id, row.status]);

    useEffect(() => {
      setAvatarLoadFailed(false);
    }, [avatarSrc]);

    const handleOpenEditDialog = () => setIsEditDialogOpen(true);
    const handleCloseEditDialog = () => setIsEditDialogOpen(false);

    const handleUpdateStatus = async (nextStatus) => {
      await updateCustomerStatus({ userId: row._id, status: nextStatus }).unwrap();
      setStatusValue(nextStatus);
    };

    return (
      <>
        <TableRow hover tabIndex={-1}>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

          <TableCell>
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar
                alt={row.name}
                src={!avatarLoadFailed ? avatarSrc : undefined}
                onError={() => setAvatarLoadFailed(true)}
                sx={{ bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}
              >
                {getInitial(row.name)}
              </Avatar>

              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push(detailsPath)}>
                  {row.name}
                </Link>

                <Box component="span" sx={{ color: 'text.disabled' }}>
                  {row.email}
                </Box>
              </Stack>
            </Stack>
          </TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.phoneNumber || '—'}</TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>{row?.totalBookings ?? 0}</TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.joiningDate ? fDate(row.joiningDate) : t('notAvailable')}</TableCell>

          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Chip
              size="small"
              variant="soft"
              color={isPending ? 'warning' : isSuspended ? 'error' : isDeleted ? 'default' : isActive ? 'success' : 'default'}
              label={statusValue}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
            />
          </TableCell>

          <TableCell align="center" sx={{ px: 1 }}>
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ gap: 0.5 }}>
              <Tooltip title={t('viewProfile')} arrow placement="top">
                <IconButton size="small" color="default" onClick={() => router.push(detailsPath)} sx={{ p: 0.5 }}>
                  <Iconify icon="solar:eye-bold" width={20} />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Tooltip title={t('edit')}>
                  <IconButton size="small" onClick={handleOpenEditDialog} sx={{ p: 0.5 }}>
                    <Iconify icon="solar:pen-bold" width={20} />
                  </IconButton>
                </Tooltip>
              )}

            </Stack>
          </TableCell>
        </TableRow>

        <ClientQuickEditDialog
          open={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          client={row}
          statusValue={statusValue}
          onUpdateStatus={handleUpdateStatus}
        />
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.row._id === nextProps.row._id &&
    prevProps.row.name === nextProps.row.name &&
    prevProps.row.status === nextProps.row.status &&
    prevProps.row.joiningDate === nextProps.row.joiningDate &&
    prevProps.serialNumber === nextProps.serialNumber
);

SupportTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
};

SupportTableRow.displayName = 'SupportTableRow';
