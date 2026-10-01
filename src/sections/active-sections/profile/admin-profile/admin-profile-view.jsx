import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z as zod } from 'zod';

import { Field, Form } from 'src/components/hook-form';
import { useTranslate } from 'src/locales/use-locales';
import { toast } from 'src/components/snackbar';
import { fData } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { setUser } from 'src/store/slices/userSlice';
import { useGetAdminProfileQuery, useUpdateAdminProfileMutation, useUploadS3Mutation } from 'src/store/Reducer/auth';
import { TwoColGrid } from 'src/sections/auth/jwt/sign-up-components';
import { getApiLanguage } from 'src/utils/multi-lang-content';

// ----------------------------------------------------------------------

const MOCK_ADMIN = {
  avatarUrl: null,
  fullName: '',
  email: '',
};

function resolveAvatarUrl(profileIcon) {
  if (!profileIcon || /noimg|noimage/i.test(profileIcon)) return null;
  return normalizeImageUrl(profileIcon) || null;
}

// ----------------------------------------------------------------------

export default function AdminProfileView() {
  const { t, currentLang } = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const { data: profileData, isLoading: profileLoading } = useGetAdminProfileQuery(undefined, {
    skip: !user?.token,
  });
  const [updateAdminProfile] = useUpdateAdminProfileMutation();
  const [uploadS3] = useUploadS3Mutation();

  const AdminProfileSchema = zod.object({
    avatarUrl: zod.any().optional().nullable(),
    fullName: zod.string().min(1, { message: t('fullNameIsRequired') }),
    email: zod
      .string()
      .min(1, { message: t('emailIsRequired') })
      .email({ message: t('emailMustBeValid') }),
  });

  const defaultValues = useMemo(
    () => ({
      ...MOCK_ADMIN,
      fullName: user?.displayName || user?.basicInfo?.name || '',
      email: user?.email || user?.basicInfo?.email || '',
    }),
    [user]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AdminProfileSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const profile = profileData?.data;
    if (!profile) return;
    const info = profile.basicInfo || profile;
    reset({
      avatarUrl: resolveAvatarUrl(info.profileIcon),
      fullName: info.name || '',
      email: info.email || user?.email || user?.basicInfo?.email || '',
    });
  }, [profileData, reset, user]);

  const onSubmit = handleSubmit(async (data) => {
    try {

      let uploadedAvatarUrl = null;
      if (data.avatarUrl && typeof data.avatarUrl !== 'string') {
        const formData = new FormData();
        formData.append('files', data.avatarUrl);
        const res = await uploadS3(formData).unwrap();
        uploadedAvatarUrl = res?.data?.file || null;
      }

      await updateAdminProfile({
        name: data.fullName,
        language: getApiLanguage(currentLang.value),
        ...(uploadedAvatarUrl ? { profileIcon: uploadedAvatarUrl } : {}),
      }).unwrap();

      dispatch(
        setUser({
          ...user,
          basicInfo: {
            ...user?.basicInfo,
            name: data.fullName,
            profileIcon: uploadedAvatarUrl || user?.basicInfo?.profileIcon,
          },
        })
      );

      toast.success(t('profileUpdatedSuccessfully'));
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || t('somethingWentWrong'));
    }
  });

  if (profileLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 5, pb: 5, px: 3, textAlign: 'center' }}>
            <Stack alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={144} height={144} />
              <Skeleton variant="text" width="60%" />
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
                <Field.Text name="email" disabled label={t('emailAddress')} InputLabelProps={{ shrink: true }} />
              </TwoColGrid>

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
