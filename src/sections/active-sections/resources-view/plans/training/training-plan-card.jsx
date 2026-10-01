import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TrainingPlanCard({ plan, onEdit, onDelete }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 2,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderLeft: '4px solid',
        boxShadow: 1,
        borderLeftColor: 'primary.main',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows?.z8 || '0 8px 16px 0 rgba(145,158,171,0.16)',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          bgcolor: 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon="solar:dumbbell-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {plan.name}
        </Typography>
        <Stack direction="row" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
          <MetaBullet icon="solar:calendar-bold" label={`${plan.daysPerWeek}/week`} />
          <MetaBullet icon="solar:clock-circle-bold" label={plan.duration} />
          <MetaBullet icon="solar:users-group-rounded-bold" label={`Assigned to ${plan.assignedClients} clients`} />
        </Stack>
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={0.5} flexShrink={0}>
        <IconButton size="small" onClick={() => onEdit(plan)} sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(plan.id)} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function MetaBullet({ icon, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Iconify icon={icon} width={13} sx={{ color: 'text.disabled' }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
