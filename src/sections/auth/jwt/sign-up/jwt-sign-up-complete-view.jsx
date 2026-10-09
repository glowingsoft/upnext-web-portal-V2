import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { setUser } from 'src/store/slices/userSlice';
import { SignOutButton } from 'src/layouts/components/sign-out-button';
import { usePublicFonts } from 'src/hooks/use-public-fonts';

import { consumeAuthRedirectPath, consumeAuthService, markLoginNavHandled } from '../auth-redirect-storage';
import { authFieldSx, authHeadingSx } from '../auth-form-styles';
import { CustomerProfileSchema, ProviderProfileSchema, customerProfileDefaultValues, providerProfileDefaultValues } from './sign-up-schema';
import { SignUpStepper } from './sign-up-stepper';
import { StepCustomerProfile } from './steps/step-customer-profile';
import { StepProviderProfile } from './steps/step-provider-profile';
import { StepProviderSocial } from './steps/step-provider-social';
import { StepProviderSpecialties } from './steps/step-provider-specialties';
import { clearSignupFlowStorage, getSignupFlowDraft, setSignupFlowStage, SIGNUP_FLOW_STAGE } from './signup-flow-storage';
import { useCompleteUserProfileMutation, useSetBusinessProfileMutation, useLazyGetUserProfileQuery, useUploadS3Mutation } from 'src/store/Reducer/auth';

const CUSTOMER_STEPS = [
  {
    label: 'Preferences',
    validateFields: ['locationAddress', 'categories', 'description'],
  },
  {
    label: 'Booking',
    validateFields: [], // badge fields are optional
  },
];

const PROVIDER_STEPS = [
  {
    label: 'Business',
    validateFields: ['businessImage', 'businessCoverImage', 'businessName', 'businessType', 'businessSize', 'experience'],
  },
  {
    label: 'Details',
    validateFields: ['location', 'categories', 'skills', 'description', 'certifications', 'certificationFile'],
  },
  {
    label: 'Specialties',
    validateFields: [],
  },
  {
    label: 'Social',
    validateFields: [],
  },
];

function renderStepContent(activeStep, role) {
  if (role === 'provider') {
    const components = [
      <StepProviderProfile key="provider-profile-step-1" step={0} />,
      <StepProviderProfile key="provider-profile-step-2" step={1} />,
      <StepProviderSpecialties key="provider-specialties" />,
      <StepProviderSocial key="provider-social" />,
    ];

    return components[activeStep] ?? null;
  }

  return <StepCustomerProfile step={activeStep} />;
}

export function JwtSignUpCompleteView() {
  usePublicFonts();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('customer');
  const [activeStep, setActiveStep] = useState(0);

  const [completeUserProfile] = useCompleteUserProfileMutation();
  const [setBusinessProfile] = useSetBusinessProfileMutation();
  const [fetchUserProfile] = useLazyGetUserProfileQuery();
  const [uploadS3] = useUploadS3Mutation();

  const steps = role === 'provider' ? PROVIDER_STEPS : CUSTOMER_STEPS;
  const isLastStep = activeStep === steps.length - 1;
  const canGoBack = activeStep > 0;

  const isCustomer = role === 'customer';

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(isCustomer ? CustomerProfileSchema : ProviderProfileSchema),
    defaultValues: isCustomer ? customerProfileDefaultValues : providerProfileDefaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { reset, trigger } = methods;

  useEffect(() => {
    const draft = getSignupFlowDraft();

    if (draft) {
      const draftRole = draft.role || 'customer';
      const defaults = draftRole === 'customer' ? customerProfileDefaultValues : providerProfileDefaultValues;
      reset({ ...defaults, ...draft });
      setRole(draftRole);
      setSignupFlowStage(SIGNUP_FLOW_STAGE.COMPLETE);
      return;
    }

    const accountUserType = user?.accountState?.userType;
    const derivedRole = accountUserType === 'business' || accountUserType === 'provider' ? 'provider' : 'customer';
    const defaults = derivedRole === 'customer' ? customerProfileDefaultValues : providerProfileDefaultValues;
    reset(defaults);
    setRole(derivedRole);
  }, [reset, user]);

  useEffect(() => {
    setActiveStep(0);
  }, [role]);

  const handleBack = () => {
    if (activeStep === 0) {
      setSignupFlowStage(SIGNUP_FLOW_STAGE.OTP);
      router.push(paths.auth.jwt.verifyAccount);
      return;
    }

    setActiveStep((currentStep) => currentStep - 1);
  };

  const handleNext = async () => {
    const fields = steps[activeStep]?.validateFields || [];
    const valid = fields.length ? await trigger(fields) : true;

    if (valid) {
      setActiveStep((currentStep) => currentStep + 1);
    }
  };

  const handleFinalSubmit = async () => {
    const fields = steps[activeStep]?.validateFields || [];
    const valid = fields.length ? await trigger(fields) : true;
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const data = methods.getValues();
      const draft = getSignupFlowDraft() || {};

      const uploadFile = async (file) => {
        if (!file || typeof file === 'string') return file || null;
        const formData = new FormData();
        formData.append('files', file);
        const res = await uploadS3(formData).unwrap();
        return res?.data?.file || null;
      };

      let payload;

      if (role === 'provider') {
        // Upload images in parallel
        const [image, coverImage, certFileUrl] = await Promise.all([
          uploadFile(data.businessImage),
          uploadFile(data.businessCoverImage),
          uploadFile(data.certificationFile),
        ]);

        // Map badge name → payload key for business badges
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

        const badges = {};
        Object.entries(data).forEach(([key, value]) => {
          if (!key.startsWith('badge_') || !value) return;
          const payloadKey = BUSINESS_BADGE_NAME_TO_KEY[value?.badgeName];
          if (payloadKey) badges[payloadKey] = value;
        });


        const DEFAULT_OPERATING_HOURS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
          dayOfWeek: day,
          isOpen: true,
          startTime: '09:00',
          endTime: '17:00',
          breaks: [],
        }));

        payload = {
          businessName: data.businessName,
          image: image || '',
          coverImage: coverImage || '',
          isAvailable: 'true',
          categories: (data.categories || []).map((c) => c._id),
          tags: (data.tags || []).map((tag) => tag._id || tag),
          skills: data.skills || [],
          location: {
            address: data.location,
            type: 'Point',
            coordinates: data.locationLat != null && data.locationLng != null ? [data.locationLng, data.locationLat] : [0, 0],
          },
          businessType: data.businessType || 'solo',
          teamSize: Number(data.businessSize) || 1,
          yearsOfExperience: Number(data.experience) || 0,
          description: data.description,
          certificationFiles: certFileUrl ? [certFileUrl] : [],
          ...(data.certifications?.badgeId ? { certificationBadgeId: data.certifications.badgeId } : {}),
          ...(data.certifications?.optionId ? { certificationOptionId: data.certifications.optionId } : {}),
          badges,
          operatingHours: DEFAULT_OPERATING_HOURS,
          socialLinks: {
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            linkedin: data.linkedin || '',
            website: data.website || '',
          },
        };
      } else {
        // Customer payload — keyed by badge name rather than id, since ids are only valid for the
        // environment/seed data they were read from (matches the business badge mapping above).
        const CUSTOMER_BADGE_NAME_TO_KEY = {
          'Accessibility & Inclusivity': 'accessibilityInclusivity',
          'Service Preferences': 'servicePreference',
          'Preferred Service Type': 'preferredServiceType',
          'Preferred Booking Time': 'preferredBookingTime',
          'When Do You Usually Book?': 'bookingStyle',
          'How Far Are You Willing To Travel?': 'travelDistance',
          'How Often Do You Book Services?': 'bookingFrequency',
        };

        const badges = {};
        Object.entries(data).forEach(([key, value]) => {
          if (!key.startsWith('badge_') || !value) return;
          const normalized = Array.isArray(value) ? value[0] : value;
          if (!normalized) return;
          const payloadKey = CUSTOMER_BADGE_NAME_TO_KEY[normalized?.badgeName];
          if (payloadKey) badges[payloadKey] = normalized;
        });

        payload = {
          location: {
            type: 'Point',
            coordinates: data.locationLat != null && data.locationLng != null ? [data.locationLng, data.locationLat] : [0, 0],
            address: data.locationAddress,
          },
          description: data.description,
          categories: (data.categories || []).map((c) => c._id),
          badges,
        };
      }

      await (role === 'provider' ? setBusinessProfile(payload) : completeUserProfile(payload)).unwrap();

      let freshUser = null;
      try {
        const profileRes = await fetchUserProfile().unwrap();
        freshUser = profileRes?.data;
      } catch (_) { }

      const mergedUser = {
        ...(freshUser || {}),
        basicInfo: freshUser?.basicInfo || {
          name: draft.fullName || '',
          email: draft.email || '',
          phoneNumber: draft.phoneNumber || '',
          profileIcon: draft.avatarUrl || '',
          language: 'en',
        },
        accountState: {
          ...(freshUser?.accountState || {
            userType: role === 'provider' ? 'business' : 'user',
            status: 'active',
          }),
          [role === 'provider' ? 'hasBusinessProfile' : 'hasUserProfile']: true,
        },
        token: user?.token,
        refreshToken: user?.refreshToken,
        permission: 2,
      };
      dispatch(setUser(mergedUser));

      toast.success('Profile setup complete!');
      clearSignupFlowStorage();

      const storedRedirectPath = consumeAuthRedirectPath();
      const storedService = consumeAuthService();
      markLoginNavHandled();

      if (role === 'customer') {
        router.push(
          storedRedirectPath || paths.dashboard.root,
          { state: { service: storedService } }
        );
      } else {
        router.push(paths.dashboard.root);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack spacing={1} sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={authHeadingSx}>
          {role === 'provider' ? 'Set up your business' : 'Set up your profile'}
        </Typography>
      </Stack>

      {errorMsg ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      ) : null}

      <Form methods={methods}>
        {steps.length > 1 ? <SignUpStepper steps={steps} activeStep={activeStep} /> : null}

        <Box sx={{ minHeight: 280, ...authFieldSx }}>{renderStepContent(activeStep, role)}</Box>

        <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 2, gap: 1.5 }}>
          <SignOutButton
            fullWidth={false}
            size="medium"
            variant="outlined"
            startIcon={<Iconify icon="solar:logout-2-bold" />}
          />

          <Box sx={{ flexGrow: 1 }} />

          {canGoBack ? (
            <Button variant="outlined" color="inherit" onClick={handleBack} sx={{ minWidth: 80 }}>
              Back
            </Button>
          ) : null}

          {isLastStep ? (
            <LoadingButton variant="contained" color="primary" loading={isSubmitting} onClick={handleFinalSubmit} loadingIndicator="Saving..." sx={{ minWidth: 120 }}>
              Continue
            </LoadingButton>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext} sx={{ minWidth: 120 }}>
              Continue
            </Button>
          )}
        </Stack>
      </Form>
    </>
  );
}
