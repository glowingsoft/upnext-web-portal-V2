import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { usePublicFonts } from 'src/hooks/use-public-fonts';

import { useResendOtpEmailMutation } from 'src/store/Reducer/auth';
import { getPasswordResetSource, setPasswordResetEmail } from './password-reset-flow-storage';
import { authFieldSx, authHeadingSx } from './auth-form-styles';

// ----------------------------------------------------------------------

const ForgotPasswordSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function JwtForgetPasswordView() {
  usePublicFonts();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [sendOtp] = useResendOtpEmailMutation();
  const signInHref = getPasswordResetSource() === 'admin' ? paths.admin.login : paths.auth.jwt.signIn;

  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      const response = await sendOtp({ email: data.email }).unwrap();
      const devOtp = response?.data?.otp || '';
      if (devOtp) sessionStorage.setItem('reset_otp', devOtp);
      setPasswordResetEmail(data.email);
      router.push(paths.auth.jwt.verifyPassword);
    } catch (error) {
      setErrorMsg(error?.data?.message || error?.message || 'Failed to send OTP. Please try again.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={authHeadingSx}>
          Forgot your password?
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          Enter the email linked to your account and we will send you a one-time code (OTP) to reset it.
        </Typography>
      </Stack>

      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3} sx={authFieldSx}>
          <Field.Text name="email" label="Email address" placeholder="Enter your email" InputLabelProps={{ shrink: true }} />

          <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Sending OTP...">
            Send OTP
          </LoadingButton>

          <Link
            component={RouterLink}
            href={signInHref}
            variant="subtitle2"
            sx={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Iconify icon="mingcute:arrow-left-line" width={16} />
            Back to sign in
          </Link>
        </Stack>
      </Form>
    </>
  );
}
