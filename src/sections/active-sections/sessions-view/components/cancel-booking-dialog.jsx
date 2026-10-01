import PropTypes from 'prop-types';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';

export const CANCEL_RED = '#9F0000';

export function CancelBookingDialog({ open, onClose, onConfirm, variant = 'cancel' }) {
  const { t } = useTranslate();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedReason = reason.trim();

  const isReject = variant === 'reject';
  const isWithdraw = variant === 'withdraw';
  const title = isReject ? t('rejectBooking') : isWithdraw ? t('withdrawRequest') : t('cancelBooking');
  const description = isReject
    ? t('rejectBookingDescription')
    : isWithdraw
      ? t('withdrawRequestDescription')
      : t('cancelBookingDescription');
  const submitLabel = isReject ? t('rejectBooking') : isWithdraw ? t('withdrawRequest') : t('cancelBooking');

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!trimmedReason) {
      toast.error(t('cancellationReasonRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm?.({ reason: trimmedReason });
      setReason('');
      onClose();
    } catch (error) {
      // Parent is responsible for surfacing the specific error — just keep the dialog open
      // so the user can retry instead of losing their typed reason.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>

          <TextField
            fullWidth
            required
            multiline
            minRows={4}
            label={t('cancellationReason')}
            placeholder={t('typeHere')}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit}
          sx={{
            bgcolor: CANCEL_RED,
            color: 'common.white',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#6e1818', boxShadow: 'none' },
          }}
        >
          {isSubmitting ? t('processing') : submitLabel}
        </Button>

        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSubmitting}>
          {t('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CancelBookingDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  variant: PropTypes.oneOf(['cancel', 'reject', 'withdraw']),
};
