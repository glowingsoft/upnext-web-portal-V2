import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Stack, Typography } from '@mui/material';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useVerifyOtpEmailMutation, useResendOtpEmailMutation } from 'src/store/Reducer/auth';
import { getPasswordResetEmail, setPasswordResetToken } from './password-reset-flow-storage';
import { JwtOtpCodeFields } from './jwt-otp-code-fields';
import { OtpVerifySchema } from './otp-verify-schema';

export { OtpVerifySchema } from './otp-verify-schema';

// ----------------------------------------------------------------------

export function JwtVerifyPasswordView() {
  const router = useRouter();
  const email = getPasswordResetEmail() || '';
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [displayOtp, setDisplayOtp] = useState(() => sessionStorage.getItem('reset_otp') || '');

  const [verifyOtp] = useVerifyOtpEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpEmailMutation();

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

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
    setErrorMsg('');
    try {
      const response = await verifyOtp({ email, otp: data.otp }).unwrap();
      const resetToken = response?.data?.resetToken || response?.data?.token || '';
      setPasswordResetToken(resetToken);
      sessionStorage.removeItem('reset_otp');
      router.push(paths.auth.jwt.resetPassword);
    } catch (error) {
      setErrorMsg(error?.data?.message || error?.message || 'Verification failed. Please try again.');
    }
  });

  const handleResendOtp = async (event) => {
    event.preventDefault();
    try {
      const response = await resendOtp({ email }).unwrap();
      const newOtp = response?.data?.otp || '';
      if (newOtp) {
        sessionStorage.setItem('reset_otp', newOtp);
        setDisplayOtp(newOtp);
      }
      toast.success('OTP resent successfully!');
      setCountdown(30);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">Verify OTP</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please enter the One-Time Password (OTP) sent to{email ? ` ${email}` : ' your email'} to continue.
        </Typography>
      </Stack>

      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      {displayOtp ? (
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
            Development OTP:
          </Typography>
          <Typography variant="h6" sx={{ color: 'warning.dark', letterSpacing: 4, mt: 0.25 }}>
            {displayOtp}
          </Typography>
        </Box>
      ) : null}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Box>
            <JwtOtpCodeFields control={control} />

            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Did not receive OTP?
              </Typography>
              {countdown > 0 ? (
                <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                  Resend in {countdown}s
                </Typography>
              ) : (
                <Link component="button" type="button" variant="subtitle2" onClick={handleResendOtp} disabled={isResending}>
                  {isResending ? 'Sending...' : 'Resend'}
                </Link>
              )}
            </Stack>
          </Box>

          <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Verifying...">
            Verify OTP
          </LoadingButton>
        </Stack>
      </Form>
    </>
  );
}
