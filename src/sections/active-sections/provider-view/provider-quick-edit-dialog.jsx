import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { RegistrationDocumentsField } from './components/registration-documents-field';

// `onUpdateStatus`/`onApprove`/`onReject` are async — the parent performs the real API call and
// either resolves (success) or throws (error), so this dialog can show the right toast either way.
export function ProviderQuickEditDialog({ open, onClose, provider, statusValue, onUpdateStatus, onApprove, onReject }) {
  const { t } = useTranslate();
  const localObjectUrlsRef = useRef([]);
  const [draftStatus, setDraftStatus] = useState(statusValue);
  const [draftFiles, setDraftFiles] = useState(provider?.documents);
  const [draftCertStatus, setDraftCertStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCertification = Boolean(provider?.licensedProfessional);
  const certStatus = String(provider?.certificationStatus || '').toLowerCase() || 'pending';

  useEffect(() => {
    if (open) {
      setDraftStatus(statusValue);
      setDraftCertStatus(certStatus);
      setDraftFiles(Array.isArray(provider?.documents) ? provider.documents : []);
      setRejectionReason('');
    } else {
      localObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localObjectUrlsRef.current = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider, statusValue]);

  const handleDeleteFile = (fileId) => {
    setDraftFiles((currentFiles) => {
      const removedFile = currentFiles.find((file) => file.id === fileId);

      if (removedFile?.isObjectUrl) {
        URL.revokeObjectURL(removedFile.url);
        localObjectUrlsRef.current = localObjectUrlsRef.current.filter((url) => url !== removedFile.url);
      }

      return currentFiles.filter((file) => file.id !== fileId);
    });
  };

  const handleUploadFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const nextFiles = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      localObjectUrlsRef.current.push(url);

      return {
        id: `local-${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        type: file.type || t('uploadedFile'),
        url,
        file,
        isObjectUrl: true,
      };
    });

    setDraftFiles((currentFiles) => [...currentFiles, ...nextFiles]);
    event.target.value = '';
  };

  const handleCertStatusChange = (event) => {
    setDraftCertStatus(event.target.value);
    if (event.target.value !== 'rejected') {
      setRejectionReason('');
    }
  };

  const handleUpdate = async () => {
    const statusChanged = draftStatus !== statusValue;
    const certChanged = hasCertification && draftCertStatus !== certStatus;

    if (!statusChanged && !certChanged) {
      onClose();
      return;
    }

    if (certChanged && draftCertStatus === 'rejected' && !rejectionReason.trim()) {
      toast.error(t('rejectionReasonRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Two distinct APIs — only call the ones whose value actually changed.
      if (statusChanged) {
        await onUpdateStatus(draftStatus);
      }

      if (certChanged) {
        if (draftCertStatus === 'approved') {
          await onApprove();
        } else if (draftCertStatus === 'rejected') {
          await onReject(rejectionReason.trim());
        }
      }

      toast.success(t('updateSuccess'));
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:pen-bold" width={24} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="span" fontWeight={700}>
                {t('quickUpdate')}
              </Typography>
              {provider?.name ? (
                <Typography variant="body2" color="text.secondary" noWrap title={provider.name}>
                  {provider.name}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <IconButton aria-label={t('close')} onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Account status — always editable */}
          <FormControl fullWidth>
            <InputLabel id="provider-status-label" shrink>
              {t('status')}
            </InputLabel>
            <Select id="provider-status" labelId="provider-status-label" value={draftStatus} label={t('status')} onChange={(event) => setDraftStatus(event.target.value)}>
              <MenuItem value="active">{t('active')}</MenuItem>
              <MenuItem value="pending">{t('pending')}</MenuItem>
              <MenuItem value="inactive">{t('inactive')}</MenuItem>
              <MenuItem value="suspended">{t('suspended')}</MenuItem>
            </Select>
          </FormControl>

          {/* Certification status — a separate status from the account status above */}
          {hasCertification && (
            <>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="subtitle2">{t('certification')}</Typography>

                <RegistrationDocumentsField files={draftFiles} onDelete={handleDeleteFile} onUpload={handleUploadFiles} readOnly />

                <FormControl fullWidth>
                  <InputLabel id="certification-status-label" shrink>
                    {t('certificationStatus')}
                  </InputLabel>
                  <Select
                    id="certification-status"
                    labelId="certification-status-label"
                    value={draftCertStatus}
                    label={t('certificationStatus')}
                    onChange={handleCertStatusChange}
                  >
                    <MenuItem value="pending">{t('pending')}</MenuItem>
                    <MenuItem value="approved">{t('accept')}</MenuItem>
                    <MenuItem value="rejected">{t('reject')}</MenuItem>
                  </Select>
                </FormControl>

                {draftCertStatus === 'rejected' && (
                  <TextField
                    label={t('rejectionReason')}
                    placeholder={t('rejectionReasonPlaceholder')}
                    multiline
                    rows={2}
                    fullWidth
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    helperText={t('rejectionReasonHelper')}
                  />
                )}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, mt: 1 }}>
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

ProviderQuickEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  provider: PropTypes.object,
  statusValue: PropTypes.oneOf(['active', 'inactive', 'pending', 'suspended', 'deleted']).isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};
