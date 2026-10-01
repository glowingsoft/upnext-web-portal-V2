import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Form } from 'src/components/hook-form';
import { StepAccount } from './steps/step-account';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAccountSchema, createAccountDefaultValues } from './sign-up-schema';
import { getSignupFlowDraft, saveSignupFlowDraft, setSignupFlowStage, SIGNUP_FLOW_STAGE } from './signup-flow-storage';

const ACCOUNT_FIELDS = ['avatarUrl', 'fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'];

export function JwtSignUpView() {
  const router = useRouter();
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);

  const methods = useForm({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: createAccountDefaultValues,
  });

  const { setValue, getValues, trigger, reset } = methods;

  useEffect(() => {
    const draft = getSignupFlowDraft();

    if (draft) {
      reset({ ...createAccountDefaultValues, ...draft });
      setRole(draft.role || 'customer');
    }
  }, [reset]);

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setValue('role', nextRole, { shouldValidate: true });
    saveSignupFlowDraft({ role: nextRole });
  };

  const handleContinueToOtp = async () => {
    const valid = await trigger(ACCOUNT_FIELDS);
    if (!valid) return;

    setIsContinuing(true);
    try {
      const data = getValues();
      saveSignupFlowDraft({
        role: data.role || role,
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      setSignupFlowStage(SIGNUP_FLOW_STAGE.OTP);
      router.push(paths.auth.jwt.verifyAccount);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <>
      <Stack spacing={1} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h5">Create your account</Typography>
        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?
          </Typography>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            Sign in
          </Link>
        </Stack>
      </Stack>

      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      <Form methods={methods}>
        <Box sx={{ minHeight: { xs: 0, sm: 280 } }}>
          <StepAccount role={role} onRoleChange={handleRoleChange} />
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: { xs: 1.5, sm: 2 } }}>
          <LoadingButton variant="contained" color="primary" onClick={handleContinueToOtp} loading={isContinuing} loadingIndicator="Continuing…" sx={{ minWidth: 160 }}>
            Create Account
          </LoadingButton>
        </Stack>
      </Form>

      <Typography component="div" sx={{ mt: 2, textAlign: 'center', typography: 'caption', color: 'text.secondary' }}>
        {'By signing up, I agree to '}
        <Link underline="always" color="text.primary">
          Terms of service
        </Link>{' '}
        {' and '}
        <Link underline="always" color="text.primary">
          Privacy policy
        </Link>
        .
      </Typography>
    </>
  );
}
