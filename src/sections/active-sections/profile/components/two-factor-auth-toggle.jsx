import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { useToggleTwoFactorMutation } from 'src/store/Reducer/auth';
import { JwtOtpCodeFields } from 'src/sections/auth/jwt/jwt-otp-code-fields';
import { OtpVerifySchema } from 'src/sections/auth/jwt/otp-verify-schema';

// ----------------------------------------------------------------------
// Shared 2FA toggle + confirm dialogs — used on both customer and provider
// profile pages. Saved independently of the surrounding profile form:
//   enable  -> {enabled:true}                 -> OTP dialog -> {enabled:true, otp}
//   disable -> password dialog -> {enabled:false, currentPassword}  (no OTP step)

export function TwoFactorAuthToggle({ profileData }) {
  const { t } = useTranslate();
  const [toggleTwoFactor] = useToggleTwoFactorMutation();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [otpDialog, setOtpDialog] = useState({ open: false, pendingEnabled: false, email: '', submitting: false });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, password: '', error: '', submitting: false });

  const otpMethods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { otp: '' },
  });

  useEffect(() => {
    setTwoFactorEnabled(Boolean(profileData?.data?.security?.twoFactorEnabled));
  }, [profileData]);

  const handleToggleTwoFactor = async (event) => {
    const nextEnabled = event.target.checked;

    // Disabling requires the current password up front; enabling doesn't.
    if (!nextEnabled) {
      setPasswordDialog({ open: true, password: '', error: '', submitting: false });
      return;
    }

    setTwoFactorLoading(true);
    try {
      const res = await toggleTwoFactor({ enabled: true }).unwrap();
      otpMethods.reset({ otp: '' });
      setOtpDialog({ open: true, pendingEnabled: true, email: res?.data?.email || '', submitting: false });
      toast.success(res?.message || t('verificationCodeSentEmail'));
    } catch (error) {
      toast.error(error?.data?.message || t('failedToUpdateTwoFactorAuth'));
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog({ open: false, password: '', error: '', submitting: false });
  };

  const handleConfirmPassword = async () => {
    if (!passwordDialog.password.trim()) {
      setPasswordDialog((prev) => ({ ...prev, error: t('currentPasswordIsRequired') }));
      return;
    }

    setPasswordDialog((prev) => ({ ...prev, submitting: true, error: '' }));
    try {
      const res = await toggleTwoFactor({ enabled: false, currentPassword: passwordDialog.password }).unwrap();
      setTwoFactorEnabled(res?.data?.twoFactorEnabled ?? false);
      toast.success(res?.message || t('twoFactorAuthDisabledSuccessfully'));
      handleClosePasswordDialog();
    } catch (error) {
      setPasswordDialog((prev) => ({
        ...prev,
        submitting: false,
        error: error?.data?.message || t('incorrectPassword'),
      }));
    }
  };

  const handleCloseOtpDialog = () => {
    setOtpDialog({ open: false, pendingEnabled: false, email: '', submitting: false });
    otpMethods.reset({ otp: '' });
  };

  const handleVerifyTwoFactorOtp = otpMethods.handleSubmit(async (data) => {
    setOtpDialog((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await toggleTwoFactor({ enabled: otpDialog.pendingEnabled, otp: data.otp }).unwrap();
      setTwoFactorEnabled(res?.data?.twoFactorEnabled ?? otpDialog.pendingEnabled);
      toast.success(res?.message || t('twoFactorAuthEnabledSuccessfully'));
      handleCloseOtpDialog();
    } catch (error) {
      toast.error(error?.data?.message || t('invalidOrExpiredCode'));
      setOtpDialog((prev) => ({ ...prev, submitting: false }));
    }
  });

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.25}>
          <Typography variant="subtitle2">{t('twoFactorAuthentication')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('twoFactorAuthDescription')}
          </Typography>
        </Stack>
        <Switch
          checked={twoFactorEnabled}
          onChange={handleToggleTwoFactor}
          disabled={twoFactorLoading}
          color="primary"
        />
      </Stack>

      <Dialog open={passwordDialog.open} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('confirmYourPassword')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {t('enterPasswordToDisableTwoFactorAuth')}
          </Typography>
          <TextField
            fullWidth
            autoFocus
            type="password"
            label={t('currentPassword')}
            value={passwordDialog.password}
            error={!!passwordDialog.error}
            helperText={passwordDialog.error}
            onChange={(e) => setPasswordDialog((prev) => ({ ...prev, password: e.target.value, error: '' }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmPassword();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={passwordDialog.submitting}>
            {t('cancel')}
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={passwordDialog.submitting}
            onClick={handleConfirmPassword}
          >
            {t('continue')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={otpDialog.open} onClose={handleCloseOtpDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('verifyTwoFactorAuthentication')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {otpDialog.email
              ? t('verificationCodeSentToEmail', { email: otpDialog.email })
              : t('verificationCodeSentToYourEmail')}
          </Typography>
          <JwtOtpCodeFields control={otpMethods.control} name="otp" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOtpDialog} disabled={otpDialog.submitting}>
            {t('cancel')}
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={otpDialog.submitting}
            onClick={handleVerifyTwoFactorOtp}
          >
            {t('verify')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
