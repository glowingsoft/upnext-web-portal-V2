import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useDispatch, useSelector } from 'react-redux';

import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { fData } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { setUser } from 'src/store/slices/userSlice';
import { useTranslate } from 'src/locales/use-locales';
import { useGetUserProfileQuery, useLazyGetUserProfileQuery, useUpdateUserProfileMutation, useUploadS3Mutation } from 'src/store/Reducer/auth';

import { TwoColGrid } from 'src/sections/auth/jwt/sign-up-components';
import { TwoFactorAuthToggle } from '../components/two-factor-auth-toggle';

// ----------------------------------------------------------------------

const createProviderProfileSchema = (t) =>
  zod.object({
    avatarUrl: zod.any().optional().nullable(),
    fullName: zod.string().min(1, { message: t('fullNameIsRequired') }),
    email: zod.string().optional(),
    phoneNumber: zod.string().optional(),
  });

// ----------------------------------------------------------------------

export default function ProviderProfileView() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [errorMsg, setErrorMsg] = useState('');
  const ProviderProfileSchema = useMemo(() => createProviderProfileSchema(t), [t]);

  const { data: profileData, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
    skip: !user?.token,
  });
  const [fetchUserProfile] = useLazyGetUserProfileQuery();
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [uploadS3] = useUploadS3Mutation();

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ProviderProfileSchema),
    defaultValues: { avatarUrl: null, fullName: '', email: '', phoneNumber: '' },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    const profile = profileData?.data;
    if (!profile) return;
    const info = profile.basicInfo || {};
    reset({
      avatarUrl: normalizeImageUrl(info.profileIcon) || null,
      fullName: info.name || '',
      email: info.email || '',
      phoneNumber: info.phoneNumber || '',
    });
  }, [profileData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      // Only include profileIcon when a new file was actually picked — data.avatarUrl
      // is already a string whenever the user didn't touch the avatar (pre-filled from
      // the existing saved value), and resending it unconditionally would re-persist
      // whatever's already stored, including any legacy double-prefixed URL, forever.
      let uploadedAvatarUrl = null;
      if (data.avatarUrl && typeof data.avatarUrl !== 'string') {
        const formData = new FormData();
        formData.append('files', data.avatarUrl);
        const res = await uploadS3(formData).unwrap();
        uploadedAvatarUrl = res?.data?.file || null;
      }

      await updateUserProfile({
        name: data.fullName,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(uploadedAvatarUrl ? { profileIcon: uploadedAvatarUrl } : {}),
      }).unwrap();

      const res = await fetchUserProfile().unwrap();
      if (res?.data) {
        dispatch(setUser({ ...res.data, token: user?.token, refreshToken: user?.refreshToken, permission: user?.permission }));
      }

      toast.success(t('profileUpdatedSuccessfully'));
    } catch (error) {
      setErrorMsg(error?.data?.message || error?.message || t('somethingWentWrong'));
    }
  });

  if (profileLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 5, pb: 5, px: 3, textAlign: 'center' }}>
            <Stack alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={144} height={144} />
              <Skeleton variant="text" width={180} height={20} />
              <Skeleton variant="text" width={140} height={20} />
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" height={56} sx={{ flex: 1, borderRadius: 1.5 }} />
                <Skeleton variant="rounded" height={56} sx={{ flex: 1, borderRadius: 1.5 }} />
              </Stack>
              <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
              <Stack direction="row" justifyContent="flex-end">
                <Skeleton variant="rounded" width={130} height={42} sx={{ borderRadius: 1.5 }} />
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 5, pb: 5, px: 3, textAlign: 'center' }}>
            <Field.UploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              helperText={
                <Typography variant="caption" sx={{ mt: 3, mx: 'auto', display: 'block', textAlign: 'center', color: 'text.disabled' }}>
                  {t('allowedImageFormats')}
                  <br />
                  {t('maxSizeOf')} {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TwoColGrid>
                <Field.Text name="fullName" label={t('fullName')} InputLabelProps={{ shrink: true }} />
                <Field.Text name="email" label={t('emailAddress')} InputLabelProps={{ shrink: true }} disabled />
                <Field.Phone name="phoneNumber" label={t('phoneNumber')} country="US" />
              </TwoColGrid>

              <Divider />

              <TwoFactorAuthToggle profileData={profileData} />

              <Stack direction="row" justifyContent="flex-end">
                <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} loadingIndicator={t('saving')}>
                  {t('saveChanges')}
                </LoadingButton>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
