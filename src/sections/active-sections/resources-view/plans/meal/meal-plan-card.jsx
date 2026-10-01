import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MealPlanCard({ plan, onEdit, onDelete }) {
  const totalKcal = plan.meals.reduce((sum, m) => sum + Number(m.kcal || 0), 0);
  const totalProtein = plan.meals.reduce((sum, m) => sum + Number(m.protein || 0), 0);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        borderLeft: '4px solid',
        borderLeftColor: 'primary.main',
        boxShadow: 1,
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
        <Iconify icon="solar:plate-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {plan.name}
        </Typography>
        <Stack direction="row" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
          <MetaBullet icon="solar:tag-bold" label={plan.phase} />
          <MetaBullet icon="solar:plate-bold-duotone" label={`${plan.meals.length} meals`} />
          {totalKcal > 0 && <MetaBullet icon="solar:fire-bold-duotone" label={`${totalKcal} kcal from meals`} />}
          <MetaBullet icon="solar:users-group-rounded-bold" label={`Assigned to ${plan.assignedClients} clients`} />
          {plan.targets.protein && <MetaBullet icon="solar:dumbbell-bold" label={`Target ${plan.targets.protein}g protein`} />}
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
