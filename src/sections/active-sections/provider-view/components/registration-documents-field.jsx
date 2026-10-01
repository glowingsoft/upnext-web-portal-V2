import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

function getFileTypeMeta(fileName) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return { icon: 'solar:file-text-bold', color: 'error.main', bgcolor: 'error.lighter' };
    case 'doc':
    case 'docx':
      return { icon: 'solar:file-text-bold', color: 'info.main', bgcolor: 'info.lighter' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { icon: 'solar:file-text-bold', color: 'success.main', bgcolor: 'success.lighter' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return { icon: 'solar:gallery-bold', color: 'warning.main', bgcolor: 'warning.lighter' };
    default:
      return { icon: 'solar:file-bold', color: 'text.secondary', bgcolor: 'grey.200' };
  }
}

export function RegistrationDocumentsField({ files, onDelete, onUpload, title = '', readOnly = false, error = '' }) {
  const { t } = useTranslate();
  const hasFiles = files.length > 0;

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Typography variant="subtitle2">{title || t('uploadLicenseImage')}</Typography>

        {!readOnly && !hasFiles && (
          <Button component="label" size="small" variant="outlined" startIcon={<Iconify icon="solar:upload-bold" width={18} />}>
            {t('upload')}
            <Box component="input" type="file" hidden multiple onChange={onUpload} />
          </Button>
        )}
      </Stack>

      {hasFiles ? (
        files.map((file) => {
          const fileTypeMeta = getFileTypeMeta(file.name);
          return (
          <Stack
            key={file.id}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: fileTypeMeta.bgcolor,
                  color: fileTypeMeta.color,
                }}
              >
                <Iconify icon={fileTypeMeta.icon} width={18} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap title={file.name}>
                  {file.name}
                </Typography>
                {!!file.type && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {file.type}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <IconButton component="a" href={file.url} target="_blank" rel="noopener noreferrer" size="small" aria-label={t('open')}>
                <Iconify icon="eva:external-link-fill" width={18} />
              </IconButton>
              {!readOnly && (
                <IconButton color="error" size="small" onClick={() => onDelete(file.id)}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              )}
            </Stack>
          </Stack>
          );
        })
      ) : (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: error ? 'error.main' : 'divider',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">{t('noUploadedFiles')}</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}

RegistrationDocumentsField.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  title: PropTypes.string,
  readOnly: PropTypes.bool,
  error: PropTypes.string,
};
