import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Stack, Typography } from '@mui/material';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useVerifyLoginOtpMutation } from 'src/store/Reducer/auth';
import { useDispatch } from 'react-redux';
import { setUser } from 'src/store/slices/userSlice';

import { JwtOtpCodeFields } from './jwt-otp-code-fields';
import { OtpVerifySchema } from './otp-verify-schema';
import { goToPostLogin } from './auth-redirect-storage';
import { getFcmToken } from 'src/lib/firebase-messaging';

// ----------------------------------------------------------------------

export function JwtVerifyLoginOtpView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const email = sessionStorage.getItem('login_2fa_email') || '';
  const [displayOtp] = useState(sessionStorage.getItem('login_2fa_otp') || '');

  const [verifyLoginOtp] = useVerifyLoginOtpMutation();

  const methods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { otp: '' },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const fcmToken = await getFcmToken();

      const response = await verifyLoginOtp({
        email,
        otp: data.otp,
        deviceId: fcmToken || 'web',
        deviceType: 'web',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).unwrap();

      const user = response?.data;

      if (!user?.accountState?.status) {
        toast.error('Verification succeeded but no account data was returned. Please try signing in again.');
        return;
      }

      let permission = 2;
      if (user?.accountState?.userType === 'admin' || user?.accountState?.userType === 'subadmin') {
        permission = 1;
      }

      dispatch(setUser({ ...user, permission }));
      sessionStorage.removeItem('login_2fa_email');
      sessionStorage.removeItem('login_2fa_otp');
      goToPostLogin(router, paths, permission, user?.accountState?.userType, user?.profile);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Verification failed.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">Two-factor verification</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter the One-Time Password (OTP) sent to{email ? ` ${email}` : ' your email'} to finish signing in.
        </Typography>
      </Stack>

      {displayOtp && (
        <Box
          sx={{
            mb: 3,
            px: 2,
            py: 1.5,
            borderRadius: 1.5,
            bgcolor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 700 }}>
            Development OTP :
          </Typography>
          <Typography variant="h6" sx={{ color: 'warning.dark', letterSpacing: 4, mt: 0.25 }}>
            {displayOtp}
          </Typography>
        </Box>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <JwtOtpCodeFields control={control} />

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Verifying..."
          >
            Verify &amp; sign in
          </LoadingButton>

          <Link
            component="button"
            type="button"
            variant="body2"
            color="inherit"
            sx={{ alignSelf: 'center' }}
            onClick={() => {
              sessionStorage.removeItem('login_2fa_email');
              sessionStorage.removeItem('login_2fa_otp');
              router.push(paths.auth.jwt.signIn);
            }}
          >
            Back to sign in
          </Link>
        </Stack>
      </Form>
    </>
  );
}
