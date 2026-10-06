import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { varAlpha } from 'src/theme/styles';
import { useGetServicesQuery, useGetPackagesQuery, useGetPromotionsQuery } from 'src/store/Reducer/services-api';
import {
  useGetBusinessPackagesQuery,
  useGetBusinessPackagesPublicQuery,
  useGetBusinessPromotionsQuery,
  useGetBusinessPromotionsPublicQuery,
  useGetBusinessServicesQuery,
  useGetBusinessServicesPublicQuery,
} from 'src/store/Reducer/businesses-api';
import { useDebounce } from 'src/hooks/use-debounce';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import { normalizePromotion } from 'src/utils/normalize-promotion';
import { getItemDurationMins } from 'src/utils/service-duration';

import PromotionCard from '../../promotions-view/components/promotion-card';
import PromotionSummaryCard from '../../promotions-view/components/promotion-summary-card';
import ServiceCard from '../../services-view/components/service-card-main';
import PackageCard from '../../services-view/components/package-card';
import { AddressFilterField } from '../../services-view/components/address-filter-field';

const TABS = [
  { value: 'services', label: 'services', icon: 'solar:bill-list-bold-duotone' },
  { value: 'packages', label: 'packages', icon: 'solar:box-minimalistic-bold' },
  { value: 'promotions', label: 'promotions', icon: 'duo-icons:discount' },
];

const LIMIT = 12;

function normalizeServiceCard(item) {
  const durationMins = getItemDurationMins(item);
  return {
    ...item,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    reviewCount: item.reviewCount ?? item.totalReviews ?? 0,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  };
}

function ServiceCardSkeleton() {
  return (
    <Card sx={{ p: 2.25, borderRadius: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="70%" height={20} />
        </Box>
      </Stack>
      <Skeleton variant="text" width="100%" height={1} sx={{ mb: 2 }} />
      <Stack direction="row" justifyContent="space-between">
        <Skeleton variant="text" width={60} height={32} />
        <Skeleton variant="rounded" width={70} height={30} sx={{ borderRadius: 1.5 }} />
      </Stack>
    </Card>
  );
}

function EmptyState({ icon, title }) {
  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        p: 3,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.24),
        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        minHeight: 220,
        textAlign: 'center',
      }}
    >
      <Iconify icon={icon} width={28} sx={{ color: 'primary.main' }} />
      <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
    </Box>
  );
}

function ServicesContent({ isAdmin, router, isAdminRoute, isPublicView, businessId, lat, lng, keyword: debouncedKeyword }) {
  const { t } = useTranslate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const ownServicesResult = useGetServicesQuery(
    { page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: isAdminRoute || isPublicView }
  );
  const businessServicesResult = useGetBusinessServicesQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: !isAdminRoute || !businessId }
  );
  const publicServicesResult = useGetBusinessServicesPublicQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined, lat, lng },
    { skip: !isPublicView || !businessId }
  );
  const { data, isFetching } = isAdminRoute ? businessServicesResult : isPublicView ? publicServicesResult : ownServicesResult;

  const services = (data?.data || []).map(normalizeServiceCard);
  const meta = data?.meta || {};
  const totalPages = meta.totalPages || 1;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
        {isFetching
          ? Array.from({ length: LIMIT }).map((_, i) => <ServiceCardSkeleton key={i} />)
          : services.length
            ? services.map((svc) => (
              <ServiceCard
                key={svc._id || svc.id}
                svc={svc}
                hideBook={isAdmin}
                hideDistance={isAdmin || !isPublicView}
                onView={() => {
                  const id = svc._id || svc.id;
                  if (!id) return;
                  router.push(isAdmin ? paths.adminDashboard.serviceDetails(id) : paths.dashboard.serviceDetails(id));
                }}
              />
            ))
            : <EmptyState icon="solar:clipboard-remove-bold" title={t('noServicesAvailable')} />
        }
      </Box>

      {!isFetching && totalPages > 1 && (
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Stack>
  );
}

function PackagesContent({ isAdmin, router, isAdminRoute, isPublicView, businessId, lat, lng, keyword: debouncedKeyword }) {
  const { t } = useTranslate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const ownPackagesResult = useGetPackagesQuery(
    { page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: isAdminRoute || isPublicView }
  );
  const businessPackagesResult = useGetBusinessPackagesQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: !isAdminRoute || !businessId }
  );
  const publicPackagesResult = useGetBusinessPackagesPublicQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined, lat, lng },
    { skip: !isPublicView || !businessId }
  );
  const { data, isFetching } = isAdminRoute ? businessPackagesResult : isPublicView ? publicPackagesResult : ownPackagesResult;

  const packages = (data?.data || []).map((item) => ({
    ...item,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
  }));
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
        {isFetching
          ? Array.from({ length: LIMIT }).map((_, i) => <ServiceCardSkeleton key={i} />)
          : packages.length
            ? packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                hideDistance={isAdmin || !isPublicView}
                onView={() => {
                  if (!pkg._id) return;
                  router.push(isAdmin ? paths.adminDashboard.packageDetails(pkg._id) : paths.dashboard.packageDetails(pkg._id));
                }}
              />
            ))
            : <EmptyState icon="solar:box-minimalistic-bold" title={t('noPackagesAvailable')} />
        }
      </Box>

      {!isFetching && totalPages > 1 && (
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Stack>
  );
}

function PromotionsContent({ isAdmin, router, isAdminRoute, isPublicView, businessId, providerName, lat, lng, keyword: debouncedKeyword }) {
  const { t } = useTranslate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const ownPromotionsResult = useGetPromotionsQuery(
    { page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: isAdminRoute || isPublicView }
  );
  const businessPromotionsResult = useGetBusinessPromotionsQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined },
    { skip: !isAdminRoute || !businessId }
  );
  const publicPromotionsResult = useGetBusinessPromotionsPublicQuery(
    { businessId, page, limit: LIMIT, keyword: debouncedKeyword || undefined, lat, lng },
    { skip: !isPublicView || !businessId }
  );
  const { data, isFetching } = isAdminRoute ? businessPromotionsResult : isPublicView ? publicPromotionsResult : ownPromotionsResult;

  const getItemId = (item) => item?._id || item?.id;
  // The public/customer endpoint returns a service/package with the promotion nested inside it —
  // normalize it the same way the marketplace promotions tab does, so the card shows the real
  // discount/expiry/target instead of the promo-shaped defaults. The admin/own endpoints already
  // return flat promotion documents, so they're used as-is.
  const promotions = isPublicView ? (data?.data || []).map(normalizePromotion) : data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const handleViewPromotion = (promo) => {
    if (!isPublicView) {
      router.push(isAdmin ? paths.adminDashboard.promotionDetails(getItemId(promo)) : paths.dashboard.promotionDetails(getItemId(promo)));
      return;
    }

    // "Claim Offer" doesn't call an API — the item already has everything the detail page needs,
    // so it's passed straight through via navigation state, same as the marketplace promotions tab.
    const itemId = getItemId(promo);
    if (!itemId) return;
    const promoState = { state: { promotion: promo.promotion } };
    if (promo.scope === 'package') {
      router.push(paths.dashboard.packageDetails(itemId), promoState);
    } else {
      router.push(paths.dashboard.serviceDetails(itemId), promoState);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
        {isFetching
          ? Array.from({ length: LIMIT }).map((_, i) => <ServiceCardSkeleton key={i} />)
          : promotions.length
            ? promotions.map((promo) => {
              // "Claim Offer" is a customer-only action — a business viewing its own promotions,
              // or an admin managing a business's promotions, gets the plain read-only card instead.
              const PromoCardComponent = isPublicView ? PromotionCard : PromotionSummaryCard;
              return (
                <PromoCardComponent
                  key={`${promo.promotionId || 'promo'}-${getItemId(promo)}`}
                  svc={promo}
                  providerName={providerName}
                  onView={() => handleViewPromotion(promo)}
                />
              );
            })
            : <EmptyState icon="solar:tag-price-bold" title={t('noPromotionsAvailable')} />
        }
      </Box>

      {!isFetching && totalPages > 1 && (
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Stack>
  );
}

export default function ProviderServicesTab({ provider, isPublicView = false }) {
  const { t } = useTranslate();
  const user = useSelector((state) => state.user);
  const isAdmin = user?.user?.accountState?.userType === 'admin';
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const businessId = provider?._id || provider?.businessProfileId;
  const [activeTab, setActiveTab] = useState('services');

  // Seeded once from the session's saved location (set at login) — searching a new address or
  // using "current location" updates this local state only, never sessionStorage's `myLocation`.
  // Customer-facing only; admin/provider management views never touch location.
  const [queryLocation, setQueryLocation] = useState(() => (isPublicView ? getMyLocation() : null));
  const hasRealQueryCoords = isRealCoords(queryLocation?.lat, queryLocation?.lng);
  const lat = hasRealQueryCoords ? queryLocation.lat : undefined;
  const lng = hasRealQueryCoords ? queryLocation.lng : undefined;

  // Search + address are rendered once here, rather than inside each tab's content component —
  // those used to unmount/remount on every tab switch (each owning its own copy of these
  // fields), which tore down and rebuilt the Google Places listeners each time and felt janky.
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);
  const searchPlaceholderKey =
    activeTab === 'packages' ? 'searchPackagesPlaceholder' : activeTab === 'promotions' ? 'searchPromotionsPlaceholder' : 'searchServicesPlaceholder';

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 2, '& .MuiTabs-indicator': { height: 3 } }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={t(tab.label)}
            icon={<Iconify icon={tab.icon} width={18} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t(searchPlaceholderKey)}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {isPublicView && (
          <AddressFilterField value={queryLocation?.address} onPlaceSelected={setQueryLocation} sx={{ flex: 1 }} />
        )}
      </Stack>

      {activeTab === 'services' && (
        <ServicesContent
          isAdmin={isAdmin}
          router={router}
          isAdminRoute={isAdminRoute}
          isPublicView={isPublicView}
          businessId={businessId}
          lat={lat}
          lng={lng}
          keyword={debouncedKeyword}
        />
      )}

      {activeTab === 'packages' && (
        <PackagesContent
          isAdmin={isAdmin}
          router={router}
          isAdminRoute={isAdminRoute}
          isPublicView={isPublicView}
          businessId={businessId}
          lat={lat}
          lng={lng}
          keyword={debouncedKeyword}
        />
      )}

      {activeTab === 'promotions' && (
        <PromotionsContent
          isAdmin={isAdmin}
          router={router}
          isAdminRoute={isAdminRoute}
          isPublicView={isPublicView}
          businessId={businessId}
          providerName={provider?.name}
          lat={lat}
          lng={lng}
          keyword={debouncedKeyword}
        />
      )}
    </>
  );
}
