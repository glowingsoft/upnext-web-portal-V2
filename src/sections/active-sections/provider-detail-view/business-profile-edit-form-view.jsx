import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { Upload } from 'src/components/upload';
import { useTranslate } from 'src/locales/use-locales';

import { useSelector } from 'react-redux';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import {
  useGetUserProfileQuery,
  useSetBusinessProfileMutation,
  useSuggestBusinessDescriptionMutation,
  useUpdateBusinessCertificationsMutation,
  useUploadS3Mutation,
} from 'src/store/Reducer/auth';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { BadgeSelect } from 'src/sections/auth/jwt/sign-up/components/badge-select';
import { CategoriesMultiSelect } from 'src/sections/auth/jwt/sign-up/components/categories-multi-select';
import { TagsMultiSelect } from 'src/sections/active-sections/provider-detail-view/components/tags-multi-select';
import { SkillsField } from 'src/sections/auth/jwt/sign-up/steps/step-provider-profile';
import { RegistrationDocumentsField } from 'src/sections/active-sections/provider-view/components/registration-documents-field';

// ----------------------------------------------------------------------

const createEditBusinessProfileSchema = (t) =>
  zod
    .object({
      businessImage: zod.any().optional(),
      businessCoverImage: zod.any().optional(),
      businessName: zod.string().min(1, t('businessNameIsRequired')),
      businessType: zod.enum(['solo', 'team']).default('solo'),
      businessSize: zod.union([zod.string(), zod.number()]).optional(),
      experience: zod.union([zod.string(), zod.number()]).optional(),
      location: zod.string().min(1, t('locationIsRequired')),
      categories: zod.array(zod.any()).min(1, t('selectAtLeastOneCategory')),
      tags: zod.array(zod.any()).optional().default([]),
      description: zod.string().min(1, t('descriptionIsRequired')).max(1000),
      certifications: zod.any().nullable().optional(),
      skills: zod.array(zod.string()).default([]),
      instagram: zod.string().optional(),
      facebook: zod.string().optional(),
      linkedin: zod.string().optional(),
      website: zod.string().optional(),
    })
    .passthrough();

const BUSINESS_BADGE_NAME_TO_KEY = {
  'Accessibility & Inclusivity': 'accessibilityInclusivity',
  'Hair Specialties': 'hairSpecialties',
  'Nail Specialties': 'nailSpecialties',
  'Skin & Wellness': 'skinWellness',
  'Service Style & Availability': 'serviceStyleAvailability',
  'Experience & Background': 'experienceBackground',
  'Business & Safety': 'businessSafety',
  'Preferred Category': 'preferredCategory',
  'Preferred Service Type': 'preferredServiceType',
};

const SKIP_BADGE_NAMES = ['Certifications & Licensing'];

const extractNumberValue = (value) => {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : '';
};

const toCategory = (cat, index, names) => {
  if (typeof cat === 'string') return { _id: cat, name: (names || [])[index] || '' };
  return cat;
};

function resolveCertificationValue(certificationBadge, storedCertification) {
  if (!certificationBadge || !storedCertification) return null;

  const storedLabel = storedCertification.optionName || storedCertification.name;
  if (!storedLabel) return null;

  const matchedOption = (certificationBadge.options || []).find(
    (opt) => (opt.translations?.en || opt.name) === storedLabel
  );
  if (!matchedOption) return null;

  return {
    badgeId: certificationBadge._id,
    optionId: matchedOption._id,
    badgeName: certificationBadge.translations?.en || certificationBadge.name || '',
    optionName: matchedOption.translations?.en || matchedOption.name || '',
  };
}


const toDocumentFile = (url, index) => ({
  id: url || `existing-${index}`,
  name: String(url || '').split('/').pop() || `Document ${index + 1}`,
  type: '',
  url,
});

function SectionHeader({ title }) {
  return (
    <Box sx={{ mt: 1, mb: 0.5, gridColumn: '1 / -1' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function BusinessProfileEditFormView() {
  const { t } = useTranslate();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const EditBusinessProfileSchema = useMemo(() => createEditBusinessProfileSchema(t), [t]);

  const { data: profileData, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
    skip: !user?.token,
  });

  const { data: badgesData, isLoading: badgesLoading } = useGetBadgesQuery({ scope: 'business' });

  const [setBusinessProfile] = useSetBusinessProfileMutation();
  const [updateBusinessCertifications] = useUpdateBusinessCertificationsMutation();
  const [uploadS3] = useUploadS3Mutation();
  const [suggestBusinessDescription, { isLoading: isSuggestingDescription }] = useSuggestBusinessDescriptionMutation();

  const profile = profileData?.data?.profile;
  const basicInfo = profileData?.data?.basicInfo;
  const [coverImage, setCoverImage] = useState(null);

  const badges = (badgesData?.data || []).filter(
    (b) => !SKIP_BADGE_NAMES.includes(b?.translations?.en || b?.name || '')
  );
  const certificationBadge = (badgesData?.data || []).find(
    (b) => (b?.translations?.en || b?.name || '') === 'Certifications & Licensing'
  );

  const categoryPreloads = (profile?.categories || []).map((cat, i) =>
    toCategory(cat, i, profile?.categoryNames)
  );

  const methods = useForm({
    resolver: zodResolver(EditBusinessProfileSchema),
    defaultValues: {
      businessImage: null,
      businessCoverImage: null,
      businessName: '',
      businessType: 'solo',
      businessSize: '',
      experience: '',
      location: '',
      categories: [],
      tags: [],
      description: '',
      certifications: null,
      skills: [],
      instagram: '',
      facebook: '',
      linkedin: '',
      website: '',
    },
  });

  const { watch, handleSubmit, reset, setValue, setError, clearErrors, formState: { isSubmitting, errors } } = methods;
  const description = watch('description') || '';
  const savedCertification = watch('certifications');
  const businessType = watch('businessType');
  const businessNameValue = watch('businessName') || '';
  const skillsValue = watch('skills') || [];
  const selectedCategories = watch('categories') || [];
  const selectedCategoryIds = selectedCategories.map((cat) => cat?._id || cat).filter(Boolean);
  const selectedCategoryNames = selectedCategories.map((cat) => cat?.name).filter(Boolean);
  const selectedTags = watch('tags') || [];
  const selectedTagNames = selectedTags.map((tag) => tag?.name).filter(Boolean);

  const [certificationFiles, setCertificationFiles] = useState([]);
  const certificationObjectUrlsRef = useRef([]);
  const [locationCoords, setLocationCoords] = useState(null);
  const [descriptionSuggestion, setDescriptionSuggestion] = useState(null);

  const readyForDescriptionAi = Boolean(businessNameValue.trim() && selectedCategoryNames.length > 0);

  useEffect(() => {
    setDescriptionSuggestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessNameValue, selectedCategoryNames.join(','), selectedTagNames.join(','), skillsValue.join(','), description]);

  const handleSuggestDescription = async () => {
    try {
      const payload = {
        businessName: businessNameValue.trim(),
        categories: selectedCategoryNames,
        skills: skillsValue,
        ...(selectedTagNames.length ? { tags: selectedTagNames } : {}),
      };
      const response = await suggestBusinessDescription(payload).unwrap();
      setDescriptionSuggestion(response?.data?.description || null);
    } catch (submitError) {
      toast.error(submitError?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleApplyDescriptionSuggestion = () => {
    if (!descriptionSuggestion) return;
    setValue('description', descriptionSuggestion, { shouldValidate: true, shouldDirty: true });
    setDescriptionSuggestion(null);
  };

  useEffect(() => {
    if (!profile) return;

    reset({
      businessImage: (profile?.image && !profile.image.includes('noimg'))
        ? normalizeImageUrl(profile.image)
        : null,
      businessName: profile.businessName || '',
      businessType: profile.businessType || 'solo',
      businessSize: extractNumberValue(profile.teamSize),
      experience: extractNumberValue(profile.yearsOfExperience),
      location: profile.location?.address || '',
      categories: (profile.categories || []).map((cat, i) =>
        toCategory(cat, i, profile.categoryNames)
      ),
      tags: (profile.tags || []).map((tag, i) => toCategory(tag, i, profile.tagNames)),
      description: profile.description || '',
      certifications: resolveCertificationValue(certificationBadge, profile.certifications),
      skills: profile.skills || [],
      instagram: profile.socialLinks?.instagram || '',
      facebook: profile.socialLinks?.facebook || '',
      linkedin: profile.socialLinks?.linkedin || '',
      website: profile.socialLinks?.website || '',
    });

    setCoverImage(
      (profile.coverImage && !profile.coverImage.includes('noimg')) ? normalizeImageUrl(profile.coverImage) : null
    );

    setCertificationFiles((profile.certifications?.files || []).map(toDocumentFile));

    // GeoJSON coordinate order is [lng, lat]; [0, 0] is a placeholder default, not a real point.
    const [lng, lat] = profile.location?.coordinates || [];
    setLocationCoords(lng || lat ? { lat, lng } : null);
  }, [profile, basicInfo, reset]);

  useEffect(
    () => () => {
      certificationObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      certificationObjectUrlsRef.current = [];
    },
    []
  );

  const handleUploadCertificationFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const nextFiles = selectedFiles.map((file, index) => {
      const url = URL.createObjectURL(file);
      certificationObjectUrlsRef.current.push(url);

      return {
        id: `cert-${Date.now()}-${index}-${file.name}-${file.size}`,
        name: file.name,
        type: file.type || 'Uploaded file',
        url,
        file,
        isObjectUrl: true,
      };
    });

    setCertificationFiles((current) => [...current, ...nextFiles]);
    clearErrors('certificationFile');
    event.target.value = '';
  };

  const handleDeleteCertificationFile = (fileId) => {
    setCertificationFiles((current) => {
      const removed = current.find((file) => file.id === fileId);
      if (removed?.isObjectUrl) {
        URL.revokeObjectURL(removed.url);
        certificationObjectUrlsRef.current = certificationObjectUrlsRef.current.filter((url) => url !== removed.url);
      }
      return current.filter((file) => file.id !== fileId);
    });
  };

  // Pre-populate badge fields once both profile and badges are loaded
  useEffect(() => {
    if (!profile?.badges || !badges.length) return;

    badges.forEach((badge) => {
      const badgeName = badge?.translations?.en || badge?.name || '';
      const profileKey = BUSINESS_BADGE_NAME_TO_KEY[badgeName];
      if (!profileKey) return;
      const savedValue = profile.badges[profileKey];
      if (savedValue) {
        setValue(`badge_${badge._id}`, savedValue, { shouldDirty: false });
      }
    });
  }, [profile, badges, setValue]);

  const handleCancel = () => router.push(paths.dashboard.businessProfile);

  const handleFormSubmit = handleSubmit(async (data) => {
    if (data.certifications && certificationFiles.length === 0) {
      setError('certificationFile', { type: 'manual', message: t('pleaseUploadProofOfLicenseBeforeSaving') });
      return;
    }

    try {
      const uploadFile = async (file) => {
        if (!file || typeof file === 'string') return file || null;
        const formData = new FormData();
        formData.append('files', file);
        const res = await uploadS3(formData).unwrap();
        return res?.data?.file || null;
      };

      const uploadedCoverImage = typeof coverImage === 'string'
        ? coverImage
        : await uploadFile(coverImage);

      const [image] = await Promise.all([uploadFile(data.businessImage)]);

      const badgesPayload = {};
      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith('badge_') || !value) return;
        const payloadKey = BUSINESS_BADGE_NAME_TO_KEY[value?.badgeName];
        if (payloadKey) badgesPayload[payloadKey] = value;
      });

      const uploadedCertificationFiles = (
        await Promise.all(
          certificationFiles.map(async (file) => {
            if (!file.isObjectUrl) return file.url;
            const formData = new FormData();
            formData.append('files', file.file);
            const res = await uploadS3(formData).unwrap();
            return res?.data?.file || null;
          })
        )
      ).filter(Boolean);

      const payload = {
        businessName: data.businessName,
        image: image || '',
        coverImage: uploadedCoverImage || '',
        isAvailable: 'true',
        categories: (data.categories || []).map((c) => c._id),
        tags: (data.tags || []).map((tag) => tag._id || tag),
        skills: data.skills || [],
        location: {
          address: data.location,
          type: 'Point',
          coordinates: locationCoords ? [locationCoords.lng, locationCoords.lat] : [0, 0],
        },
        businessType: data.businessType || 'solo',
        teamSize: Number(data.businessSize) || 1,
        yearsOfExperience: Number(data.experience) || 0,
        description: data.description,
        badges: badgesPayload,
        socialLinks: {
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
          website: data.website || '',
        },
      };

      await setBusinessProfile(payload).unwrap();

      if (data.certifications) {
        await updateBusinessCertifications({
          badgeId: data.certifications.badgeId,
          optionId: data.certifications.optionId,
          files: uploadedCertificationFiles,
        }).unwrap();
      }

      toast.success(t('businessProfileUpdatedSuccessfully'));
      router.push(paths.dashboard.businessProfile);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('somethingWentWrongTryAgain'));
    }
  });

  if (profileLoading || badgesLoading) {
    return (
      <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        {/* Breadcrumbs skeleton */}
        <Skeleton variant="text" width={180} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={280} height={24} sx={{ mb: 5 }} />

        <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto', width: '100%' }}>
          {/* Avatar skeleton */}
          <Stack alignItems="center" sx={{ mb: 5 }}>
            <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="circular" width={128} height={128} />
          </Stack>

          {/* Cover image skeleton */}
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="100%" height={280} sx={{ borderRadius: 2, mb: 5 }} />

          {/* Form fields grid skeleton */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            rowGap={3}
            columnGap={2}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
            ))}
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }} />
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }} />

            {/* Section header */}
            <Skeleton variant="text" width={160} height={28} sx={{ gridColumn: '1 / -1' }} />
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />

            {/* Specialties section */}
            <Skeleton variant="text" width={200} height={28} sx={{ gridColumn: '1 / -1' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
            ))}

            {/* Social links section */}
            <Skeleton variant="text" width={140} height={28} sx={{ gridColumn: '1 / -1' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>

          {/* Action buttons skeleton */}
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
            <Skeleton variant="rounded" width={90} height={42} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" width={130} height={42} sx={{ borderRadius: 1.5 }} />
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('editBusiness')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('businessProfile'), href: paths.dashboard.businessProfile },
          { name: profile?.businessName || t('edit') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
          <Stack spacing={3} sx={{ mb: 5, pt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
                {t('profilePhoto')}
              </Typography>
              <Field.UploadAvatar name="businessImage" accept={{ 'image/*': [] }} />
            </Box>
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('coverPhoto')}
            </Typography>
            <Upload
              value={coverImage}
              accept={{ 'image/*': [] }}
              onDrop={(files) => setCoverImage(files[0] || null)}
              onDelete={() => setCoverImage(null)}
              sx={{ mb: 5, '& > div': { height: 280, p: 0 } }}
            />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="businessName" label={t('businessName')} placeholder={t('enterBusinessName')} />
            <Field.Select name="businessType" label={t('businessType')}>
              <MenuItem value="solo">{t('solo')}</MenuItem>
              <MenuItem value="team">{t('team')}</MenuItem>
            </Field.Select>
            <Field.AddressAutocomplete
              name="location"
              label={t('location')}
              placeholder={t('mainStreetPlaceholder')}
              onPlaceSelected={({ lat, lng }) => setLocationCoords({ lat, lng })}
            />
            {businessType === 'team' && (
              <Field.Text name="businessSize" label={t('teamSize')} type="number" placeholder={t('numberOfTeamMembers')} />
            )}
            <Field.Text name="experience" label={t('yearsOfExperience')} type="number" placeholder={t('yearsOfExperiencePlaceholder')} />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <CategoriesMultiSelect
                name="categories"
                label={t('categories')}
                preloadValues={categoryPreloads}
                scope="business"
                tags
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <TagsMultiSelect name="tags" label={t('tags')} categoryIds={selectedCategoryIds} />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Text
                name="description"
                label={t('description')}
                placeholder={t('describeYourBusinessInFewWords')}
                multiline
                rows={4}
                inputProps={{ maxLength: 1000 }}
                helperText={`${description.length} / 1000`}
                FormHelperTextProps={{ sx: { mx: 0, textAlign: 'right' } }}
                InputProps={{
                  endAdornment: readyForDescriptionAi ? (
                    <Tooltip title={t('askAiSuggestDescription', { defaultValue: 'Ask AI to Suggest Description' })}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={isSuggestingDescription}
                          onClick={handleSuggestDescription}
                          sx={{ color: 'primary.main', alignSelf: 'flex-start' }}
                        >
                          {isSuggestingDescription ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Iconify icon="mingcute:ai-fill" width={19} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : undefined,
                }}
              />

              {!readyForDescriptionAi && (
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                  {t('descriptionAiLockedHint', { defaultValue: 'Enter a business name and select a category to enable AI suggestions' })}
                </Typography>
              )}

              {descriptionSuggestion && (
                <Alert
                  severity="info"
                  sx={{ mt: 1.5 }}
                  action={
                    <Button color="inherit" size="small" onClick={handleApplyDescriptionSuggestion}>
                      {t('useThisCategory', { defaultValue: 'Use This' })}
                    </Button>
                  }
                >
                  {descriptionSuggestion}
                </Alert>
              )}
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <SkillsField />
            </Box>

            <SectionHeader title={t('certifications')} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <BadgeSelect fieldName="certifications" badge={certificationBadge} />
            </Box>

            {savedCertification && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <RegistrationDocumentsField
                  files={certificationFiles}
                  onDelete={handleDeleteCertificationFile}
                  onUpload={handleUploadCertificationFiles}
                  title={t('uploadProofOfLicense')}
                  error={errors.certificationFile?.message}
                />
              </Box>
            )}

            <SectionHeader title={t('specialtiesAndStyle')} />
            {badges.map((badge) => (
              <BadgeSelect key={badge._id} fieldName={`badge_${badge._id}`} badge={badge} />
            ))}

            <SectionHeader title={t('socialLinks')} />
            <Field.Text name="instagram" label={t('instagram')} placeholder="https://instagram.com/yourusername" />
            <Field.Text name="facebook" label={t('facebook')} placeholder="https://facebook.com/yourpage" />
            <Field.Text name="linkedin" label={t('linkedin')} placeholder="https://linkedin.com/in/yourprofile" />
            <Field.Text name="website" label={t('website')} placeholder="https://yourwebsite.com" />
          </Box>

          <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                {t('saveChanges')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Card>
      </Form>
    </DashboardContent>
  );
}
