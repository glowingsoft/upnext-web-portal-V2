import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { usePublicFonts } from 'src/hooks/use-public-fonts';

import { useResetPasswordMutation } from 'src/store/Reducer/auth';
import { getPasswordResetEmail, getPasswordResetToken, getPasswordResetSource, clearPasswordResetStorage } from './password-reset-flow-storage';
import { authFieldSx, authHeadingSx } from './auth-form-styles';

// ----------------------------------------------------------------------

const ResetPasswordSchema = zod
  .object({
    newPassword: zod.string().min(6, { message: 'New password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(6, { message: 'Please confirm your new password!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function JwtResetPasswordView() {
  usePublicFonts();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const newPassword = useBoolean();
  const confirmPassword = useBoolean();

  const [resetPassword] = useResetPasswordMutation();

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const {
    watch,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isSubmitted },
  } = methods;

  const newPasswordValue = watch('newPassword');
  useEffect(() => {
    if (isSubmitted) trigger('confirmPassword');
  }, [newPasswordValue, isSubmitted, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      const email = getPasswordResetEmail() || '';
      const resetToken = getPasswordResetToken() || '';
      const source = getPasswordResetSource();

      await resetPassword({ email, newPassword: data.newPassword, resetToken }).unwrap();

      clearPasswordResetStorage();
      toast.success('Password reset successfully!');
      router.push(source === 'admin' ? paths.admin.login : paths.auth.jwt.signIn);
    } catch (error) {
      setErrorMsg(error?.data?.message || error?.message || 'Failed to reset password. Please try again.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={authHeadingSx}>
          Reset your password
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please enter your new password and confirm it below.
        </Typography>
      </Stack>

      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3} sx={authFieldSx}>
          <Field.Text
            name="newPassword"
            label="New Password"
            placeholder="Enter your new password"
            type={newPassword.value ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={newPassword.onToggle} edge="end">
                    <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Field.Text
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your new password"
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

          <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Resetting...">
            Reset Password
          </LoadingButton>
        </Stack>
      </Form>
    </>
  );
}
