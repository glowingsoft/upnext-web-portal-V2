import { Avatar, Box, Button, Chip, IconButton, Link, Stack, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { UserDeletionEligibilityChecklist } from 'src/components/user-deletion-eligibility-checklist';
import { UserDeletionImpactSummary } from 'src/components/user-deletion-impact-summary';
import { UserDeletionOptions } from 'src/components/user-deletion-options';
import { useTranslate } from 'src/locales/use-locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';
import {
  useCheckUserDeletionEligibilityMutation,
  useDeleteCustomerMutation,
  useHardDeleteCustomerMutation,
  useUpdateCustomerStatusMutation,
} from 'src/store/Reducer/customers-api';
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletionEligibility, setDeletionEligibility] = useState(null);
    const [deletionMode, setDeletionMode] = useState('soft');
    const [isHardDeleteReview, setIsHardDeleteReview] = useState(false);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [updateCustomerStatus] = useUpdateCustomerStatusMutation();
    const [checkUserDeletionEligibility, { isLoading: isCheckingDeletionEligibility }] = useCheckUserDeletionEligibilityMutation();
    const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
    const [hardDeleteCustomer, { isLoading: isHardDeleting }] = useHardDeleteCustomerMutation();
    const isProcessingDelete = isCheckingDeletionEligibility || isDeleting || isHardDeleting;
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

    const handleDeleteCustomer = async () => {
      try {
        const eligibility = await checkUserDeletionEligibility(row._id).unwrap();
        const eligibilityData = eligibility?.data ?? eligibility;

        if (deletionMode === 'hard') {
          if (!eligibilityData?.affectedRecords || typeof eligibilityData.affectedRecords !== 'object') {
            toast.error(t('hardDeleteImpactUnavailable'));
            return;
          }
          setDeletionEligibility(eligibilityData);
          setIsHardDeleteReview(true);
          return;
        }

        if (eligibilityData?.isDeletable !== true) {
          setDeletionEligibility(eligibilityData || {});
          return;
        }
        await deleteCustomer(row._id).unwrap();
        toast.success(t('deleteSuccessMessage'));
        setIsDeleteDialogOpen(false);
        setDeletionEligibility(null);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || t('failedToDelete'));
      }
    };

    const handleConfirmHardDelete = async () => {
      try {
        await hardDeleteCustomer(row._id).unwrap();
        toast.success(t('deleteSuccessMessage'));
        setIsDeleteDialogOpen(false);
        setDeletionEligibility(null);
        setIsHardDeleteReview(false);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || t('failedToDelete'));
      }
    };

    const handleOpenDeleteDialog = () => {
      setDeletionEligibility(null);
      setDeletionMode('soft');
      setIsHardDeleteReview(false);
      setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
      if (isProcessingDelete) return;
      setIsDeleteDialogOpen(false);
      setDeletionEligibility(null);
      setDeletionMode('soft');
      setIsHardDeleteReview(false);
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
                <>
                  <Tooltip title={t('edit')}>
                    <IconButton size="small" onClick={handleOpenEditDialog} sx={{ p: 0.5 }}>
                      <Iconify icon="solar:pen-bold" width={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('deleteAction')}>
                    <IconButton size="small" color="error" onClick={handleOpenDeleteDialog} sx={{ p: 0.5 }}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </TableCell>
        </TableRow>

        {isAdmin && (
          <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth={isHardDeleteReview ? 'sm' : 'xs'} fullWidth>
            <DialogTitle>
              {t(isHardDeleteReview ? 'hardDeleteReviewTitle' : deletionEligibility && deletionMode === 'soft' ? 'deletionBlockedTitle' : 'deleteCustomerTitle')}
            </DialogTitle>
            <DialogContent>
              {isHardDeleteReview ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {t('hardDeleteReviewDescription')}
                  </Typography>
                  <UserDeletionImpactSummary affectedRecords={deletionEligibility.affectedRecords} />
                </>
              ) : (
                <>
                  {!deletionEligibility && (
                    <Typography variant="body2" color="text.secondary">
                      {t('deleteCustomerMessage', { name: row.name })}
                    </Typography>
                  )}
                  <UserDeletionOptions
                    value={deletionMode}
                    onChange={(mode) => {
                      setDeletionMode(mode);
                      setDeletionEligibility(null);
                      setIsHardDeleteReview(false);
                    }}
                  />
                  {deletionEligibility && deletionMode === 'soft' && <UserDeletionEligibilityChecklist eligibility={deletionEligibility} />}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} disabled={isProcessingDelete}>
                {t('close')}
              </Button>
              {isHardDeleteReview ? (
                <LoadingButton color="error" variant="contained" loading={isHardDeleting} onClick={handleConfirmHardDelete}>
                  {t('hardDeletePermanently')}
                </LoadingButton>
              ) : (
                <LoadingButton color="error" variant="contained" loading={isProcessingDelete} onClick={handleDeleteCustomer}>
                  {t(deletionMode === 'hard' ? 'reviewHardDelete' : 'deleteAction')}
                </LoadingButton>
              )}
            </DialogActions>
          </Dialog>
        )}

        <ClientQuickEditDialog open={isEditDialogOpen} onClose={handleCloseEditDialog} client={row} statusValue={statusValue} onUpdateStatus={handleUpdateStatus} />
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
