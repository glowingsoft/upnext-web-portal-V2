import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslate } from 'src/locales/use-locales';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { useChangePasswordMutation } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

export function AccountChangePassword() {
  const { t } = useTranslate();
  const showOldPassword = useBoolean();
  const showNewPassword = useBoolean();
  const showConfirmPassword = useBoolean();
  const [changePassword] = useChangePasswordMutation();

  const ChangePassWordSchema = zod
    .object({
      oldPassword: zod
        .string()
        .min(1, { message: t('passwordIsRequired') })
        .min(6, { message: t('passwordMustBeAtLeast6Characters') }),
      newPassword: zod.string().min(1, { message: t('newPasswordIsRequired') }),
      confirmNewPassword: zod.string().min(1, { message: t('confirmPasswordIsRequired') }),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: t('newPasswordMustBeDifferentThanOldPassword'),
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmNewPassword'],
    });

  const defaultValues = { oldPassword: '', newPassword: '', confirmNewPassword: '' };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await changePassword({ currentPassword: data.oldPassword, newPassword: data.newPassword }).unwrap();
      reset();
      toast.success(t('updateSuccess'));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('failedToUpdatePassword'));
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="oldPassword"
          type={showOldPassword.value ? 'text' : 'password'}
          label={t('oldPassword')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showOldPassword.onToggle} edge="end">
                  <Iconify icon={showOldPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Field.Text
          name="newPassword"
          label={t('newPassword')}
          type={showNewPassword.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showNewPassword.onToggle} edge="end">
                  <Iconify icon={showNewPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> {t('passwordMustBeMinimum6Plus')}
            </Stack>
          }
        />

        <Field.Text
          name="confirmNewPassword"
          type={showConfirmPassword.value ? 'text' : 'password'}
          label={t('confirmNewPassword')}
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

        <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          {t('saveChanges')}
        </LoadingButton>
      </Card>
    </Form>
  );
}
