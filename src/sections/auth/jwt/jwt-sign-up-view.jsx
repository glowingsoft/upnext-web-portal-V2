import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { useSignupMutation, useUploadS3Mutation } from 'src/store/Reducer/auth';
import { useBoolean } from 'src/hooks/use-boolean';
import { usePublicFonts } from 'src/hooks/use-public-fonts';
import { authFieldSx, authHeadingSx } from './auth-form-styles';
import { GoogleSignInButton } from './google-sign-in-button';
import { saveSignupFlowDraft, setSignupFlowStage, SIGNUP_FLOW_STAGE } from './sign-up/signup-flow-storage';
import { getFcmToken } from 'src/lib/firebase-messaging';

// ----------------------------------------------------------------------

const SignUpSchema = zod
  .object({
    profileIcon: zod.any().optional(),
    name: zod.string().min(1, { message: 'Full name is required!' }),
    email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
    phoneNumber: zod.string().min(1, { message: 'Phone number is required!' }),
    password: zod.string().min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Please confirm your password!' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  usePublicFonts();
  const router = useRouter();
  const [signup] = useSignupMutation();
  const [uploadS3] = useUploadS3Mutation();
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');

  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      profileIcon: null,
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    reset,
    watch,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isSubmitted },
  } = methods;

  const passwordValue = watch('password');
  useEffect(() => {
    if (isSubmitted) trigger('confirmPassword');
  }, [passwordValue, isSubmitted, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      let profileIcon;
      if (data.profileIcon instanceof File) {
        const formData = new FormData();
        formData.append('files', data.profileIcon);
        const uploadRes = await uploadS3(formData).unwrap();
        profileIcon = uploadRes?.data?.file;
      }

      const fcmToken = await getFcmToken();

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber ?? '',
        password: data.password,
        userType: role === 'provider' ? 'business' : 'user',
        deviceType: 'web',
        deviceId: fcmToken || 'web',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(profileIcon && { profileIcon }),
      };

      const response = await signup(payload).unwrap();

      const otp = response?.data?.otpInfo?.emailOtp?.otp;
      sessionStorage.setItem('verify_email', payload.email);
      if (otp) sessionStorage.setItem('verify_otp', otp);

      saveSignupFlowDraft({ role, email: payload.email, fullName: payload.name, phoneNumber: payload.phoneNumber });
      setSignupFlowStage(SIGNUP_FLOW_STAGE.OTP);

      toast.success('Account created! Please verify your email.');
      reset();
      router.push(paths.auth.jwt.verifyAccount);
    } catch (error) {
      setErrorMsg(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={authHeadingSx}>
          Create your account
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?
          </Typography>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            Sign in
          </Link>
        </Stack>
      </Stack>

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={1.5} sx={authFieldSx}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={role}
            onChange={(_, val) => { if (val) setRole(val); }}
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.25,
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              },
            }}
          >
            <ToggleButton value="customer">Customer</ToggleButton>
            <ToggleButton value="provider">Provider</ToggleButton>
          </ToggleButtonGroup>

          <GoogleSignInButton role={role} label="Sign up with Google" dividerAfter onError={setErrorMsg} />

          <Field.UploadAvatar
            name="profileIcon"
            sx={{
              width: 104,
              height: 104,
              p: 0.75,
              '& .upload-placeholder': { gap: 0.25 },
              '& .upload-placeholder .MuiTypography-root': { fontSize: 10, lineHeight: 1.2 },
              '& .upload-placeholder svg': { width: 24, height: 24 },
            }}
          />
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: 'text.disabled', mt: -0.5 }}
          >
            JPG, PNG or GIF, up to 3 MB
          </Typography>
          <Field.Text name="name" label="Full Name" InputLabelProps={{ shrink: true }} />
          <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />
          <Field.Phone name="phoneNumber" label="Phone number" />
          <Field.Text
            name="password"
            label="Password"
            type={showPassword.value ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Field.Text
            name="confirmPassword"
            label="Confirm password"
            type={showConfirmPassword.value ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showConfirmPassword.onToggle} edge="end">
                    <Iconify icon={showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Creating account..."
          >
            Create Account
          </LoadingButton>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', lineHeight: 1.7 }}>
            {'By creating an account, you agree to our '}
            <Link component={RouterLink} href={paths.terms} target="_blank" rel="noopener" variant="body2" sx={{ fontWeight: 700, color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>
              Terms &amp; Conditions
            </Link>
            {' and '}
            <Link component={RouterLink} href={paths.privacy} target="_blank" rel="noopener" variant="body2" sx={{ fontWeight: 700, color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>
              Privacy Policy
            </Link>
            .
          </Typography>
        </Stack>
      </Form>
    </>
  );
}
