import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { fData } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function StepAccount({ role, onRoleChange }) {
  const password = useBoolean();
  const confirmPassword = useBoolean();

  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={role}
        onChange={(_, val) => {
          if (val) onRoleChange(val);
        }}
        sx={{
          '& .MuiToggleButton-root': {
            py: 1,
            fontWeight: 600,
            borderColor: 'rgba(0,0,0,0.32)',
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
            '&:hover': {
              bgcolor: 'action.hover',
            },
          },
        }}
      >
        <ToggleButton value="customer">Customer</ToggleButton>
        <ToggleButton value="provider">Provider</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Field.UploadAvatar
          name="avatarUrl"
          maxSize={3145728}
          helperText={
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', color: 'text.disabled' }}>
              Allowed *.jpeg, *.jpg, *.png, *.gif
              <br />
              max size of {fData(3145728)}
            </Typography>
          }
        />
      </Box>

      <Field.Text name="fullName" label="Full Name" InputLabelProps={{ shrink: true }} />

      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Field.Phone name="phoneNumber" label="Phone number" />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="Confirm password"
        placeholder="Re-enter your password"
        type={confirmPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
