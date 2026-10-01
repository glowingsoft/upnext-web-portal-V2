import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { ACCENT_DARK, ACCENT_SOFT, resolveMediaDisplay } from './portfolio-utils';

export function PortfolioViewDialog({ item, canManage, onClose, onEdit, onRequestDelete }) {
  const mediaItem = item?.media?.[0];
  const display = resolveMediaDisplay(mediaItem);
  const kind = display?.kind;
  const pdfSrc = mediaItem ? `${mediaItem.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH` : '';

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={Boolean(item)}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: 3,
          py: 2.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {item?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: ACCENT_DARK, fontWeight: 600 }} noWrap>
            {item?.businessName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
          {canManage && (
            <>
              <IconButton
                size="small"
                onClick={() => onEdit(item)}
                sx={{ bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08) }}
              >
                <Iconify icon="solar:pen-bold" width={17} sx={{ color: ACCENT_DARK }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onRequestDelete(item)}
                sx={{ bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08), '&:hover': { bgcolor: 'error.lighter' } }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={17} sx={{ color: 'error.main' }} />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08) }}
          >
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            bgcolor: kind === 'pdf' ? 'grey.100' : 'common.black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
          }}
        >
          {kind === 'image' && (
            <Box component="img" src={mediaItem.url} alt={item?.name} sx={{ width: '100%', maxHeight: '62vh', objectFit: 'contain' }} />
          )}

          {kind === 'video' && (
            <Box
              component="video"
              src={mediaItem.url}
              controls
              autoPlay
              poster={mediaItem.thumbnail || undefined}
              sx={{ width: '100%', maxHeight: '62vh' }}
            />
          )}

          {kind === 'pdf' && <Box component="iframe" title={item?.name} src={pdfSrc} sx={{ width: '100%', height: '62vh', border: 0 }} />}

          {(kind === 'other' || !mediaItem) && (
            <Stack spacing={1.5} alignItems="center" sx={{ py: 6 }}>
              <Iconify icon="solar:file-text-bold" width={40} sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {mediaItem ? 'Preview not available for this file' : 'No media attached'}
              </Typography>
            </Stack>
          )}
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {item?.description}
          </Typography>

          {mediaItem && (
            <Button
              component="a"
              href={mediaItem.url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              sx={{ mt: 2, color: ACCENT_DARK, borderColor: varAlpha('183 154 115', 0.4), '&:hover': { borderColor: ACCENT_DARK, bgcolor: ACCENT_SOFT } }}
              startIcon={<Iconify icon="eva:external-link-fill" width={16} />}
            >
              Open Original
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
