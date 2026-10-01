import PropTypes from 'prop-types';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { fData } from 'src/utils/format-number';

import { RegistrationDocumentsField } from '../../provider-view/components/registration-documents-field';

export default function LicenseTagApplicationDialog({
  open,
  files,
  maxFileSize,
  providerName,
  certificationType = '',
  certificationTypeOptions = [],
  loading = false,
  onApply,
  onClose,
  onDeleteFile,
  onUploadFiles,
  onCertificationTypeChange = () => {},
}) {
  const { t } = useTranslate();
  const canSubmit = Boolean(certificationType) && files.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
                color: 'warning.dark',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:shield-user-bold" width={24} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="span" fontWeight={700}>
                {t('applyLicensedProfessionalTag', { defaultValue: 'Apply Licensed Professional' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {providerName}
              </Typography>
            </Box>
          </Stack>

          <IconButton aria-label={t('close', { defaultValue: 'Close' })} onClick={onClose} size="small" sx={{ mr: -0.5 }}>
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            label="License Type"
            value={certificationType}
            onChange={(event) => onCertificationTypeChange(event.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              displayEmpty: true,
              MenuProps: {
                PaperProps: { sx: { maxHeight: 320, overflowY: 'auto' } },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a license type
            </MenuItem>
            {certificationTypeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack spacing={1.5}>
            <RegistrationDocumentsField files={files} onDelete={onDeleteFile} onUpload={onUploadFiles} title="Upload License" />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Allowed any file type, max size of {fData(maxFileSize)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>{t('cancel')}</Button>
        <LoadingButton
          variant="contained"
          disabled={!canSubmit}
          loading={loading}
          onClick={onApply}
          startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
        >
          {t('done', { defaultValue: 'Done' })}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

LicenseTagApplicationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  maxFileSize: PropTypes.number.isRequired,
  providerName: PropTypes.string.isRequired,
  certificationType: PropTypes.string,
  certificationTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
  ),
  loading: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleteFile: PropTypes.func.isRequired,
  onUploadFiles: PropTypes.func.isRequired,
  onCertificationTypeChange: PropTypes.func,
};
