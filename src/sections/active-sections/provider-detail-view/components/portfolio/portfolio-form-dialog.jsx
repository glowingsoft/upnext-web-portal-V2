import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

import { ACCENT, ACCENT_DARK, ALLOWED_FILE_TYPES_ATTR } from './portfolio-utils';

function MemoryUploadField({ file, onUpload, onRemove }) {
  const kind = file?.kind || null;

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>
        Memory
      </Typography>

      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: '1.5px dashed',
          borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {file ? (
          <>
            <Stack spacing={1} alignItems="center" sx={{ py: 3, px: 2, width: '100%' }}>
              {file.previewUrl ? (
                <Box component="img" src={file.previewUrl} alt={file.name} sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover' }} />
              ) : (
                <Iconify
                  icon={kind === 'video' ? 'solar:videocamera-bold' : 'solar:file-text-bold'}
                  width={36}
                  sx={{ color: ACCENT_DARK }}
                />
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, maxWidth: '90%' }} noWrap>
                {file.name}
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.lighter' } }}
            >
              <Iconify icon="mingcute:close-line" width={14} />
            </IconButton>
          </>
        ) : (
          <Button component="label" sx={{ width: '100%', height: '100%', py: 3, color: 'text.secondary' }}>
            <Stack spacing={1} alignItems="center">
              <Iconify icon="solar:gallery-add-bold" width={30} sx={{ color: ACCENT }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please upload here...
              </Typography>
            </Stack>
            <Box component="input" type="file" accept={ALLOWED_FILE_TYPES_ATTR} hidden onChange={onUpload} />
          </Button>
        )}
      </Box>

      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        You can upload PNG, JPG, PDF, or MP4 file format.
      </Typography>
    </Stack>
  );
}

export function PortfolioFormDialog({ open, editingId, form, isSaving, onChange, onUploadFile, onRemoveFile, onSave, onClose }) {
  const { t } = useTranslate();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>{editingId ? 'Edit Portfolio' : 'Create Portfolio'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Full Name"
            placeholder="Enter Your Full Name"
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
          />
          <TextField
            label="Business Name"
            placeholder="Enter Your Business Name"
            value={form.businessName}
            onChange={(event) => onChange('businessName', event.target.value)}
          />
          <TextField
            label="Description"
            placeholder="Enter Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
          />

          <MemoryUploadField file={form.file} onUpload={onUploadFile} onRemove={onRemoveFile} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', px: 3, pb: 3, pt: 1, gap: 1 }}>
        <LoadingButton
          fullWidth
          variant="contained"
          loading={isSaving}
          onClick={onSave}
          sx={{ bgcolor: ACCENT, color: '#fff', py: 1.25, fontWeight: 700, '&:hover': { bgcolor: ACCENT_DARK } }}
        >
          {editingId ? 'Update Portfolio' : 'Create Portfolio'}
        </LoadingButton>
        <Button fullWidth color="inherit" onClick={onClose} disabled={isSaving}>
          {t('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
