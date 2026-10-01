import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const STATUS_COLOR = { active: 'success', inactive: 'warning', deleted: 'error' };

function DetailRow({ icon, label, children }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        }}
      >
        <Iconify icon={icon} width={18} sx={{ color: 'primary.main' }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Box sx={{ mt: 0.25 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export function TagsDetailDialog({ open, onClose, tag }) {
  if (!tag) return null;

  const categoryName = tag.category?.name || tag.category?.translations?.en || '—';

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <Typography variant="h6">Tag Details</Typography>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} alignItems="center" sx={{ pt: 1, pb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:tag-bold" width={32} />
          </Avatar>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {tag.name}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Stack spacing={2.5}>
          <DetailRow icon="solar:folder-bold" label="Category">
            <Label variant="soft" color="info">
              {categoryName}
            </Label>
          </DetailRow>

          {tag.status && (
            <DetailRow icon="solar:shield-check-bold" label="Status">
              <Label variant="soft" color={STATUS_COLOR[tag.status] || 'default'} sx={{ textTransform: 'capitalize' }}>
                {tag.status}
              </Label>
            </DetailRow>
          )}

          <DetailRow icon="solar:sort-bold" label="Sort Order">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tag.sortOrder ?? '—'}
            </Typography>
          </DetailRow>

          {tag.createdAt && (
            <DetailRow icon="solar:calendar-add-bold" label="Created">
              <Typography variant="body2">{fDateTime(tag.createdAt)}</Typography>
            </DetailRow>
          )}

          {tag.updatedAt && (
            <DetailRow icon="solar:refresh-bold" label="Last Updated">
              <Typography variant="body2">{fDateTime(tag.updatedAt)}</Typography>
            </DetailRow>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
