import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { usePublicFonts } from 'src/hooks/use-public-fonts';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useDispatch } from 'react-redux';
import { setPasswordResetSource } from './password-reset-flow-storage';
import { goToPostLogin } from './auth-redirect-storage';
import { authFieldSx, authHeadingSx } from './auth-form-styles';
import { GoogleSignInButton } from './google-sign-in-button';
import { useLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { getFcmToken } from 'src/lib/firebase-messaging';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  usePublicFonts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [login] = useLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState(searchParams.get('role') === 'provider' ? 'provider' : 'customer');

  const password = useBoolean();
  const signUpHref = paths.auth.jwt.signUp;

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const goTo = (permission, userType, profile) => goToPostLogin(router, paths, permission, userType, profile);

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    const email = data.email.trim().toLowerCase();

    const fcmToken = await getFcmToken();

    const payload = {
      email,
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userType: role === 'provider' ? 'business' : 'user',
      deviceType: 'web',
      deviceId: fcmToken || 'web',
      language: 'en',
    };

    try {
      const response = await login(payload).unwrap();

      if (!response.data) {
        setErrorMsg('Login failed: No user data received.');
        return;
      }

      const user = response.data;

      if (user?.requiresTwoFactor) {
        sessionStorage.setItem('login_2fa_email', user.email || email);
        sessionStorage.setItem('login_2fa_otp', user.otp || '');
        router.push(paths.auth.jwt.verifyLoginOtp);
        return;
      }

      if (!user?.accountState?.status) {
        setErrorMsg('Your account is inactive. Please contact support.');
        return;
      }

      if (['user', 'customer'].includes(user?.accountState?.userType) && user?.profile?.status && user.profile.status !== 'active') {
        setErrorMsg('Your profile is not active. Please contact support.');
        return;
      }

      let permission = 2;
      if (user?.accountState?.userType === 'admin' || user?.accountState?.userType === 'subadmin') {
        permission = 1;
      }

      dispatch(setUser({ ...user, permission }));
      goTo(permission, user?.accountState?.userType, user?.profile);
      reset();
    } catch (error) {
      if (error?.status === 401 && error?.data?.data?.otp) {
        setErrorMsg(error.data.message || 'Please verify your email first.');
        sessionStorage.setItem('verify_email', email);
        sessionStorage.setItem('verify_otp', error.data.data.otp);
        router.push(paths.auth.jwt.verifyAccount);
        return;
      }
      const raw = error?.data?.message || error?.message;
      setErrorMsg(typeof raw === 'string' ? raw : 'Something went wrong. Please try again.');
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 4 }}>
      <Typography variant="h4" sx={authHeadingSx}>
        Sign in to your account
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`Don't have an account?`}
        </Typography>

        <Link component={RouterLink} href={signUpHref} variant="subtitle2">
          Get started
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3} sx={authFieldSx}>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={role}
        onChange={(_, val) => {
          if (val) setRole(val);
        }}
        sx={{
          mb: 1,
          '& .MuiToggleButton-root': {
            py: 1.25,
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

      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
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

        <Link
          component={RouterLink}
          href={paths.auth.jwt.forgetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
          onClick={() => setPasswordResetSource('user')}
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Sign in...">
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <GoogleSignInButton role={role} onError={setErrorMsg} />
    </>
  );
}
