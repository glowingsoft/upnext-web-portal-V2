import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';

// `onUpdateStatus` is async — the parent performs the real API call and either resolves
// (success) or throws (error), so this dialog can show the right toast either way.
export function ClientQuickEditDialog({ open, onClose, client, statusValue, onUpdateStatus }) {
  const { t } = useTranslate();
  const [draftStatus, setDraftStatus] = useState(statusValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDraftStatus(statusValue);
    }
  }, [open, statusValue]);

  const handleUpdate = async () => {
    if (draftStatus === statusValue) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStatus(draftStatus);
      toast.success(t('updateSuccess'));
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              flexShrink: 0,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:user-bold" width={24} />
          </Stack>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="span" fontWeight={700}>
              {t('quickUpdate')}
            </Typography>
            {client?.name ? (
              <Typography variant="body2" color="text.secondary" noWrap title={client.name}>
                {client.name}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="client-status-label" shrink>
            {t('status')}
          </InputLabel>
          <Select id="client-status" labelId="client-status-label" value={draftStatus} label={t('status')} onChange={(event) => setDraftStatus(event.target.value)}>
            <MenuItem value="active">{'Active'}</MenuItem>
            <MenuItem value="inactive">{'Inactive'}</MenuItem>
            <MenuItem value="pending">{'Pending'}</MenuItem>
            <MenuItem value="suspended">{'Suspended'}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('cancel')}
        </Button>
        <LoadingButton color="primary" variant="contained" loading={isSubmitting} onClick={handleUpdate}>
          {t('update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ClientQuickEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  client: PropTypes.object,
  statusValue: PropTypes.oneOf(['active', 'inactive', 'pending', 'suspended', 'deleted']).isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
};
