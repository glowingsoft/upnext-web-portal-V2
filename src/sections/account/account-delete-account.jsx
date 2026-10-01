import { useState } from 'react';
import { useDispatch } from 'react-redux';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { categoriesApi } from 'src/store/Reducer/categories-api';
import { authApi, useDeleteAccountMutation } from 'src/store/Reducer/auth';
import { walletsApi } from 'src/store/Reducer/wallets-api';
import { logout } from 'src/store/slices/userSlice';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

const DELETE_CONFIRM_TEXT = 'Delete Account';

export function AccountDeleteAccount() {
  const { t } = useTranslate();
  const router = useRouter();
  const dispatch = useDispatch();
  const [deleteAccount, { isLoading: isSubmitting }] = useDeleteAccountMutation();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const canDelete = confirmText.trim() === DELETE_CONFIRM_TEXT;

  const handleClose = () => {
    if (isSubmitting) return;
    setOpen(false);
    setConfirmText('');
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;

    try {
      await deleteAccount().unwrap();

      dispatch(walletsApi.util.resetApiState());
      dispatch(categoriesApi.util.resetApiState());
      dispatch(authApi.util.resetApiState());
      dispatch(logout());
      localStorage.clear();

      toast.success(t('accountDeletedSuccessfully'));
      router.replace('/');
    } catch (error) {
      const message = error?.data?.message || error?.message;
      toast.error(typeof message === 'string' ? message : t('deleteAccountFailed'));
    }
  };

  return (
    <>
      <Card
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Iconify icon="solar:danger-triangle-bold" width={22} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 800 }}>
              {t('deleteAccount')}
            </Typography>
          </Stack>

          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 800 }}>
              {t('warning')}
            </Box>{' '}
            {t('deleteAccountWarning')}
          </Typography>

          <Box>
            <Button variant="contained" color="error" onClick={() => setOpen(true)}>
              {t('deleteMyAccount')}
            </Button>
          </Box>
        </Stack>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>{t('confirmAccountDeletion')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" width={22} />}>
              {t('deleteAccountConfirmWarning')}
            </Alert>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('deleteAccountTypeToConfirm', { value: DELETE_CONFIRM_TEXT })}
            </Typography>

            <TextField
              fullWidth
              value={confirmText}
              disabled={isSubmitting}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={DELETE_CONFIRM_TEXT}
              inputProps={{ 'aria-label': t('deleteAccount') }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={handleClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <LoadingButton color="error" variant="contained" loading={isSubmitting} disabled={!canDelete} onClick={handleDeleteAccount}>
            {t('yesDeleteMyAccount')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
