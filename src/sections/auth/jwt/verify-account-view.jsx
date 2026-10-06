import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Stack, Typography } from '@mui/material';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useVerifyOtpEmailMutation, useResendOtpEmailMutation } from 'src/store/Reducer/auth';
import { useDispatch } from 'react-redux';
import { setUser } from 'src/store/slices/userSlice';

import { JwtOtpCodeFields } from './jwt-otp-code-fields';
import { OtpVerifySchema } from './otp-verify-schema';
import { authFieldSx, authHeadingSx } from './auth-form-styles';
import { usePublicFonts } from 'src/hooks/use-public-fonts';

// ----------------------------------------------------------------------

export function JwtVerifyAccountView() {
  usePublicFonts();
  const router = useRouter();
  const dispatch = useDispatch();
  const email = sessionStorage.getItem('verify_email') || '';
  const [displayOtp, setDisplayOtp] = useState(sessionStorage.getItem('verify_otp') || '');

  const [verifyOtp] = useVerifyOtpEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpEmailMutation();
  const [countdown, setCountdown] = useState(30);

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
    try {
      const response = await verifyOtp({ email, otp: data.otp }).unwrap();

      // Save token to Redux so subsequent API calls (complete-profile) are authenticated
      const user = response?.data;
      if (user?.token) {
        const permission = user?.accountState?.userType === 'admin' ? 1 : 2;
        dispatch(setUser({ ...user, permission }));
      }

      toast.success('Account verified!');
      sessionStorage.removeItem('verify_email');
      sessionStorage.removeItem('verify_otp');
      router.push(paths.auth.jwt.signUpComplete);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Verification failed.');
    }
  });

  const handleResendOtp = async (event) => {
    event.preventDefault();
    try {
      const response = await resendOtp({ email }).unwrap();
      const newOtp = response?.data?.otp || '';
      if (newOtp) {
        sessionStorage.setItem('verify_otp', newOtp);
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
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={authHeadingSx}>
          Verify your account
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter the One-Time Password (OTP) sent to{email ? ` ${email}` : ' your email'} to continue setting up your account.
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
        <Stack spacing={3} sx={authFieldSx}>
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
                <Link
                  component="button"
                  type="button"
                  variant="subtitle2"
                  onClick={handleResendOtp}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend'}
                </Link>
              )}
            </Stack>
          </Box>

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Verifying..."
          >
            Verify account
          </LoadingButton>
        </Stack>
      </Form>
    </>
  );
}
