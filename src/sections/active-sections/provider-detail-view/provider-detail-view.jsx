import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Badge, Box, Button, Card, Chip, Container, Skeleton, Stack, Switch, Tab, Tabs, Typography } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { varAlpha } from 'src/theme/styles';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { SocialIcon } from 'src/components/iconify/social-icon';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { fData } from 'src/utils/format-number';
import { useSelector } from 'react-redux';
import { useGetUserProfileQuery, useSetBusinessProfileMutation, useUpdateBusinessCertificationsMutation, useUploadS3Mutation } from 'src/store/Reducer/auth';
import { useGetBusinessOverviewQuery, useGetBusinessOverviewPublicQuery } from 'src/store/Reducer/businesses-api';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import { DUMMYDATA } from '../provider-view/mocks/mock-data';
import LicenseTagApplicationDialog from './components/LicenseTagApplicationDialog';
import ProviderBookingsTab from './components/ProviderBookingsTab';
import ProviderOperatingHoursTab from './components/ProviderOperatingHoursTab';
import ProviderOverviewTab from './components/ProviderOverviewTab';
import ProviderServicesTab from './components/ProviderServicesTab';
import ProviderReviewsTab from './components/ProviderReviewsTab';
import ProviderPortfolioTab from './components/ProviderPortfolioTab';

const MAX_LICENSE_FILE_SIZE = 3145728;

const DAY_SHORT_TO_KEY = { Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday', Fri: 'friday', Sat: 'saturday', Sun: 'sunday' };

const CERT_STATUS_COLOR = { approved: 'success', pending: 'warning', rejected: 'error' };
const CERT_STATUS_ICON = { approved: 'solar:verified-check-bold', pending: 'solar:clock-circle-bold', rejected: 'solar:close-circle-bold' };

function mapApiToProvider(apiData) {
  if (!apiData) return null;
  const { basicInfo, profile, accountState } = apiData;
  // "get my own profile" returns { basicInfo, profile, accountState }; "get business by id" may return
  // a flatter object instead — fall back to reading fields straight off apiData when profile is absent.
  const flat = profile ? null : apiData;
  const p = profile || flat || {};

  const operatingHours = (p.operatingHours || []).reduce((acc, day) => {
    const key = DAY_SHORT_TO_KEY[day.dayOfWeek];
    if (!key) return acc;
    acc[key] = {
      enabled: day.isOpen,
      startTime: day.isOpen ? day.startTime : null,
      endTime: day.isOpen ? day.endTime : null,
      breaks: day.isOpen ? (day.breaks || []) : [],
    };
    return acc;
  }, {});

  const categoryNames = p.categories?.length
    ? p.categories.map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean)
    : (p.categoryNames || []);

  return {
    _id: basicInfo?._id || flat?._id || apiData._id || '',
    businessProfileId: profile?._id || basicInfo?._id || flat?._id || apiData._id || '',
    name: p.businessName || basicInfo?.name || flat?.name || '',
    avatar: (p.image && !p.image.toLowerCase().includes('noimg')) ? p.image : undefined,
    coverUrl: (p.coverImage && !p.coverImage.toLowerCase().includes('noimg')) ? p.coverImage : undefined,
    providerType: p.businessType || accountState?.userType || '',
    description: p.description || '',
    location: p.location?.address || (typeof p.location === 'string' ? p.location : ''),
    businessSize: `${p.teamSize || 1}`,
    experience: `${p.yearsOfExperience || 0} years`,
    priceRange: p.priceRange || null,
    isOnline: p.isAvailable ?? true,
    categories: categoryNames,
    category: categoryNames[0] || '',
    specialty: p.skills || p.specialties || [],
    tags: (p.tags || []).map((tag) => (typeof tag === 'string' ? tag : tag?.name)).filter(Boolean),
    operatingHours,
    badges: p.badges || {},
    preferredServiceType: p.badges?.preferredServiceType?.optionName || '',
    certifications: p.certifications || {},
    socialLinks: p.socialLinks || {},
    instagram: p.socialLinks?.instagram || '',
    facebook: p.socialLinks?.facebook || '',
    linkedin: p.socialLinks?.linkedin || '',
    website: p.socialLinks?.website || '',
    services: p.services || [],
    rating: p.rating?.avgRating ?? p.rating ?? null,
    reviewCount: p.rating?.totalReviews ?? p.reviewCount ?? 0,
    nextAvailableSlot: apiData.nextAvailableSlot || null,
  };
}

export default function ProviderDetailView({ providerId: providerIdProp, showEdit = false, onEdit }) {
  const { id: routeId } = useParams();
  const id = providerIdProp ?? routeId;
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate();
  const localObjectUrlsRef = useRef([]);
  const { user } = useSelector((state) => state.user);

  const isAdminRoute = pathname.includes('/admin-dashboard');
  const isPublicView = !showEdit && !isAdminRoute;

  const { data: profileData, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
    skip: !showEdit || !user?.token,
  });

  const { data: overviewData, isLoading: overviewLoading, isFetching: overviewFetching } = useGetBusinessOverviewQuery(id, {
    skip: !id || !isAdminRoute,
  });

  // Session location (set at login) — lets the backend compute real distance on this
  // business's service list, same as the marketplace list and detail pages.
  const myLocation = getMyLocation();
  const hasRealMyLocation = isRealCoords(myLocation?.lat, myLocation?.lng);

  const { data: publicOverviewData, isLoading: publicOverviewLoading, isFetching: publicOverviewFetching } = useGetBusinessOverviewPublicQuery(
    hasRealMyLocation ? { businessId: id, lat: myLocation.lat, lng: myLocation.lng } : id,
    { skip: !id || !isPublicView }
  );

  const [setBusinessProfile, { isLoading: isTogglingAvailability }] = useSetBusinessProfileMutation();
  const [updateBusinessCertifications] = useUpdateBusinessCertificationsMutation();
  const [uploadS3] = useUploadS3Mutation();

  const { data: badgesData } = useGetBadgesQuery({ scope: 'business' }, { skip: !showEdit });
  const certificationBadge = (badgesData?.data || []).find(
    (b) => (b?.translations?.en || b?.name || '') === 'Certifications & Licensing'
  );
  const certificationTypeOptions = (certificationBadge?.options || [])
    .filter((opt) => opt.status !== 'inactive')
    .map((opt) => ({ value: opt._id, label: opt.translations?.en || opt.name }));

  const [currentTab, setCurrentTab] = useState('overview');
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [licenseCertificationType, setLicenseCertificationType] = useState('');
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false);

  const apiProvider = useMemo(() => mapApiToProvider(profileData?.data), [profileData]);
  const overviewProvider = useMemo(() => mapApiToProvider(overviewData?.data), [overviewData]);
  const publicOverviewProvider = useMemo(() => mapApiToProvider(publicOverviewData?.data), [publicOverviewData]);
  const mockProvider = useMemo(() => DUMMYDATA.find((item) => item._id === id) || DUMMYDATA[0], [id]);
  const provider = showEdit
    ? (apiProvider ?? mockProvider)
    : isAdminRoute
      ? (overviewProvider ?? mockProvider)
      : (publicOverviewProvider ?? mockProvider);

  const certStatus = String(provider?.certifications?.status || '').toLowerCase();
  const hasCertification = Boolean(provider?.certifications) && certStatus !== '' && certStatus !== 'not_submitted';

  const TABS = useMemo(
    () => [
      { value: 'overview', label: t('overview'), icon: 'solar:home-angle-bold-duotone' },
      { value: 'services', label: t('services'), icon: 'solar:bill-list-bold-duotone' },
      { value: 'operatingHours', label: t('operatingHours'), icon: 'solar:clock-circle-bold-duotone' },
      { value: 'bookings', label: t('bookings'), icon: 'solar:calendar-mark-bold-duotone' },
      { value: 'reviews', label: t('reviewsLabel'), icon: 'solar:star-bold' },
      { value: 'portfolio', label: t('portfolio'), icon: 'solar:gallery-wide-bold-duotone' },
    ],
    [t]
  );

  const shareActions = [
    { key: 'instagram', label: t('instagram'), href: provider.instagram, icon: 'instagram' },
    { key: 'facebook', label: t('facebook'), href: provider.facebook, icon: 'facebook' },
    { key: 'linkedin', label: t('linkedin'), href: provider.linkedin, icon: 'linkedin' },
    { key: 'website', label: t('website'), href: provider.website, icon: 'solar:global-bold' },
  ].filter((item) => Boolean(item.href));

  const breadcrumbLinks = useMemo(() => {
    const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;

    if (showEdit) {
      return [{ name: t('dashboard'), href: dashboardRoot }, { name: t('businessProfile') }];
    }

    const providersHref = isAdminRoute ? paths.adminDashboard.providers : paths.dashboard.providers;
    return [
      { name: t('dashboard'), href: dashboardRoot },
      { name: t('providers'), href: providersHref },
      { name: provider.name },
    ];
  }, [isAdminRoute, showEdit, provider.name, t]);

  useEffect(() => {
    setCoverImageError(false);
    setAvatarImageError(false);
    setIsOnline(provider?.isOnline ?? true);
  }, [provider]);

  const handleToggleAvailability = async (event) => {
    const nextOnline = event.target.checked;
    const prevOnline = isOnline;
    setIsOnline(nextOnline);

    const profile = profileData?.data?.profile;
    try {
      await setBusinessProfile({
        businessName: profile?.businessName || '',
        image: profile?.image || '',
        coverImage: profile?.coverImage || '',
        isAvailable: nextOnline,
        categories: (profile?.categories || []).map((c) => (typeof c === 'string' ? c : c?._id)).filter(Boolean),
        preferredCategory: profile?.preferredCategory || '',
        skills: profile?.skills || [],
        location: profile?.location || { address: '', type: 'Point', coordinates: [0, 0] },
        businessType: profile?.businessType || 'solo',
        teamSize: profile?.teamSize || 1,
        yearsOfExperience: profile?.yearsOfExperience || 0,
        description: profile?.description || '',
        badges: profile?.badges || {},
        socialLinks: profile?.socialLinks || {},
        operatingHours: profile?.operatingHours || [],
      }).unwrap();
      toast.success(t(nextOnline ? 'online' : 'offline'));
    } catch (error) {
      setIsOnline(prevOnline);
      toast.error(error?.data?.message || error?.message || t('failedToUpdateAvailability'));
    }
  };

  useEffect(
    () => () => {
      localObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localObjectUrlsRef.current = [];
    }, []);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
      return;
    }
    router.push(paths.dashboard.businessProfileEdit(provider._id));
  };
  const handleUploadLicenseFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const allowedFiles = selectedFiles.filter((file) => file.size <= MAX_LICENSE_FILE_SIZE);
    const rejectedCount = selectedFiles.length - allowedFiles.length;

    if (rejectedCount > 0) {
      toast.error(t('filesExceededMaxSize', { count: rejectedCount, size: fData(MAX_LICENSE_FILE_SIZE) }));
    }

    const nextFiles = allowedFiles.map((file, index) => {
      const url = URL.createObjectURL(file);
      localObjectUrlsRef.current.push(url);

      return {
        id: `license-${Date.now()}-${index}-${file.name}-${file.size}`,
        name: file.name,
        type: file.type || t('uploadedFile'),
        url,
        file,
        isObjectUrl: true,
      };
    });

    if (nextFiles.length) {
      setLicenseFiles((currentFiles) => [...currentFiles, ...nextFiles]);
    }

    event.target.value = '';
  };
  const handleDeleteLicenseFile = (fileId) => {
    setLicenseFiles((currentFiles) => {
      const removedFile = currentFiles.find((file) => file.id === fileId);

      if (removedFile?.isObjectUrl) {
        URL.revokeObjectURL(removedFile.url);
        localObjectUrlsRef.current = localObjectUrlsRef.current.filter((url) => url !== removedFile.url);
      }

      return currentFiles.filter((file) => file.id !== fileId);
    });
  };
  const handleCloseLicenseDialog = () => {
    licenseFiles.forEach((file) => {
      if (file.isObjectUrl) URL.revokeObjectURL(file.url);
    });
    localObjectUrlsRef.current = [];
    setLicenseFiles([]);
    setLicenseCertificationType('');
    setLicenseDialogOpen(false);
  };
  const handleApplyLicenseTag = async () => {
    if (!licenseCertificationType) {
      toast.warning(t('selectLicenseTypeBeforeUploading'));
      return;
    }
    if (!licenseFiles.length) {
      toast.warning(t('uploadLicenseImage'));
      return;
    }

    setIsSubmittingLicense(true);
    try {
      const uploadedUrls = [];
      for (const licenseFile of licenseFiles) {
        const formData = new FormData();
        formData.append('files', licenseFile.file);
        const res = await uploadS3(formData).unwrap();
        if (res?.data?.file) uploadedUrls.push(res.data.file);
      }

      await updateBusinessCertifications({
        badgeId: certificationBadge?._id,
        optionId: licenseCertificationType,
        files: uploadedUrls,
      }).unwrap();

      setLicenseDialogOpen(false);
      setLicenseFiles([]);
      setLicenseCertificationType('');
      toast.success(t('updateSuccess'));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('failedToSubmitLicenseApplication'));
    } finally {
      setIsSubmittingLicense(false);
    }
  };

  if (
    (showEdit && profileLoading) ||
    (isAdminRoute && (overviewLoading || overviewFetching)) ||
    (isPublicView && (publicOverviewLoading || publicOverviewFetching))
  ) {
    return (
      <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Skeleton variant="text" width={60} height={36} />
          </Box>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {/* Cover skeleton */}
            <Skeleton variant="rectangular" width="100%" height={255} sx={{ transform: 'none' }} />

            {/* Info bar skeleton */}
            <Box sx={{ position: 'relative', minHeight: 88, px: 3, py: 2, pl: { xs: 18, md: 24 }, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton
                variant="circular"
                width={122}
                height={122}
                sx={{ position: 'absolute', left: { xs: 20, md: 44 }, top: { xs: -24, md: -30 }, border: 'solid 5px #fff', flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Skeleton variant="text" width={200} height={44} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={80} height={24} />
              </Box>
              <Stack sx={{ ml: 'auto' }} spacing={1} alignItems="flex-end">
                <Skeleton variant="rounded" width={160} height={32} sx={{ borderRadius: 999 }} />
                <Skeleton variant="rounded" width={130} height={26} sx={{ borderRadius: 999 }} />
              </Stack>
            </Box>

            {/* Tabs skeleton */}
            <Box sx={{ px: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={4} sx={{ py: 2 }}>
                {[100, 80, 120, 90, 80].map((w, i) => (
                  <Skeleton key={i} variant="text" width={w} height={28} />
                ))}
              </Stack>
            </Box>
          </Card>

          {/* Content skeleton */}
          <Stack direction="row" spacing={3}>
            <Skeleton variant="rounded" sx={{ flex: 1, height: 300, borderRadius: 3 }} />
            <Skeleton variant="rounded" sx={{ flex: 1, height: 300, borderRadius: 3 }} />
          </Stack>
        </Stack>
      </Container>
    );
  }

  const renderActiveTab = () => {
    if (currentTab === 'overview') {
      return <ProviderOverviewTab provider={provider} isPublicView={isPublicView} onShowAllServices={() => setCurrentTab('services')} />;
    }
    if (currentTab === 'services') return <ProviderServicesTab provider={provider} isPublicView={isPublicView} />;
    if (currentTab === 'operatingHours') return <ProviderOperatingHoursTab provider={provider} isPublicView={isPublicView} />;
    if (currentTab === 'bookings') return <ProviderBookingsTab provider={provider} isPublicView={isPublicView} />;
    if (currentTab === 'portfolio') return <ProviderPortfolioTab isPublicView={isPublicView} showEdit={showEdit} />;
    return <ProviderReviewsTab provider={provider} isPublicView={isPublicView} />;
  };

  return (
    <Container maxWidth={false} sx={{ pt: 0, pb: 3, maxWidth: '1500px', mx: 'auto' }}>
      <Stack spacing={3}>
        <CustomBreadcrumbs links={breadcrumbLinks} sx={{ mb: 0 }} />
        <Card
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: (theme) => theme.shadows[10],
              transform: 'translateY(-2px)',
            },
            '&:hover .provider-avatar': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <Box
            sx={{
              height: { xs: 210, md: 255 },
              position: 'relative',
              overflow: 'hidden',
              background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.38) 100%)',
                pointerEvents: 'none',
                zIndex: 1,
                display: (provider.coverUrl && !coverImageError) ? 'block' : 'none',
              },
            }}
          >
            {provider.coverUrl && !coverImageError && (
              <Box
                component="img"
                src={provider.coverUrl}
                alt={`${provider.name} cover`}
                onError={() => setCoverImageError(true)}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              />
            )}

            {(showEdit || shareActions.length > 0) && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  zIndex: 4,
                }}
              >
                {shareActions?.length > 0 && (
                  <SpeedDial
                    direction="left"
                    ariaLabel={t('shareProvider')}
                    icon={<Iconify icon="solar:share-bold" width={20} />}
                    FabProps={{
                      size: 'medium',
                      sx: {
                        width: 42,
                        height: 42,
                        bgcolor: 'common.white',
                        color: 'text.primary',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
                        '&:hover': {
                          bgcolor: 'grey.100',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                        },
                      },
                    }}
                    sx={{
                      position: 'static',
                      height: 42,
                      '& .MuiSpeedDialAction-fab': {
                        bgcolor: 'common.white',
                        color: 'text.primary',
                        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.common.blackChannel, 0.12)}`,
                        boxShadow: (theme) => `0 10px 22px ${varAlpha(theme.vars.palette.common.blackChannel, 0.25)}`,
                      },
                    }}
                  >
                    {shareActions.map((action) => (
                      <SpeedDialAction
                        key={action.key}
                        icon={action.icon === 'solar:global-bold' ? <Iconify icon={action.icon} /> : <SocialIcon icon={action.icon} width={20} />}
                        tooltipTitle={action.label}
                        tooltipPlacement="top"
                        onClick={() => window.open(action.href, '_blank', 'noopener,noreferrer')}
                        FabProps={{ color: 'default' }}
                      />
                    ))}
                  </SpeedDial>
                )}
                {showEdit && (
                  <Box
                    component="button"
                    onClick={handleEditClick}
                    aria-label={t('edit')}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                      },
                    }}
                  >
                    <Iconify icon="solar:pen-bold" width={20} />
                  </Box>
                )}
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              position: 'relative',
              minHeight: 88,
              px: { xs: 2.5, md: 3 },
              py: 2,
              pl: { xs: 18, md: 24 },
              bgcolor: '#fffdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Badge
              variant={isOnline ? 'online' : 'offline'}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{
                position: 'absolute',
                left: { xs: 20, md: 44 },
                top: { xs: -24, md: -30 },
                zIndex: 5,
                '& .MuiBadge-badge': {
                  right: 10,
                  bottom: 10,
                  width: 14,
                  height: 14,
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  bgcolor: isOnline ? 'success.main' : 'text.disabled',
                  '&::before, &::after': { display: 'none' },
                },
              }}
            >
              <Avatar
                className="provider-avatar"
                src={!avatarImageError ? provider.avatar : undefined}
                slotProps={{ img: { onError: () => setAvatarImageError(true) } }}
                alt={provider.name}
                sx={{
                  width: { xs: 108, md: 122 },
                  height: { xs: 108, md: 122 },
                  border: 'solid 5px #fff',
                  bgcolor: 'primary.dark',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: 40, md: 46 },
                  boxShadow: (theme) => `0 16px 34px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.32)}`,
                  transition: 'transform 0.25s ease',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    border: `2px solid ${varAlpha('255 255 255', 0.7)}`,
                    pointerEvents: 'none',
                  },
                }}
              >
                {provider.name?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
            </Badge>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" noWrap sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1.15 }}>
                {provider.name}
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: '#9a7a5c', fontWeight: 600, mt: 0.25 }}>
                {provider.providerType}
              </Typography>
            </Box>

            {(showEdit || isAdminRoute) && (
              <Stack
                direction="column"
                spacing={1.25}
                alignItems="flex-end"
                sx={{
                  ml: 'auto',
                  flexShrink: 0,
                }}
              >
                {showEdit && (
                  <Stack direction="row" alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#1f120a',
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('availableNow')}
                    </Typography>
                    <Switch
                      checked={isOnline}
                      disabled={isTogglingAvailability}
                      onChange={handleToggleAvailability}
                    />
                  </Stack>
                )}

                {hasCertification ? (
                  <Stack spacing={0.75} alignItems="flex-end">
                    <Chip
                      variant="soft"
                      color="primary"
                      icon={<Iconify icon="solar:shield-check-bold" width={18} />}
                      label={t('licensedProfessional')}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      size="small"
                      variant="soft"
                      color={CERT_STATUS_COLOR[certStatus] || 'default'}
                      icon={<Iconify icon={CERT_STATUS_ICON[certStatus] || 'solar:clock-circle-bold'} width={14} />}
                      label={certStatus ? t(certStatus) : t('pending')}
                      sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                    />
                  </Stack>
                ) : (
                  showEdit && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<Iconify icon="solar:shield-plus-bold" width={18} />}
                      onClick={() => setLicenseDialogOpen(true)}
                      sx={{
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('applyLicensedProfessionalTag')}
                    </Button>
                  )
                )}
              </Stack>
            )}

            {!showEdit && !isAdminRoute && certStatus === 'approved' && (
              <Chip
                variant="soft"
                color="primary"
                icon={<Iconify icon="solar:shield-check-bold" width={18} />}
                label={t('licensedProfessional')}
                sx={{ fontWeight: 700, ml: 'auto', flexShrink: 0 }}
              />
            )}
          </Box>

          {/* Tabs bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={currentTab}
              onChange={(_, nextTab) => setCurrentTab(nextTab)}
              sx={{
                minHeight: 56,
                '& .MuiTabs-indicator': {
                  height: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                },
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={18} />}
                  iconPosition="start"
                  sx={{
                    minHeight: 56,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 0,
                    mx: 2.5,
                    minWidth: 'auto',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'text.primary',
                    },
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                    '& .MuiTab-iconWrapper': {
                      transition: 'color 0.2s ease',
                      color: 'inherit',
                    },
                    '&.Mui-selected .MuiTab-iconWrapper': {
                      transform: 'none',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Card>

        <Box key={currentTab} sx={{ animation: 'fadeSlideIn 240ms ease-out' }}>
          {renderActiveTab()}
        </Box>
      </Stack>

      <LicenseTagApplicationDialog
        open={licenseDialogOpen}
        files={licenseFiles}
        maxFileSize={MAX_LICENSE_FILE_SIZE}
        providerName={provider.name}
        certificationType={licenseCertificationType}
        certificationTypeOptions={certificationTypeOptions}
        loading={isSubmittingLicense}
        onApply={handleApplyLicenseTag}
        onClose={handleCloseLicenseDialog}
        onDeleteFile={handleDeleteLicenseFile}
        onUploadFiles={handleUploadLicenseFiles}
        onCertificationTypeChange={setLicenseCertificationType}
      />
    </Container>
  );
}
