import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useDispatch, useSelector } from 'react-redux';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { fData } from 'src/utils/format-number';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { setUser } from 'src/store/slices/userSlice';
import { useTranslate } from 'src/locales/use-locales';
import { useGetUserProfileQuery, useCompleteUserProfileMutation, useLazyGetUserProfileQuery, useUploadS3Mutation } from 'src/store/Reducer/auth';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { BadgeSelect } from 'src/sections/auth/jwt/sign-up/components/badge-select';
import { BadgeMultiSelect } from 'src/sections/auth/jwt/sign-up/components/badge-multi-select';
import { CategoriesMultiSelect } from 'src/sections/auth/jwt/sign-up/components/categories-multi-select';
import { TwoFactorAuthToggle } from '../components/two-factor-auth-toggle';

// ----------------------------------------------------------------------

const MULTI_SELECT_BADGE_NAMES = ['Service Preferences'];

const getBadgeEnName = (b) => b?.translations?.en || b?.name || '';
const badgeFieldName = (b) => `badge_${b._id}`;


const CUSTOMER_BADGE_NAME_TO_KEY = {
  'Accessibility & Inclusivity': 'accessibilityInclusivity',
  'Service Preferences': 'servicePreference',
  'Preferred Service Type': 'preferredServiceType',
  'Preferred Booking Time': 'preferredBookingTime',
  'When Do You Usually Book?': 'bookingStyle',
  'How Far Are You Willing To Travel?': 'travelDistance',
  'How Often Do You Book Services?': 'bookingFrequency',
};

const createProfileEditSchema = (t) =>
  zod
    .object({
      avatarUrl: zod.any().nullable().optional(),
      fullName: zod.string().min(1, { message: t('fullNameIsRequired') }),
      phoneNumber: zod
        .string()
        .min(1, { message: t('phoneNumberIsRequired') })
        .refine((val) => !val || isValidPhoneNumber(val), { message: t('invalidPhoneNumber') }),
      locationAddress: zod.string().min(1, { message: t('locationIsRequired') }),
      categories: zod.array(zod.any()).optional().default([]),
      description: zod.string().max(200).optional().default(''),
    })
    .passthrough();

// ----------------------------------------------------------------------

export default function CustomerProfileView() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const ProfileEditSchema = useMemo(() => createProfileEditSchema(t), [t]);

  const { data: profileData, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
    skip: !user?.token,
  });
  const [fetchUserProfile] = useLazyGetUserProfileQuery();
  const [completeUserProfile] = useCompleteUserProfileMutation();
  const [uploadS3] = useUploadS3Mutation();

  const { data: badgesData, isLoading: badgesLoading } = useGetBadgesQuery({ scope: 'user' });

  const allBadges = Array.isArray(badgesData?.data)
    ? badgesData.data
    : (badgesData?.data?.docs ?? badgesData?.data?.data ?? []);

  const userBadges = [...allBadges].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const preferredServiceTypeBadge = userBadges.find((b) => getBadgeEnName(b) === 'Preferred Service Type');
  const otherBadges = userBadges.filter((b) => getBadgeEnName(b) !== 'Preferred Service Type');

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ProfileEditSchema),
    defaultValues: {
      avatarUrl: null,
      fullName: '',
      phoneNumber: '',
      locationAddress: '',
      categories: [],
      description: '',
    },
  });

  const { reset, handleSubmit, watch, formState: { isSubmitting } } = methods;

  const categoriesValue = watch('categories');
  const [locationCoords, setLocationCoords] = useState(null);

  // Populate form when profile data arrives
  useEffect(() => {
    if (!profileData?.data) return;
    const { basicInfo, profile } = profileData.data;
    const savedBadges = profile?.badges || {};

    const badgeDefaults = {};
    allBadges.forEach((badge) => {
      const payloadKey = CUSTOMER_BADGE_NAME_TO_KEY[getBadgeEnName(badge)];
      if (!payloadKey) return;
      const saved = savedBadges[payloadKey];
      if (!saved) return;
      const isMulti = MULTI_SELECT_BADGE_NAMES.includes(getBadgeEnName(badge));
      badgeDefaults[badgeFieldName(badge)] = isMulti
        ? (Array.isArray(saved) ? saved : [saved])
        : saved;
    });
    const rawCats = profile?.categories || [];
    const rawCatNames = profile?.categoryNames || [];
    const categories = profile?.category?.length
      ? profile.category.map((c) => ({ _id: c._id, name: c.name }))
      : rawCats.map((c, index) => (typeof c === 'string' ? { _id: c, name: rawCatNames[index] || '' } : c));

    reset({
      avatarUrl: normalizeImageUrl(basicInfo?.profileIcon) || null,
      fullName: basicInfo?.name || '',
      phoneNumber: basicInfo?.phoneNumber || '',
      locationAddress: profile?.location?.address || '',
      categories,
      description: profile?.description || '',
      ...badgeDefaults,
    });

    // GeoJSON coordinate order is [lng, lat]; [0, 0] is a placeholder default, not a real point.
    const [lng, lat] = profile?.location?.coordinates || [];
    setLocationCoords(lng || lat ? { lat, lng } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, allBadges.length, reset]);

  const descriptionLength = watch('description')?.length || 0;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const badges = {};
      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith('badge_') || !value) return;
        const normalized = Array.isArray(value) ? value[0] : value;
        if (!normalized) return;
        const payloadKey = CUSTOMER_BADGE_NAME_TO_KEY[normalized?.badgeName];
        if (payloadKey) badges[payloadKey] = normalized;
      });

      // Only include profileIcon in the payload when a new file was actually picked —
      // data.avatarUrl is already a string whenever the user didn't touch the avatar
      // (it's pre-filled from the existing saved value), and resending that
      // unconditionally would re-persist whatever's already stored, including any
      // legacy double-prefixed URL, forever.
      let uploadedAvatarUrl = null;
      if (data.avatarUrl && typeof data.avatarUrl !== 'string') {
        const formData = new FormData();
        formData.append('files', data.avatarUrl);
        const res = await uploadS3(formData).unwrap();
        uploadedAvatarUrl = res?.data?.file || null;
      }

      const payload = {
        name: data.fullName,
        phoneNumber: data.phoneNumber,
        location: {
          type: 'Point',
          coordinates: locationCoords ? [locationCoords.lng, locationCoords.lat] : [0, 0],
          address: data.locationAddress,
        },
        description: data.description,
        categories: (data.categories || []).map((c) => c._id),
        badges,
        ...(uploadedAvatarUrl ? { profileIcon: uploadedAvatarUrl } : {}),
      };

      await completeUserProfile(payload).unwrap();

      try {
        const res = await fetchUserProfile().unwrap();
        if (res?.data) {
          dispatch(setUser({ ...res.data, token: user?.token, refreshToken: user?.refreshToken, permission: user?.permission }));
        }
      } catch (_) { }

      toast.success(t('profileUpdatedSuccessfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('somethingWentWrong'));
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
            <Stack spacing={2.25}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={2.25}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
                ))}
              </Box>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
              ))}
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 1.5 }} />
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={2.25}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
                ))}
              </Box>
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
      <Grid container spacing={3}>
        {/* Avatar */}
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

        {/* Fields */}
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {badgesLoading ? (
              <Stack spacing={2.25}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={2.25}>
                {/* Name + Phone */}
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={2.25}>
                  <Field.Text name="fullName" label={t('fullName')} InputLabelProps={{ shrink: true }} />
                  <Field.Phone name="phoneNumber" label={t('phoneNumber')} />
                </Box>

                {/* Location */}
                <Field.AddressAutocomplete
                  name="locationAddress"
                  label={t('location')}
                  InputLabelProps={{ shrink: true }}
                  onPlaceSelected={({ lat, lng }) => setLocationCoords({ lat, lng })}
                />

                {/* Description */}
                <Field.Text
                  name="description"
                  label={t('importantNoteQuestion')}
                  placeholder={t('describeInFewWords')}
                  multiline
                  rows={4}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ maxLength: 200 }}
                  helperText={`${descriptionLength} / 200`}
                  FormHelperTextProps={{ sx: { textAlign: 'right' } }}
                />

                {/* Preferred Category + Preferred Service Type */}
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={2.25}>
                  <CategoriesMultiSelect name="categories" label={t('preferredCategory')} preloadValues={categoriesValue} scope="user" />
                  {preferredServiceTypeBadge && (
                    <BadgeSelect fieldName={badgeFieldName(preferredServiceTypeBadge)} badge={preferredServiceTypeBadge} />
                  )}
                </Box>

                {/* Other badge preferences */}
                {otherBadges.length > 0 && (
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} columnGap={2} rowGap={2.25}>
                    {otherBadges.map((badge) =>
                      MULTI_SELECT_BADGE_NAMES.includes(getBadgeEnName(badge)) ? (
                        <BadgeMultiSelect key={badge._id} fieldName={badgeFieldName(badge)} badge={badge} />
                      ) : (
                        <BadgeSelect key={badge._id} fieldName={badgeFieldName(badge)} badge={badge} />
                      )
                    )}
                  </Box>
                )}

                <Divider />

                <TwoFactorAuthToggle profileData={profileData} />

                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} loadingIndicator={t('saving')}>
                    {t('saveChanges')}
                  </LoadingButton>
                </Stack>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
