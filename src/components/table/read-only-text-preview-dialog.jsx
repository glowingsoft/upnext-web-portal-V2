import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function ReadOnlyTextPreviewDialog({
  open,
  onClose,
  title,
  text = '',
  dismissLabel = 'Close',
  emptyMessage = 'No content to display.',
}) {
  const body = typeof text === 'string' ? text.trim() : String(text ?? '');
  const isEmpty = !body;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      aria-labelledby="read-only-preview-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.dialog,
        },
      }}
    >
      <DialogTitle
        id="read-only-preview-title"
        sx={{
          position: 'relative',
          pb: 2,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          pr: { xs: 5, sm: 6 },
          textAlign: 'left',
        }}
      >
        <IconButton
          aria-label={dismissLabel}
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
          }}
        >
          <Iconify icon="mingcute:close-line" width={22} />
        </IconButton>

        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-start" sx={{ width: '100%', maxWidth: '100%', pr: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.dark',
            }}
          >
            <Iconify icon="solar:document-text-bold" width={26} />
          </Box>

          <Typography variant="h6" component="span" sx={{ textAlign: 'left' }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2 },
          pt: 0,
        }}
      >
        <Box
          sx={{
            mt: 1,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            bgcolor: (theme) => theme.vars.palette.background.neutral,
            overflow: 'hidden',
          }}
        >
          <Scrollbar sx={{ maxHeight: { xs: 280, sm: 360 }, p: { xs: 2, sm: 2.5 } }}>
            {isEmpty ? (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                {emptyMessage}
              </Typography>
            ) : (
              <Typography
                component="div"
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'text.primary',
                  lineHeight: 1.65,
                }}
              >
                {body}
              </Typography>
            )}
          </Scrollbar>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, pt: 0, justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ minWidth: 100 }}>
          {dismissLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ReadOnlyTextPreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  text: PropTypes.string,
  dismissLabel: PropTypes.string,
  emptyMessage: PropTypes.node,
};
