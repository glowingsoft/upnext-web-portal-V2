import { useEffect, useMemo, useState } from 'react';

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

import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { useDebounce } from 'src/hooks/use-debounce';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { useGetPackagesQuery, useGetServicesQuery } from 'src/store/Reducer/services-api';
import { useGetBusinessPromotionsPublicQuery } from 'src/store/Reducer/businesses-api';
import { getMyLocation, isRealCoords } from 'src/utils/my-location-storage';
import { normalizePromotion } from 'src/utils/normalize-promotion';
import { getItemDurationMins } from 'src/utils/service-duration';

import PromotionCard from '../promotions-view/components/promotion-card';
import ServiceCard from './components/service-card-main';
import PackageCard from './components/package-card';
import { AddressFilterField } from './components/address-filter-field';

const TABS = [
  {
    value: 'services',
    label: 'services',
    icon: 'solar:bill-list-bold-duotone',
    emptyIcon: 'solar:clipboard-remove-bold',
    emptyLabel: 'noServicesAvailable',
  },
  {
    value: 'packages',
    label: 'packages',
    icon: 'solar:box-minimalistic-bold',
    emptyIcon: 'solar:box-minimalistic-bold',
    emptyLabel: 'noPackagesAvailable',
  },
  {
    value: 'promotions',
    label: 'promotions',
    icon: 'duo-icons:discount',
    emptyIcon: 'solar:tag-price-bold',
    emptyLabel: 'noPromotionsAvailable',
  },
];

const LIMIT = 12;

export const getItemId = (item) => item?._id || item?.id;

export function normalizeService(item) {
  const durationMins = getItemDurationMins(item);

  return {
    ...item,
    _id: getItemId(item),
    providerId: item.businessId ?? item.business?._id ?? item.provider?._id,
    providerName: item.businessName ?? item.business?.businessName ?? item.provider?.name,
    image: item.image || item.photo || item.photos?.[0],
    description: item.businessName ?? item.business?.businessName ?? item.description,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
    reviewCount: item.reviewCount ?? item.totalReviews ?? item.reviews?.length ?? 0,
  };
}

export function normalizePackage(item) {
  const durationMins = getItemDurationMins(item);

  return {
    ...item,
    _id: getItemId(item),
    providerId: item.businessId ?? item.business?._id ?? item.provider?._id,
    providerName: item.businessName ?? item.business?.businessName ?? item.provider?.name,
    image: item.image || item.coverImage || item.packageMedia?.[0],
    description: item.businessName ?? item.business?.businessName ?? item.description,
    duration: item.duration || (durationMins ? `${durationMins} mins` : undefined),
    price: item.price ?? item.packagePrice,
    rating: item.rating ?? item.avgRating ?? item.averageRating,
    distance: item.distance ?? item.distanceKm ?? item.business?.distanceKm ?? item.provider?.distanceKm,
    reviewCount: item.reviewCount ?? item.totalReviews ?? item.reviews?.length ?? 0,
  };
}

function CardSkeleton() {
  return (
    <Card sx={{ height: '100%', overflow: 'hidden', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '16 / 10' }}>
        <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'none' }} />
        <Skeleton variant="rounded" sx={{ position: 'absolute', top: 12, left: 12, width: 76, height: 25 }} />
        <Skeleton variant="rounded" sx={{ position: 'absolute', top: 12, right: 12, width: 48, height: 25 }} />
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 1 }}>
          <Skeleton variant="text" width="82%" height={27} />
          <Skeleton variant="text" width="62%" height={27} />
        </Box>

        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1.25 }} />
        <Skeleton variant="rounded" width={82} height={25} sx={{ borderRadius: 99 }} />

        <Box sx={{ flex: 1, minHeight: 16 }} />

        <Box sx={{ pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ minWidth: 0 }}>
            <Skeleton variant="text" width={48} height={17} />
            <Skeleton variant="text" width={64} height={28} />
          </Box>
          <Skeleton variant="rounded" width={92} height={36} sx={{ borderRadius: 99 }} />
        </Box>
      </Box>
    </Card>
  );
}

function EmptyState({ icon, title, searchValue, onClearSearch }) {
  const { t } = useTranslate();

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
        {searchValue ? t('noResultsFoundFor', { query: searchValue }) : title}
      </Typography>

      {searchValue && (
        <Typography
          variant="caption"
          onClick={onClearSearch}
          sx={{
            color: 'primary.main',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {t('clearSearch')}
        </Typography>
      )}
    </Box>
  );
}

export function CustomerServicesView() {
  const { t } = useTranslate();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('services');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchValue, 400);

  // Seeded once from the session's saved location (set at login from the account's profile
  // address) — searching a new address or using "current location" updates this local state
  // only, never sessionStorage's `myLocation`, which stays tied to the account's saved address.
  const [queryLocation, setQueryLocation] = useState(getMyLocation);
  const hasRealQueryCoords = isRealCoords(queryLocation?.lat, queryLocation?.lng);

  // Reset to page 1 whenever the visible list changes underneath the user — otherwise switching
  // tabs (or typing a new search) could leave them stranded on a page that no longer exists.
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const { data: servicesData, isFetching: isServicesFetching } = useGetServicesQuery({
    page: activeTab === 'services' ? page : 1,
    limit: LIMIT,
    keyword: debouncedSearch || undefined,
    lat: hasRealQueryCoords ? queryLocation.lat : undefined,
    lng: hasRealQueryCoords ? queryLocation.lng : undefined,
  });
  const { data: packagesData, isFetching: isPackagesFetching } = useGetPackagesQuery({
    page: activeTab === 'packages' ? page : 1,
    limit: LIMIT,
    keyword: debouncedSearch || undefined,
    lat: hasRealQueryCoords ? queryLocation.lat : undefined,
    lng: hasRealQueryCoords ? queryLocation.lng : undefined,
  });
  // No businessId — this is the marketplace-wide browse page, not a single provider's detail
  // page, so this returns promotions across every business rather than scoping to one.
  const { data: promotionsData, isFetching: isPromotionsFetching } = useGetBusinessPromotionsPublicQuery({
    page: activeTab === 'promotions' ? page : 1,
    limit: LIMIT,
    keyword: debouncedSearch || undefined,
    lat: hasRealQueryCoords ? queryLocation.lat : undefined,
    lng: hasRealQueryCoords ? queryLocation.lng : undefined,
  });

  const catalog = useMemo(
    () => ({
      services: (servicesData?.data || []).map(normalizeService),
      packages: (packagesData?.data || []).map(normalizePackage),
      promotions: (promotionsData?.data || []).map(normalizePromotion),
    }),
    [servicesData?.data, packagesData?.data, promotionsData?.data]
  );

  const tabCounts = {
    services: servicesData?.meta?.total ?? servicesData?.meta?.totalRecords ?? catalog.services.length,
    packages: packagesData?.meta?.total ?? packagesData?.meta?.totalRecords ?? catalog.packages.length,
    promotions: promotionsData?.meta?.total ?? promotionsData?.meta?.totalRecords ?? catalog.promotions.length,
  };

  const activeMeta = activeTab === 'services' ? servicesData?.meta : activeTab === 'packages' ? packagesData?.meta : promotionsData?.meta;
  const totalPages = activeMeta?.totalPages ?? Math.max(1, Math.ceil((tabCounts[activeTab] || 0) / LIMIT));

  const isFetchingActiveTab =
    (activeTab === 'services' && isServicesFetching) ||
    (activeTab === 'packages' && isPackagesFetching) ||
    (activeTab === 'promotions' && isPromotionsFetching);

  // Trust the server's already-filtered, already-paginated page as-is — re-filtering client-side
  // here would risk showing fewer than `LIMIT` items on a page without that being reflected in
  // totalPages.
  const activeItems = catalog[activeTab] || [];

  const activeTabMeta = TABS.find((tab) => tab.value === activeTab);

  const handleOpenItem = (item) => {
    if (activeTab === 'promotions') {
      // "Claim Offer" goes straight to the real service/package detail page (not a standalone
      // promotion page) — that's the item the discount actually applies to, so that's what should
      // look and behave like the thing being claimed. The promo itself is passed via state so the
      // detail page can show it as a banner without a second lookup.
      const itemId = getItemId(item);
      if (!itemId) return;
      const promoState = { state: { promotion: item.promotion } };
      if (item.scope === 'package') {
        router.push(paths.dashboard.packageDetails(itemId), promoState);
      } else {
        router.push(paths.dashboard.serviceDetails(itemId), promoState);
      }
      return;
    }

    const itemId = getItemId(item);

    if (!itemId) return;

    if (activeTab === 'packages') {
      router.push(paths.dashboard.packageDetails(itemId));
      return;
    }

    router.push(paths.dashboard.serviceDetails(itemId), { state: { service: item } });
  };

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('services')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('services') }]} sx={{ mb: { xs: 2.5, md: 3 } }} />

      <Stack spacing={2.5}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ '& .MuiTabs-indicator': { height: 3 } }}>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={<Iconify icon={tab.icon} width={18} />}
              label={`${t(tab.label)} (${tabCounts[tab.value] || 0})`}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('searchMarketplacePlaceholder')}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <AddressFilterField
            value={queryLocation?.address}
            onPlaceSelected={({ address, lat, lng }) => setQueryLocation({ address, lat, lng })}
            sx={{ flex: 1 }}
          />
        </Stack>

        {debouncedSearch.trim() && !isFetchingActiveTab && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('resultsForQuery', { count: tabCounts[activeTab] || 0, query: debouncedSearch.trim() })}
          </Typography>
        )}

        <Box
          key={activeTab}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {isFetchingActiveTab ? (
            Array.from({ length: LIMIT }).map((_, index) => <CardSkeleton key={index} />)
          ) : activeItems.length ? (
            activeItems.map((item) => {
              if (activeTab === 'promotions') {
                // The same service/package can carry more than one promotion, so its own _id
                // alone isn't a unique key here — combine it with the promotion's id.
                return (
                  <PromotionCard
                    key={`${item.promotionId || 'promo'}-${getItemId(item)}`}
                    svc={item}
                    providerName={item.providerName}
                    onView={() => handleOpenItem(item)}
                  />
                );
              }
              if (activeTab === 'packages') {
                return <PackageCard key={getItemId(item)} pkg={item} onView={() => handleOpenItem(item)} />;
              }
              return <ServiceCard key={getItemId(item)} svc={item} onView={() => handleOpenItem(item)} />;
            })
          ) : (
            <EmptyState icon={activeTabMeta.emptyIcon} title={t(activeTabMeta.emptyLabel)} searchValue={searchValue.trim()} onClearSearch={() => setSearchValue('')} />
          )}
        </Box>

        {!isFetchingActiveTab && activeItems.length > 0 && totalPages > 1 && (
          <Stack alignItems="center" sx={{ pt: 1 }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
          </Stack>
        )}
      </Stack>
    </DashboardContent>
  );
}
