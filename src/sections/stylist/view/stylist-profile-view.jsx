import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { Box, Grid } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { paths } from 'src/routes/paths';

import { brand } from 'src/sections/home/landing/theme';
import { setAuthRedirectPath, setAuthService } from 'src/sections/auth/jwt/auth-redirect-storage';
import { useGetPublicBusinessByIdQuery, useRecordProfileVisitMutation } from 'src/store/Reducer/businesses-api';
import { claimProfileVisit, getProfileVisitSource, settleProfileVisit } from 'src/utils/profile-visit';
import { getItemDurationMins } from 'src/utils/service-duration';

import ProfileHeader from './components/ProfileHeader';
import ServicesPanel from './components/ServicesPanel';
import ProfileSidebar from './components/ProfileSidebar';
import LoginPromptDialog from './components/LoginPromptDialog';
import StylistNotFound from './components/StylistNotFound';
import StylistProfileSkeleton from './components/StylistProfileSkeleton';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

function formatLeadTime(lead) {
  const hours = lead?.hours || 0;
  const mins = lead?.mins || 0;
  if (!hours && !mins) return null;

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  return `${parts.join(' ')} before`;
}

// ----------------------------------------------------------------------

export function StylistProfileView() {
  const { id: slugOrId } = useParams();
  const location = useLocation();
  const businessId = location.state?.businessId || slugOrId;
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const { data, isLoading, isFetching } = useGetPublicBusinessByIdQuery(businessId, { skip: !businessId });
  const business = data?.data;
  const [recordProfileVisit] = useRecordProfileVisitMutation();
  const profileId = business?._id;

  useEffect(() => {
    if (!profileId) return;
    const source = getProfileVisitSource();
    const key = claimProfileVisit(profileId, source);
    if (!key) return;
    recordProfileVisit({ profileId, source })
      .unwrap()
      .then(() => settleProfileVisit(key, true))
      .catch(() => settleProfileVisit(key, false));
  }, [profileId, recordProfileVisit]);
  const loading = isLoading || isFetching;

  // Show the readable slug in the address bar when the page was opened by ID.
  useEffect(() => {
    if (business?.nameSlug && business._id === businessId && slugOrId !== business.nameSlug) {
      navigate(paths.stylist.details(business.nameSlug), { replace: true, state: { businessId: business._id } });
    }
  }, [business, businessId, slugOrId, navigate]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingService, setPendingService] = useState(null);

  const categories = (business?.services?.categories || []).filter((cat) => cat._id);

  const filteredServices = useMemo(() => {
    const items = business?.services?.items || [];
    const scoped = selectedCategory === 'all' ? items : items.filter((item) => item.category?._id === selectedCategory);

    return scoped.map((item) => {
      const openDays = (item.slots || []).filter((slot) => slot.isOpen).map((slot) => slot.dayOfWeek);
      const durationMins = getItemDurationMins(item);

      return {
        _id: item._id,
        name: item.name,
        price: item.price,
        duration: durationMins != null ? `${durationMins} min` : '—',
        subCategory: item.category?.name,
        serviceType: item.preferredServiceType?.optionName,
        availability: openDays.length ? openDays.join(', ') : undefined,
        bookByLabel: formatLeadTime(item.howLateCanBook),
        cancelByLabel: formatLeadTime(item.howLateCanCancel),
        refundPercentage: item.refundPercentage,
      };
    });
  }, [business, selectedCategory]);

  const ratingBreakdown = useMemo(() => {
    const counts = business?.rating?.ratingCount || {};
    const total = business?.rating?.totalReviews || 0;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = counts[star] ?? 0;
      return { star, count, percent: total ? (count / total) * 100 : 0 };
    });
  }, [business]);

  if (loading) {
    return <StylistProfileSkeleton />;
  }

  if (!business) {
    return <StylistNotFound onBackToSearch={() => navigate('/')} />;
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setExpandedServiceId(null);
  };

  const handleToggleService = (serviceId) => {
    setExpandedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };

  const handleAuthRedirect = (authPath, service) => {
    if (service?._id) setAuthRedirectPath(paths.dashboard.serviceDetails(service._id));
    if (service) setAuthService(service);
    navigate(authPath, { state: { service } });
  };

  const handleBookService = (service) => {
    if (user) {
      navigate(paths.dashboard.serviceDetails(service._id), { state: { service } });
      return;
    }

    setPendingService(service);
    setLoginOpen(true);
  };

  const showBook = !user || user?.accountState?.userType === 'customer' || user?.accountState?.userType === 'user';

  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Back button */}
        <Box
          component="button"
          type="button"
          onClick={() => navigate(-1)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 2.5,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 600,
            '&:hover': { color: brand.green[600] },
          }}
        >
          <Iconify icon="mingcute:arrow-left-line" width={18} />
          Back
        </Box>

        <ProfileHeader business={business} />

        {/* ── Main content ── */}
        <Grid container spacing={3} alignItems="flex-start">
          {/* Left — Services */}
          <Grid item xs={12} md={8}>
            <ServicesPanel
              business={business}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              filteredServices={filteredServices}
              expandedServiceId={expandedServiceId}
              onToggleService={handleToggleService}
              onBookService={handleBookService}
              showBook={showBook}
            />
          </Grid>

          {/* Right — Sidebar */}
          <Grid item xs={12} md={4}>
            <ProfileSidebar business={business} ratingBreakdown={ratingBreakdown} />
          </Grid>
        </Grid>

        <LoginPromptDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSignIn={() => handleAuthRedirect(paths.auth.jwt.signIn, pendingService)}
          onSignUp={() => handleAuthRedirect(paths.auth.jwt.signUp, pendingService)}
        />
      </Box>
    </Box>
  );
}
